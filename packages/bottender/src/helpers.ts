import Context from './context/Context';
import LineContext from './line/LineContext';
import MessengerContext from './messenger/MessengerContext';
import SlackContext from './slack/SlackContext';
import TelegramContext from './telegram/TelegramContext';
import ViberContext from './viber/ViberContext';
import WhatsappBusinessContext from './whatsapp-business/WhatsappBusinessContext';
import WhatsappContext from './whatsapp/WhatsappContext';
import { Channel } from './types';

export type ChannelContextType = {
  [Channel.Messenger]: MessengerContext;
  [Channel.Line]: LineContext;
  [Channel.Telegram]: TelegramContext;
  [Channel.Slack]: SlackContext;
  [Channel.Viber]: ViberContext;
  [Channel.Whatsapp]: WhatsappContext;
  [Channel.WhatsappBusiness]: WhatsappBusinessContext;
};

type PlatformAction<Result = void> = (
  ctx: Context<any, any>
) => Result | Promise<Result>;

export function withPlatformAction<C extends Channel, Result = void>(
  platform: C,
  platformAction: (ctx: ChannelContextType[C]) => Result | Promise<Result>
): Record<C, PlatformAction<Result>> {
  // TODO: properly type this
  return { [platform]: platformAction } as any;
}

export function withComposePlatformActions<Result = void>(
  channelActions: Partial<Record<Channel, PlatformAction<Result>>>,
  fallbackAction: PlatformAction<Result>
): (context: Context<any, any>) => Result | Promise<Result> {
  return async (context: Context<any, any>) => {
    const channelAction =
      channelActions[context.platform as Channel] || fallbackAction;
    if (!channelAction) {
      throw new Error(`No action found for channel: ${context.platform}`);
    }

    return channelAction(context as any);
  };
}

export async function whenPlatform<C extends Channel, Result = void>(
  platform: C,
  ctx: Context<any, any>,
  platformAction: (ctx: ChannelContextType[C]) => Result | Promise<Result>
): Promise<Result | null> {
  if (ctx.platform === platform) {
    return platformAction(ctx as any);
  }

  return null;
}

export function checkPlatformContext<C extends Channel>(
  platform: C,
  ctx: Context<any, any>
): ctx is ChannelContextType[C] {
  return ctx.platform === platform;
}
