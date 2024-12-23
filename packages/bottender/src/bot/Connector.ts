import { EventEmitter } from 'events';

import { JsonObject } from 'type-fest';

import Session from '../session/Session';
import { Event } from '../context/Event';
import { RequestContext } from '../types';

type PlatformWithBodyArg = 'telegram' | 'slack' | 'viber' | 'whatsapp';

export interface Connector<
  B,
  C,
  P extends string = string,
  Ev extends Event<any> = Event<any>
> {
  client?: C;
  platform: P;
  getUniqueSessionKey(
    bodyOrEvent: P extends PlatformWithBodyArg ? B : Ev,
    requestContext?: RequestContext
  ): string | null;
  updateSession(
    session: Session,
    bodyOrEvent: P extends PlatformWithBodyArg ? B : Ev
  ): Promise<void>;
  mapRequestToEvents(body: B): Event<any>[];
  createContext(params: {
    event: Event<any>;
    session?: Session | null;
    initialState?: JsonObject | null;
    requestContext?: RequestContext;
    emitter?: EventEmitter | null;
  }): any;
}
