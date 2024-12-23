import { LineClient } from 'messaging-api-line';
import { MessengerClient } from 'messaging-api-messenger';
import { SlackOAuthClient } from 'messaging-api-slack';
import { TelegramClient } from 'messaging-api-telegram';
import { ViberClient } from 'messaging-api-viber';

import LineBot from '../line/LineBot';
import MessengerBot from '../messenger/MessengerBot';
import MetaClient from '../whatsapp-business/MetaClient';
import SlackBot from '../slack/SlackBot';
import TelegramBot from '../telegram/TelegramBot';
import TwilioClient from '../whatsapp/TwilioClient';
import ViberBot from '../viber/ViberBot';
import WhatsappBot from '../whatsapp/WhatsappBot';
import WhatsappBusinessBot from '../whatsapp-business/WhatsappBusinessBot';
import { AvailableChannelsType, Channel } from '../types';
import { ServerOptions } from '../server/Server';

import getBottenderConfig from './getBottenderConfig';
import getSessionStore from './getSessionStore';

const BOT_MAP = {
  [Channel.Messenger]: MessengerBot,
  [Channel.Line]: LineBot,
  [Channel.Slack]: SlackBot,
  [Channel.Telegram]: TelegramBot,
  [Channel.Viber]: ViberBot,
  [Channel.Whatsapp]: WhatsappBot,
  [Channel.WhatsappBusiness]: WhatsappBusinessBot,
};

function getClient<C extends AvailableChannelsType>(
  channel: C,
  options?: ServerOptions
): C extends Channel.Messenger
  ? MessengerClient
  : C extends Channel.Line
  ? LineClient
  : C extends Channel.Slack
  ? SlackOAuthClient
  : C extends Channel.Telegram
  ? TelegramClient
  : C extends Channel.Viber
  ? ViberClient
  : C extends Channel.Whatsapp
  ? TwilioClient
  : C extends Channel.WhatsappBusiness
  ? MetaClient
  : any {
  const { channels = {} } = getBottenderConfig(options);
  const sessionStore = getSessionStore(options);

  const channelConfig = (channels as Record<string, any>)[channel];

  if (!channelConfig) {
    throw new Error(
      `getClient: ${channel} config is missing in \`bottender.config.js\`.`
    );
  }

  const ChannelBot = BOT_MAP[channel as Channel];

  const channelBot = new ChannelBot({
    ...channelConfig,
    sessionStore,
  } as any);

  return channelBot.connector.client as any;
}

export default getClient;
