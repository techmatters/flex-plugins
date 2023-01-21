import { RawData, WebSocket } from 'ws';
type TwilsockVersion = `V3.0 ${number}`;
type TwilsockHeader = {
  id: string;
  payload_size: number;
  method: 'init' | 'message' | 'reply';
} & Record<string, any>;

type TwilsockMessage = { header: TwilsockHeader; body?: any; version?: TwilsockVersion };

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

const eventsResponse = (id: string, eventsToAcknowledge: number): TwilsockMessage => {
  const body = { number_of_successful_events: eventsToAcknowledge, number_of_failed_events: 0 };
  const bodySize = JSON.stringify(body).length;
  return {
    header: {
      method: 'reply',
      id,
      payload_size: bodySize,
      payload_type: 'application/json',
      status: { code: 200, status: 'OK' },
      http_headers: {
        date: new Date().toUTCString(),
        'content-type': 'application/json',
        'content-length': bodySize.toString(),
        'x-envoy-upstream-service-time': '14',
        server: 'envoy',
      },
      http_status: { code: 200, status: 'OK' },
    },
    body,
    version: 'V3.0 359',
  };
};

export const twilsockSocket = (
  websocket: WebSocket,
  initialMessage: RawData,
  defaultVersion: TwilsockVersion = 'V3.0 2213',
) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const serializeOutgoing = ({ header, body, version = defaultVersion }: TwilsockMessage) => {
    const textPayload = `TWILSOCK ${version}\r\n${JSON.stringify(header)}\r\n${
      body ? `${JSON.stringify(body)}\r\n` : ''
    }`;
    console.log('SENDING TWILSOCK MESSAGE:', textPayload);
    return encoder.encode(textPayload);
  };

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

  const processIncomingMessage = (data: RawData) => {
    try {
      const { header, body } = deserializeIncoming(data as ArrayBuffer);
      if (header.method === 'init') {
        websocket.send(serializeOutgoing({ header: acceptResponse(header.id) }));
      }
      if (header.method === 'message' && body) {
        const { events } = body;
        if (Array.isArray(events)) {
          websocket.send(serializeOutgoing(eventsResponse(header.id, events.length)));
        }
      }
    } catch (err) {
      console.warn('Failed to deserialize twilsock message:', err);
    }
  };
  websocket.on('message', processIncomingMessage);
  processIncomingMessage(initialMessage);
};
