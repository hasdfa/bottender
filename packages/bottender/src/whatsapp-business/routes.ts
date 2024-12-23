import Context from '../context/Context';
import { Action, Channel } from '../types';
import { RoutePredicate, route } from '../router';

import WhatsappContext from './WhatsappBusinessContext';

type Route = <C extends Context>(
  action: Action<WhatsappContext, any>
) => {
  predicate: RoutePredicate<C>;
  action: Action<WhatsappContext, any>;
};

type Whatsapp = Route & {
  any: Route;
  message: Route;
  media: Route;
  received: Route;
  sent: Route;
  delivered: Route;
  read: Route;
};

const whatsappBusiness: Whatsapp = <C extends Context>(
  action: Action<WhatsappContext, any>
) => {
  return route(
    (context: C) => context.platform === Channel.WhatsappBusiness,
    action
  );
};

whatsappBusiness.any = whatsappBusiness;

function message<C extends Context>(action: Action<WhatsappContext, any>) {
  return route(
    (context: C) =>
      context.platform === Channel.WhatsappBusiness && context.event.isMessage,
    action
  );
}

whatsappBusiness.message = message;

function media<C extends Context>(action: Action<WhatsappContext, any>) {
  return route(
    (context: C) =>
      context.platform === Channel.WhatsappBusiness && context.event.isMedia,
    action
  );
}

whatsappBusiness.media = media;

function received<C extends Context>(action: Action<WhatsappContext, any>) {
  return route(
    (context: C) =>
      context.platform === Channel.WhatsappBusiness && context.event.isReceived,
    action
  );
}

whatsappBusiness.received = received;

function sent<C extends Context>(action: Action<WhatsappContext, any>) {
  return route(
    (context: C) =>
      context.platform === Channel.WhatsappBusiness && context.event.isSent,
    action
  );
}

whatsappBusiness.sent = sent;

function delivered<C extends Context>(action: Action<WhatsappContext, any>) {
  return route(
    (context: C) =>
      context.platform === Channel.WhatsappBusiness &&
      context.event.isDelivered,
    action
  );
}

whatsappBusiness.delivered = delivered;

function read<C extends Context>(action: Action<WhatsappContext, any>) {
  return route(
    (context: C) =>
      context.platform === Channel.WhatsappBusiness && context.event.isRead,
    action
  );
}

whatsappBusiness.read = read;

export default whatsappBusiness;
