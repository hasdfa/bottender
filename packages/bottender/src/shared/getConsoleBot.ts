import path from 'path';

import { merge } from 'lodash';

import ConsoleBot from '../console/ConsoleBot';
import { Action, Bot, BottenderConfig, Plugin, getSessionStore } from '..';
import { ServerOptions } from '../server/Server';

import getBottenderConfig from './getBottenderConfig';

function getConsoleBot(options: ServerOptions): ConsoleBot {
  const bottenderConfig = getBottenderConfig(options);

  const { initialState, plugins } = merge(
    bottenderConfig /* , config */
  ) as BottenderConfig;

  const sessionStore = getSessionStore(options);

  // TODO: refine handler entry, improve error message and hint
  // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
  const Entry: Action<any, any> = require(path.resolve('index.js'));
  let ErrorEntry: Action<any, any>;
  try {
    // eslint-disable-next-line import/no-dynamic-require
    ErrorEntry = require(path.resolve('_error.js'));
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

  const bot = new ConsoleBot({
    fallbackMethods: true,
    sessionStore,
  });

  initializeBot(bot);

  return bot;
}

export default getConsoleBot;
