import path from 'path';

import invariant from 'invariant';
import { merge } from 'lodash';
import { pascalcase } from 'messaging-api-common';

import {
  Action,
  AvailableChannels,
  AvailableChannelsType,
  Bot,
  BottenderConfig,
  ChannelBot,
  Plugin,
  getSessionStore,
} from '..';
import { ServerOptions } from '../server/Server';

import getBottenderConfig from './getBottenderConfig';

let channelBots: ChannelBot[] = [];

export function cleanChannelBots(): void {
  channelBots = [];
}

function getChannelBots(options?: ServerOptions): ChannelBot[] {
  if (channelBots.length > 0) {
    return channelBots;
  }

  const bottenderConfig = getBottenderConfig(options);

  const {
    initialState,
    plugins,
    channels = {},
  } = merge(bottenderConfig /* , config */) as BottenderConfig;

  const sessionStore = getSessionStore(options);

  // TODO: refine handler entry, improve error message and hint
  const Entry: Action<any, any> =
    // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
    options?.Entry || require(path.resolve('index.js'));
  let ErrorEntry: Action<any, any>;
  try {
    // eslint-disable-next-line import/no-dynamic-require
    ErrorEntry = options?.ErrorEntry || require(path.resolve('_error.js'));
  } catch (err) {} // eslint-disable-line no-empty

  function initializeBot(bot: Bot<any, any, any, any>): void {
    if (initialState) {
      bot.setInitialState(initialState);
    }

    if (plugins) {
      plugins.forEach((plugin: Plugin<any>) => {
        bot.use(plugin);
      });
    }

    bot.onEvent(Entry);
    if (ErrorEntry) {
      bot.onError(ErrorEntry);
    }
  }

  channelBots = (Object.entries(channels) as [string, any][])
    .filter(([, { enabled }]) => enabled)
    .map(
      ([
        channel,
        { path: webhookPath, sync, onRequest, connector, ...connectorConfig },
      ]) => {
        let channelConnector;
        if (AvailableChannels.includes(channel as AvailableChannelsType)) {
          // eslint-disable-next-line import/no-dynamic-require
          const ChannelConnector = require(`../${channel}/${pascalcase(
            channel
          )}Connector`).default;
          channelConnector = new ChannelConnector(connectorConfig);
        } else {
          invariant(connector, `The connector of ${channel} is missing.`);
          channelConnector = connector;
        }

        const channelBot = new Bot({
          sessionStore,
          sync,
          onRequest,
          connector: channelConnector,
        }) as Bot<any, any, any, any>;

        initializeBot(channelBot);

        return {
          webhookPath: webhookPath || `/webhooks/${channel}`,
          bot: channelBot,
        };
      }
    );

  return channelBots;
}

export default getChannelBots;
