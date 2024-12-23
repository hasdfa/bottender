import { EventEmitter } from 'events';

import { JsonObject } from 'type-fest';

import Session from '../session/Session';
import { Connector } from '../bot/Connector';
import { RequestContext } from '../types';

import MetaClient from './MetaClient';
import WhatsappBusinessEvent from './WhatsappBusinessEvent';
import WhatsappContext from './WhatsappBusinessContext';
import {
  WhatsappRequestBody,
  WhatsappRequestContext,
} from './WhatsappBusinessTypes';

type ConnectorOptionsWithoutClient = {
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
};

type ConnectorOptionsWithClient = {
  client: MetaClient;
  verifyToken: string;
};

export type WhatsappBusinessConnectorOptions =
  | ConnectorOptionsWithoutClient
  | ConnectorOptionsWithClient;

export default class WhatsappConnector
  implements
    Connector<
      WhatsappRequestBody,
      MetaClient,
      'whatsapp-business',
      WhatsappBusinessEvent
    >
{
  private _client: MetaClient;

  private _verifyToken: string;

  constructor(options: WhatsappBusinessConnectorOptions) {
    if ('client' in options) {
      this._client = options.client;
    } else {
      const { phoneNumberId, accessToken } = options;

      this._client = new MetaClient({
        phoneNumberId,
        accessToken,
      });
    }

    this._verifyToken = options.verifyToken;
  }

  get platform(): 'whatsapp-business' {
    return 'whatsapp-business';
  }

  get client(): MetaClient {
    return this._client;
  }

  getUniqueSessionKey(event: WhatsappBusinessEvent): string | null {
    return event.waMessage?.id || event.waStatus?.id || Date.now().toString();
  }

  async updateSession(
    session: Session,
    event: WhatsappBusinessEvent
  ): Promise<void> {
    const userId = event.waMessage?.from || event.waStatus?.recipient_id;

    session.user = {
      _updatedAt: new Date().toISOString(),
      id: userId,
    };

    Object.freeze(session.user);
    Object.defineProperty(session, 'user', {
      configurable: false,
      enumerable: true,
      writable: false,
      value: session.user,
    });
  }

  mapRequestToEvents(body: WhatsappRequestBody): WhatsappBusinessEvent[] {
    const events: WhatsappBusinessEvent[] = [];
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.value.messages && change.value.messages.length > 0) {
          for (const message of change.value.messages!) {
            events.push(
              new WhatsappBusinessEvent(
                message,
                'messages',
                change.value.metadata,
                change,
                entry
              )
            );
          }
        }

        if (change.value.statuses && change.value.statuses.length > 0) {
          for (const status of change.value.statuses!) {
            events.push(
              new WhatsappBusinessEvent(
                status,
                'statuses',
                change.value.metadata,
                change,
                entry
              )
            );
          }
        }
      }
    }

    return events;
  }

  createContext(params: {
    event: WhatsappBusinessEvent;
    session: Session | null;
    initialState?: JsonObject | null;
    requestContext?: RequestContext;
    emitter?: EventEmitter | null;
  }): WhatsappContext {
    return new WhatsappContext({
      ...params,
      client: this._client,
    });
  }

  preprocess({ method, query, body }: WhatsappRequestContext) {
    if (method === 'GET') {
      // https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
      // to learn more about GET request for webhook verification
      const mode = query['hub.mode'];
      if (mode === 'subscribe') {
        const verifyToken = query['hub.verify_token'];
        if (verifyToken === this._verifyToken) {
          const challenge = query['hub.challenge'];
          return {
            response: {
              statusCode: 200,
              body: challenge.toString(),
              isBase64Encoded: false,
            },
          };
        }
        const responseBody = 'Error, wrong validation token';
        return {
          response: {
            statusCode: 403,
            body: JSON.stringify(responseBody),
            isBase64Encoded: false,
          },
        };
      }

      const responseBody = 'Error, wrong mode';
      return {
        response: {
          statusCode: 403,
          body: JSON.stringify(responseBody),
          isBase64Encoded: false,
        },
      };
    }

    if (method === 'POST') {
      // process POST request (WhatsApp chat messages)
      // https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
      // to learn about WhatsApp text message payload structure
      const entries = body.entry;
      if (entries.length > 0) {
        return {
          shouldNext: true,
        };
      }
    }

    return {
      response: {
        status: 403,
        body: 'Unsupported method',
      },
    };
  }
}
