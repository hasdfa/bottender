import { JsonObject } from 'type-fest';

import { Event } from '../context/Event';

import {
  WhatsAppChange,
  WhatsAppEntry,
  WhatsAppEventMetadata,
  WhatsAppEventType,
  WhatsAppMessagePayload,
  WhatsAppStatusPayload,
} from './WhatsappBusinessTypes';

export default class BaseWhatsappBusinessEvent<
  T extends WhatsAppMessagePayload | WhatsAppStatusPayload =
    | WhatsAppMessagePayload
    | WhatsAppStatusPayload
> implements Event<T>
{
  _rawEvent: T;

  _eventType: WhatsAppEventType;

  _metadata: WhatsAppEventMetadata;

  _entry: WhatsAppEntry;

  _change: WhatsAppChange;

  constructor(
    rawEvent: T,
    eventType: WhatsAppEventType,
    metadata: WhatsAppEventMetadata,
    change: WhatsAppChange,
    entry: WhatsAppEntry
  ) {
    this._rawEvent = rawEvent;
    this._eventType = eventType;
    this._metadata = metadata;
    this._change = change;
    this._entry = entry;
  }

  get waBAId(): string {
    return this._entry.id;
  }

  getContact(waId: string) {
    return this._change.value.contacts?.find(
      (contact) => contact.wa_id === waId
    );
  }

  get rawEvent(): T {
    return this._rawEvent;
  }

  get isMessage(): boolean {
    return this._eventType === 'messages';
  }

  get isStatus(): boolean {
    return this._eventType === 'statuses';
  }

  get waMessage(): WhatsAppMessagePayload | null {
    return this.isMessage ? (this._rawEvent as WhatsAppMessagePayload) : null;
  }

  get message(): JsonObject | null {
    // @ts-expect-error
    return this.waMessage || this.waStatus;
  }

  get waStatus(): WhatsAppStatusPayload | null {
    return this.isStatus ? (this._rawEvent as WhatsAppStatusPayload) : null;
  }

  get isText(): boolean {
    return this.isMessage && this.waMessage?.type === 'text';
  }

  get text(): string | null {
    return this.waMessage?.type === 'text' ? this.waMessage?.text?.body : null;
  }

  get isReceived(): boolean {
    return this.isMessage;
  }

  get isSent(): boolean {
    return this.waStatus?.status === 'sent';
  }

  get isDelivered(): boolean {
    return this.waStatus?.status === 'delivered';
  }

  get isRead(): boolean {
    return this.waStatus?.status === 'read';
  }
}
