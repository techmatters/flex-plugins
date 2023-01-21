import { RawData, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

const decoder = new TextDecoder();

export const enum TwilioWebsocketType {
  Twilsock = 'twilsock',
  ChunderW = 'chunderw',
  Other = 'other',
}

export const identifySocketType = (
  ws: WebSocket,
  upgradeMessage: IncomingMessage,
  initialMessage: RawData,
): TwilioWebsocketType => {
  const textMessage = decoder.decode(initialMessage as ArrayBuffer);
  if (textMessage.startsWith('TWILSOCK')) return TwilioWebsocketType.Twilsock;
  if (
    ['"type"', '"listen"', '"browserinfo"', '"plugin"'].every((expectedFragment) =>
      textMessage.includes(expectedFragment),
    )
  ) {
    return TwilioWebsocketType.ChunderW;
  }
  return TwilioWebsocketType.Other;
};
