/* eslint-disable @typescript-eslint/naming-convention */
import { RawData, WebSocket } from 'ws';
import { getLiveQueryData } from './twilsock-live-query';
type TwilsockVersion = `V3.0 ${number}`;
type TwilioMessageSid = `TM${string}`;
type TwilsockHeader = {
  id: TwilioMessageSid;
  payload_size: number;
  method: 'init' | 'message' | 'reply' | 'ping';
} & Record<string, any>;

type TwilsockMessage = { header: TwilsockHeader; body?: any; version?: TwilsockVersion };

type Registration = {
  product: 'flex_insights';
  type: 'ers';
  message_types: string[];
  notification_protocol_version: number;
};

const acceptResponse = (id: TwilioMessageSid, registrations: Registration[]): TwilsockHeader => {
  return {
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
    init_registrations: registrations.map((registration) => {
      const { notification_protocol_version, ...restOfRegistration } = registration;
      return {
        notification_ctx_id: 'NOTIFICATION_CTX_ID',
        ...restOfRegistration,
      };
    }),
  };
};

const eventsResponse = (id: TwilioMessageSid, eventsToAcknowledge: number): TwilsockMessage => {
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

const liveQueryResponse = (
  id: `TM${string}`,
  twilioRequestId: `RQ${string}`,
  path: string,
  queryString: string,
): TwilsockMessage => {
  const items = getLiveQueryData(path, queryString);
  const body = {
    items,
    items_count: items.length,
    meta: { next_token: null, previous_token: null, encode_token: false, direct_token: true },
    query_id: encodeURIComponent(`QR_${path}_${queryString}`),
    last_event_id: 1,
  };
  const bodySize = JSON.stringify(body).length;
  return {
    header: {
      method: 'reply',
      id,
      payload_size: bodySize,
      payload_type: 'application/json',
      status: { code: 200, status: 'OK' },
      http_headers: {
        server: 'envoy',
        date: new Date().toUTCString(),
        'content-type': 'application/json',
        'content-length': bodySize.toString(),
        'twilio-request-id': twilioRequestId,
        'x-shenanigans': 'none',
        'strict-transport-security': 'max-age=31536000',
        'x-envoy-upstream-service-time': '13',
      },
      http_status: { code: 200, status: 'OK' },
    },
    body,
    version: 'V3.0 488',
  };
};

let pingCounter = 0;

const pingHeader = (): TwilsockHeader => ({
  id: `TM_SERVER_PING_${++pingCounter}`,
  method: 'ping',
  payload_size: 0,
});

export const twilsockSocket = (
  websocket: WebSocket,
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
  ): { version: TwilsockVersion; header: TwilsockHeader; body?: any } => {
    const messageString = decoder.decode(message);
    const [messageVersion, headerString, bodyString] = messageString.split('\r\n');
    const withoutBody = {
      version: messageVersion as TwilsockVersion,
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
        websocket.send(
          serializeOutgoing({ header: acceptResponse(header.id, header.registrations ?? []) }),
        );
      }
      if (header.method === 'message' && body) {
        const { events, type } = body;
        if (type === 'live_query') {
          websocket.send(
            serializeOutgoing(
              liveQueryResponse(
                header.id,
                header['Twilio-Request-id'],
                header.http_request?.path,
                body.query_string,
              ),
            ),
          );
        }
        if (Array.isArray(events)) {
          websocket.send(serializeOutgoing(eventsResponse(header.id, events.length)));
        }
      }
    } catch (err) {
      console.warn('Failed to deserialize twilsock message:', err);
    }
  };
  websocket.on('message', processIncomingMessage);

  //Keepalive
  const pingInterval = setInterval(
    () => websocket.send(serializeOutgoing({ header: pingHeader(), version: 'V3.0 76' })),
    30 * 1000,
  );
  websocket.on('close', () => clearInterval(pingInterval));
  return {};
};
