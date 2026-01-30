import Bot, { OnRequest } from '../bot/Bot';
import SessionStore from '../session/SessionStore';

import MetaClient from './MetaClient';
import WhatsappConnector, {
  WhatsappBusinessConnectorOptions,
} from './WhatsappBusinessConnector';
import WhatsappContext from './WhatsappBusinessContext';
import WhatsappEvent from './WhatsappBusinessEvent';
import { WhatsappRequestBody } from './WhatsappBusinessTypes';

export default class WhatsappBot extends Bot<
  // @ts-expect-error - Because of union of string literal types
  WhatsappRequestBody,
  MetaClient,
  WhatsappEvent,
  WhatsappContext,
  'whatsapp-business'
> {
  constructor({
    sessionStore,
    sync,
    onRequest,
    ...connectorOptions
  }: WhatsappBusinessConnectorOptions & {
    sessionStore?: SessionStore;
    sync?: boolean;
    onRequest?: OnRequest;
  }) {
    const connector = new WhatsappConnector(connectorOptions);
    super({ connector, sessionStore, sync, onRequest });
  }
}
