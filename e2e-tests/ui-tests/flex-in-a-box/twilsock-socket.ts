/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * This module mocks a WSS socket that expects to use Twilios Twilsock protocol
 * It sets up the basic Twilsock handshake and then allows for the sending and receiving of messages
 *
 */

import { RawData, WebSocket } from 'ws';
import {
  createLiveQuery,
  getLiveQueryData,
  LiveQueryItem,
  QuerySid,
  subscribeToLiveQueryUpdates,
} from './twilsock-live-query';
type TwilioMessageSid = `TM${string}`;
type TwilsockHeader = {
  id: TwilioMessageSid;
  payload_size: number;
  method: 'init' | 'message' | 'reply' | 'ping' | 'notification';
} & Record<string, any>;

type TwilsockMessage = { header: TwilsockHeader; body?: any };

type Registration = {
  product: 'flex_insights';
  type: 'ers';
  message_types: string[];
  notification_protocol_version: number;
};

let lastEventId = 0;
let queryCounter = 0;
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
  };
};

const liveQueryResponse = (
  id: `TM${string}`,
  twilioRequestId: `RQ${string}`,
  path: string,
  queryString: string,
  querySid: QuerySid,
): TwilsockMessage => {
  const items = getLiveQueryData(path, queryString);
  lastEventId = Date.now();
  const body = {
    items,
    items_count: items.length,
    meta: { next_token: null, previous_token: null, encode_token: false, direct_token: true },
    query_id: querySid,
    last_event_id: lastEventId,
  };
  const bodySize = JSON.stringify(body).length;
  const header = {
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
  } as const;
  return {
    header,
    body,
  };
};

const liveQueryAcceptSubscriptions = (
  id: `TM${string}`,
  twilioRequestId: `RQ${string}`,
): TwilsockMessage => {
  const body = { estimated_delivery_in_ms: 10000, max_batch_size: 1000, ttl_in_s: 86400 };
  const bodySize = JSON.stringify(body).length;
  return {
    header: {
      method: 'reply',
      id,
      payload_size: bodySize,
      payload_type: 'application/json;charset=utf-8',
      status: { code: 200, status: 'OK' },
      http_headers: {
        server: 'envoy',
        date: new Date().toUTCString(),
        'content-type': 'application/json;charset=utf-8',
        'content-length': bodySize.toString(),
        'twilio-request-id': twilioRequestId,
        'x-shenanigans': 'none',
        'strict-transport-security': 'max-age=31536000',
        'x-envoy-upstream-service-time': '10',
      },
      http_status: { code: 202, status: 'Accepted' },
    },
    body: { estimated_delivery_in_ms: 10000, max_batch_size: 1000, ttl_in_s: 86400 },
  };
};

let liveQueryUpdateCounter = 0;

const liveQueryUpdate = (
  twilioRequestId: `RQ${string}`,
  correlationId: number,
  querySid: QuerySid,
  items: LiveQueryItem[],
): TwilsockMessage => {
  lastEventId = Date.now();
  const body = {
    event_type: 'live_query_updated',
    correlation_id: correlationId,
    event_protocol_version: 3,
    event: {
      items,
      items_count: items.length,
      meta: { next_token: null, previous_token: null, encode_token: false, direct_token: true },
      query_id: querySid,
      last_event_id: lastEventId,
    },
    strictly_ordered: true,
  };
  const bodySize = JSON.stringify(body).length;
  return {
    header: {
      method: 'notification',
      id: `TM_LIVE_QUERY_UPDATE_${++liveQueryUpdateCounter}`,
      payload_size: bodySize,
      payload_type: 'application/json',
      message_type: 'twilio.sync.event',
      notification_ctx_id: '',
    },
    body,
  };
};

let liveQueryEstablishSubscriptionCounter = 0;
const liveQueryEstablishSubscription = (
  twilioRequestId: `RQ${string}`,
  correlationId: number,
  querySid: QuerySid,
): TwilsockMessage => {
  const body = {
    event_type: 'subscription_established',
    correlation_id: correlationId,
    event_protocol_version: 3,
    event: {
      object_sid: querySid,
      object_type: 'live_query',
      replay_status: 'completed',
      last_event_id: lastEventId,
    },
  };
  const bodySize = JSON.stringify(body).length;
  return {
    header: {
      method: 'notification',
      id: `TM_LIVE_QUERY_SUBSCRIPTION_ESTABLISHED_${++liveQueryEstablishSubscriptionCounter}`,
      payload_size: bodySize,
      payload_type: 'application/json',
      message_type: 'twilio.sync.event',
      notification_ctx_id: '',
    },
    body,
  };
};

let pingCounter = 0;

const pingHeader = (): TwilsockHeader => ({
  id: `TM_SERVER_PING_${++pingCounter}`,
  method: 'ping',
  payload_size: 0,
});

export const twilsockSocket = (websocket: WebSocket) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const serializeOutgoing = ({ header, body }: TwilsockMessage) => {
    const textHeader = JSON.stringify(header);
    const textPayload = `TWILSOCK V3.0 ${textHeader.length}\r\n${textHeader}\r\n${
      body ? `${JSON.stringify(body)}\r\n` : ''
    }`;
    console.log('SENDING TWILSOCK MESSAGE:', textPayload);
    return encoder.encode(textPayload);
  };

  const deserializeIncoming = (message: ArrayBuffer): { header: TwilsockHeader; body?: any } => {
    const messageString = decoder.decode(message);
    const [, headerString, bodyString] = messageString.split('\r\n');
    const withoutBody = {
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
        console.log('TWILSOCK MESSAGE RECEIVED', header, body);
        const { events, type, action, requests } = body;
        const twilioRequestId = (header.http_request?.headers ?? {})['Twilio-Request-Id'];
        if (type === 'live_query') {
          console.log(
            'TWILSOCK LIVE QUERY RECEIVED',
            header.http_request?.path,
            body.query_string || 'EMPTY_QS',
            twilioRequestId,
          );
          const queryString = body.query_string;
          const { path } = header.http_request ?? {};
          const querySid: QuerySid = `QR_${++queryCounter}`;
          createLiveQuery(path, queryString, querySid);
          websocket.send(
            serializeOutgoing(
              liveQueryResponse(header.id, twilioRequestId, path, queryString, querySid),
            ),
          );
        }
        if (action === 'establish' && Array.isArray(requests)) {
          console.log('TWILSOCK SUBSCRIPTION RECEIVED');
          websocket.send(
            serializeOutgoing(liveQueryAcceptSubscriptions(header.id, twilioRequestId)),
          );
          requests.forEach((req) => {
            if (req.last_event_id) {
              lastEventId = Math.max(req.last_event_id, lastEventId);
            }
            subscribeToLiveQueryUpdates(req.object_sid, (update) => {
              websocket.send(
                serializeOutgoing(
                  liveQueryUpdate(twilioRequestId, body.correlation_id, req.object_sid, update),
                ),
              );
            });
            websocket.send(
              serializeOutgoing(
                liveQueryEstablishSubscription(
                  twilioRequestId,
                  body.correlation_id,
                  req.object_sid,
                ),
              ),
            );
          });
        }
        if (Array.isArray(events)) {
          console.log('TWILSOCK EVENTS RECEIVED');
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
    () => websocket.send(serializeOutgoing({ header: pingHeader() })),
    30 * 1000,
  );
  websocket.on('close', () => clearInterval(pingInterval));
  return {};
};
