import { RequestContext } from '../types';

type WhatsappRequestBody = {
  object: 'whatsapp_business_account';
  entry: Array<WhatsAppEntry>;
};

interface WhatsAppEntry {
  id: string;
  changes: Array<WhatsAppChange>;
}

type WhatsAppEventType = 'contacts' | 'messages' | 'statuses';

interface WhatsAppChange {
  value: WhatsAppWebhookValue;
  field: WhatsAppEventType;
}

interface WhatsAppWebhookValue {
  messaging_product: 'whatsapp';
  metadata: WhatsAppEventMetadata;
  contacts?: WhatsAppContactPayload[];
  messages?: WhatsAppMessagePayload[];
  statuses?: WhatsAppStatusPayload[];
}

interface WhatsAppEventMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

interface WhatsAppContactPayload {
  profile: {
    name: string;
  };
  wa_id: string;
}

type WhatsAppMessagePayload =
  | TextMessage
  | ReactionMessage
  | MediaMessage
  | StickerMessage
  | UnknownMessage
  | LocationMessage
  | ContactMessage
  | ButtonMessage
  | ListMessage
  | ReferralMessage
  | ProductInquiryMessage
  | OrderMessage
  | SystemMessage;

interface BaseMessage {
  from: string;
  id: string;
  timestamp: string;
}

interface TextMessage extends BaseMessage {
  type: 'text';
  text: {
    body: string;
  };
}

interface ReactionMessage extends BaseMessage {
  type: 'reaction';
  reaction: {
    message_id: string;
    emoji: string;
  };
}

interface MediaMessage extends BaseMessage {
  type: 'image' | 'video' | 'audio' | 'document';
  image?: MediaDetail;
  video?: MediaDetail;
  audio?: MediaDetail;
  document?: MediaDetail;
}

interface MediaDetail {
  caption?: string;
  mime_type: string;
  sha256: string;
  id: string;
}

interface StickerMessage extends BaseMessage {
  type: 'sticker';
  sticker: {
    mime_type: string;
    sha256: string;
    id: string;
  };
}

interface UnknownMessage extends BaseMessage {
  type: 'unknown' | 'unsupported';
  errors: ErrorDetail[];
}

interface ErrorDetail {
  code: number;
  details: string;
  title: string;
}

interface LocationMessage extends BaseMessage {
  type: 'location';
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

interface ContactMessage extends BaseMessage {
  type: 'contacts';
  contacts: ContactDetail[];
}

interface ContactDetail {
  addresses?: Address[];
  birthday?: string;
  emails?: Email[];
  name: Name;
  org?: Organization;
  phones?: Phone[];
  urls?: URL[];
}

interface Address {
  city?: string;
  country?: string;
  country_code?: string;
  state?: string;
  street?: string;
  type?: string;
  zip?: string;
}

interface Email {
  email: string;
  type?: string;
}

interface Name {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

interface Organization {
  company?: string;
  department?: string;
  title?: string;
}

interface Phone {
  phone: string;
  wa_id?: string;
  type?: string;
}

interface URL {
  url: string;
  type?: string;
}

interface ButtonMessage extends BaseMessage {
  type: 'button';
  button: {
    text: string;
    payload: string;
  };
}

interface ListMessage extends BaseMessage {
  type: 'interactive';
  interactive: {
    list_reply: {
      id: string;
      title: string;
      description?: string;
    };
    type: 'list_reply';
  };
}

interface ReferralMessage extends BaseMessage {
  type: 'text';
  text: {
    body: string;
  };
  referral: ReferralDetail;
}

interface ReferralDetail {
  source_url: string;
  source_id: string;
  source_type: string;
  headline: string;
  body: string;
  media_type: string;
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  ctwa_clid?: string;
}

interface ProductInquiryMessage extends BaseMessage {
  type: 'text';
  text: {
    body: string;
  };
  context: {
    from: string;
    id: string;
    referred_product: {
      catalog_id: string;
      product_retailer_id: string;
    };
  };
}

interface OrderMessage extends BaseMessage {
  type: 'order';
  order: {
    catalog_id: string;
    product_items: ProductItem[];
    text: string;
  };
  context: {
    from: string;
    id: string;
  };
}

interface ProductItem {
  product_retailer_id: string;
  quantity: string;
  item_price: string;
  currency: string;
}

interface SystemMessage extends BaseMessage {
  type: 'system';
  system: {
    body: string;
    new_wa_id?: string;
    type: 'user_changed_number';
  };
}

interface WhatsAppStatusPayload {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: ErrorDetail[];
}

// @ts-expect-error - Because of union of string literal types
type WhatsappRequestContext = RequestContext<WhatsappRequestBody>;

export {
  WhatsAppEventType,
  WhatsappRequestBody,
  WhatsappRequestContext,
  WhatsAppContactPayload,
  WhatsAppMessagePayload,
  WhatsAppStatusPayload,
  WhatsAppChange,
  WhatsAppEntry,
  WhatsAppEventMetadata,
};
