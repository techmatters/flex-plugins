export const enum TwilioWebsocketType {
  Twilsock = 'twilsock',
  ChunderW = 'chunderw',
  Channels = 'channels',
  Other = 'other',
}

export const identifySocketType = (path: string = ''): TwilioWebsocketType => {
  if (path.startsWith('/signal')) return TwilioWebsocketType.ChunderW;
  if (path.startsWith('/v3/wsconnect')) return TwilioWebsocketType.Twilsock;
  if (path.startsWith('/v1/wschannels')) return TwilioWebsocketType.Channels;
  return TwilioWebsocketType.Other;
};
