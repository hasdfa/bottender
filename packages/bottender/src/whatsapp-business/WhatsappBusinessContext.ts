import Context from '../context/Context';

import MetaClient, {
  MetaMessageWithoutTo,
  MetaMessage_Text,
} from './MetaClient';
import WhatsappEvent from './WhatsappBusinessEvent';

// @ts-expect-error
class WhatsappContext extends Context<MetaClient, WhatsappEvent> {
  /**
   * The name of the platform.
   *
   */
  get platform(): 'whatsapp-business' {
    return 'whatsapp-business';
  }

  get recipientId() {
    return this._event.waMessage?.from ?? this._event.waStatus?.recipient_id;
  }

  async sendMessage(message: MetaMessageWithoutTo & { to?: string }) {
    return this._client.createMessage({
      to: this.recipientId!,
      ...message,
    });
  }

  async sendText(
    body: string,
    options?: Omit<MetaMessage_Text['text'], 'body'>
  ): Promise<any> {
    return this.sendMessage({
      type: 'text',
      text: {
        body,
        ...options,
      },
    });
  }

  async updateMessageStatus(status: string) {
    return this._client.updateMessageStatus(this.recipientId!, status);
  }

  async markAsRead() {
    return this.updateMessageStatus('read');
  }
}

export default WhatsappContext;
