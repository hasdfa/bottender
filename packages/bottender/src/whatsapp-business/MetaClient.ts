import AxiosError from 'axios-error';
import axios, { AxiosInstance } from 'axios';
import get from 'lodash/get';
import {
  OnRequestFunction,
  createRequestInterceptor,
} from 'messaging-api-common';

import { camelcaseKeys } from '../utils';

type MetaClientConfig = {
  phoneNumberId: string;
  accessToken: string;
};

function handleError(err: AxiosError): never {
  if (err.response && err.response.data) {
    const error = get(err, 'response.data', {});
    const msg = `WhatsApp API - ${error.code} ${error.message} ${error.more_info}`;
    throw new AxiosError(msg, err);
  }
  throw new AxiosError(err.message, err);
}

type MetaMediaType =
  | {
      id: string /* Only if using uploaded media */;
    }
  | {
      link: string /* Only if linking to your media */;
    };

interface MetaMessage_Template {
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<
      | {
          type: 'header' | 'body';
          parameters: Array<
            | {
                type: 'text';
                text: string;
              }
            | {
                type: 'image';
                image: {
                  link: string;
                };
              }
            | {
                type: 'currency';
                currency: {
                  fallback_value: string;
                  code: string;
                  amount_1000: number;
                };
              }
            | {
                type: 'date_time';
                date_time: {
                  fallback_value: string;
                };
              }
          >;
        }
      | {
          type: 'button';
          sub_type: 'quick_reply';
          index: string;
          parameters: [
            {
              type: 'payload';
              payload: string;
            }
          ];
        }
    >;
  };
}

interface MetaMessage_Text {
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

interface InteractiveMetaMessage_Address {
  type: 'address_message';
  body: {
    text: string;
  };
  action?: {
    name: 'address_message';
    parameters: {
      country?: string;
      name?: string;
      phone_number?: string;
      in_pin_code?: string;
      sg_post_code?: string;
      house_number?: string;
      floor_number?: string;
      tower_number?: string;
      building_name?: string;
      address?: string;
      landmark_area?: string;
      unit_number?: string;
      city?: string;
      state?: string;
    };
  };
}

interface InteractiveMetaMessage_CTAUrl {
  type: 'cta_url';
  header?: {
    type: 'text';
    text: string;
  };
  body?: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action?: {
    name: 'cta_url';
    parameters: {
      display_text: string;
      url: string;
    };
  };
}

interface InteractiveMetaMessage_List {
  type: 'list';
  header?: {
    type: 'text';
    text: string;
  };
  body?: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action?: {
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description: string;
      }>;
    }>;
    button: string;
  };
}

interface InteractiveMetaMessage_Button {
  type: 'button';
  header?: {
    type: 'text';
    text: string;
  };
  body?: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action?: {
    buttons: Array<{
      type: 'reply';
      reply: {
        id: string;
        title: string;
      };
    }>;
  };
}

interface InteractiveMetaMessage_RequestLocation {
  type: 'location_request_message';
  body?: {
    text: string;
  };
  action?: {
    name: 'send_location';
  };
}

interface MetaMessage_Interactive {
  type: 'interactive';
  interactive:
    | InteractiveMetaMessage_Address
    | InteractiveMetaMessage_CTAUrl
    | InteractiveMetaMessage_List
    | InteractiveMetaMessage_Button
    | InteractiveMetaMessage_RequestLocation;
}

interface MetaMessage_Audio {
  type: 'audio';
  audio: MetaMediaType;
}

interface MetaMessage_Image {
  type: 'image';
  image: MetaMediaType & {
    caption?: string;
  };
}

interface MetaMessage_Location {
  type: 'location';
  location: {
    latitude: string; // or number, depending on your requirements
    longitude: string; // or number, depending on your requirements
    name: string;
    address: string;
  };
}

interface MetaMessage_Contact {
  type: 'contacts';
  contacts: Array<{
    addresses?: Array<{
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      country_code?: string;
      type?: string;
    }>;
    birthday?: string;
    emails?: Array<{
      email: string;
      type: string;
    }>;
    name: {
      formatted_name: string;
      first_name?: string;
      last_name?: string;
      middle_name?: string;
      suffix?: string;
      prefix?: string;
    };
    org?: {
      company?: string;
      department?: string;
      title?: string;
    };
    phones?: Array<{
      phone: string;
      type: string;
      wa_id?: string;
    }>;
    urls?: Array<{
      url: string;
      type: string;
    }>;
  }>;
}

interface MetaMessage_Document {
  type: 'document';
  document: MetaMediaType & {
    caption?: string;
    filename?: string;
  };
}

interface MetaMessage_Reaction {
  type: 'reaction';
  reaction: {
    message_id: string;
    emoji: string;
  };
}

interface MetaMessage_Sticker {
  type: 'sticker';
  sticker: MetaMediaType;
}

interface MetaMessage_Video {
  type: 'video';
  video: MetaMediaType & {
    caption?: string;
  };
}

type MetaMessageWithoutTo = {
  recipient_type?: 'individual';
} & (
  | MetaMessage_Text
  | MetaMessage_Interactive
  | MetaMessage_Audio
  | MetaMessage_Contact
  | MetaMessage_Document
  | MetaMessage_Image
  | MetaMessage_Location
  | MetaMessage_Reaction
  | MetaMessage_Sticker
  | MetaMessage_Template
  | MetaMessage_Video
);

type MetaMessage = MetaMessageWithoutTo & {
  to: string;
};

interface MetaMessageResponse {
  messaging_product: 'whatsapp';
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
    message_status: string;
  }[];
}

export type {
  MetaMessage,
  MetaMessageWithoutTo,
  MetaMessageResponse,
  MetaMessage_Template,
  MetaMessage_Text,
  MetaMessage_Interactive,
  MetaMessage_Audio,
  MetaMessage_Image,
  MetaMessage_Location,
  MetaMessage_Contact,
  MetaMessage_Document,
  MetaMessage_Reaction,
  MetaMessage_Sticker,
  MetaMessage_Video,
};

export default class MetaClient {
  static connect(config: MetaClientConfig): MetaClient {
    return new MetaClient(config);
  }

  _onRequest: OnRequestFunction | undefined;

  _axios: AxiosInstance;

  constructor(config: MetaClientConfig) {
    this._axios = axios.create({
      baseURL: `https://graph.facebook.com/v21.0/${config.phoneNumberId}`,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
    });

    this._axios.interceptors.request.use(
      createRequestInterceptor({
        onRequest: this._onRequest,
      })
    );
  }

  get axios(): AxiosInstance {
    return this._axios;
  }

  async createMessage(message: MetaMessage) {
    try {
      const { data } = await this._axios.post<MetaMessageResponse>(
        '/messages',
        {
          ...message,
          messaging_product: 'whatsapp',
        }
      );

      return camelcaseKeys(data);
    } catch (err: any) {
      handleError(err);
    }
  }

  async updateMessageStatus(messageId: string, status: string) {
    try {
      const { data } = await this._axios.post<MetaMessageResponse>(
        '/messages',
        {
          messaging_product: 'whatsapp',
          message_id: messageId,
          status,
        }
      );

      return camelcaseKeys(data);
    } catch (err: any) {
      handleError(err);
    }
  }
}
