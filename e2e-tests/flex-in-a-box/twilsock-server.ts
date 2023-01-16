import { MockSecureWebsocketServer } from './wss-mock-server';
import { RawData } from 'ws';

type TwilsockHeader = {
  id: string;
  payload_size: number;
  method: 'init' | 'message' | 'reply';
} & Record<string, any>;

const acceptResponse = (id: string): TwilsockHeader => ({
  method: 'reply',
  id,
  payload_size: 0,
  status: { code: 200, status: 'OK' },
  capabilities: ['client_update', 'offline_storage'],
  continuation_token: 'WSS_CONTINUATION_TOKEN',
  continuation_token_status: {
    reissued: true,
    reissue_reason: 'MISSING',
    reissue_message: 'Continuation token is not provided',
  },
  offline_storage: {
    flex_insights: { storage_id: 'FLEX_INSIGHTS_OFFLINE_STORAGE_ID' },
    voice: { storage_id: 'VOICE_OFFLINE_STORAGE_ID' },
    flex: { storage_id: 'FLEX_OFFLINE_STORAGE_ID' },
    chat: { storage_id: 'CHAT_OFFLINE_STORAGE_ID' },
    data_sync: { storage_id: 'DATA_SYNC_OFFLINE_STORAGE_ID' },
    ip_messaging: { storage_id: 'IP_MESSAGING_OFFLINE_STORAGE_ID' },
  },
  init_registrations: [],
});

export const twilsockServer = (
  websocketServer: MockSecureWebsocketServer,
  version: string = '3.0 2213',
) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const serializeOutgoing = (payload: any) =>
    encoder.encode(`TWILSOCK V${version}\r\n${JSON.stringify(payload)}`);

  const deserializeIncoming = (
    message: ArrayBuffer,
  ): { version: string; header: TwilsockHeader; body?: any } => {
    const messageString = decoder.decode(message);
    const [messageVersion, headerString, bodyString] = messageString.split('\r\n');
    const withoutBody = {
      version: messageVersion,
      header: JSON.parse(headerString),
    };
    return bodyString
      ? {
          ...withoutBody,
          body: JSON.parse(bodyString),
        }
      : withoutBody;
  };

  websocketServer.onConnection((ws) => {
    ws.on('message', (data: RawData) => {
      const { header } = deserializeIncoming(data as ArrayBuffer);
      if (header.method === 'init') {
        ws.send(serializeOutgoing(acceptResponse(header.id)));
      }
    });
  });
};
