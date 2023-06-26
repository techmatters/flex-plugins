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

// eslint-disable-next-line import/no-extraneous-dependencies
import { Mockttp, getLocal, generateCACertificate, MockedEndpoint } from 'mockttp';
import { secureWebsocketServer, MockSecureWebsocketServer } from './wss-mock-server';
import { twilioWssMockServer } from './twilio-wss-mock-server';

export const MOCKTTP_SERVER_PORT = process.env.PROXY_SERVER_PORT
  ? Number.parseInt(process.env.PROXY_SERVER_PORT)
  : 4000;

let mockServer: Mockttp | undefined;
let mockWebsocketServer: MockSecureWebsocketServer;
let websocketEndpoint: MockedEndpoint;

/**
 * A wrapper for mockttp for use mocking wss connections
 * It actually starts 2 in process servers:
 *   * The mockttp server which acts as a proxy for the https handshake and websocket data
 *   * A mock wss server implemented in wss-mock-server.ts, which handles the actual handshake and allows mocked responses
 * The mockttp server handles the HTTP based wss handshake, and then proxies the actual connection to the mock wss server
 * The Mockttp server should only be required to mock websocket interactions
 * HTTP calls can be stubbed using playwrights page.route API
 */
async function mockttpServer() {
  if (!mockServer) {
    console.log('CREATING ENDPOINT SERVER');
    const https = await generateCACertificate();
    const wss = await generateCACertificate({ commonName: 'Mock WSS Server' });
    // Just wave through them self signed certs... :-/
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    mockServer = getLocal({ https });
    mockWebsocketServer = secureWebsocketServer(wss);
  }
  return mockServer;
}

export async function start(): Promise<any> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const server = await mockttpServer();
  twilioWssMockServer(mockWebsocketServer);
  await mockWebsocketServer.listen();
  console.log('WEBSOCKET SERVER LISTENING FOR CONNECTIONS');

  await server.start();
  console.log(`STARTED MOCK / PROXY SERVER ON PORT ${server.port}`);
  await server.forAnyRequest().thenPassThrough();
  websocketEndpoint = await server
    .forAnyWebSocket()
    .thenForwardTo(`localhost:${mockWebsocketServer.port()}`, {
      ignoreHostHttpsErrors: ['localhost', `localhost:${mockWebsocketServer.port()}`],
    });
  console.log(
    `WEBSOCKETS NOW BEING PROXIED TO MOCK WSS SERVER ON PORT ${mockWebsocketServer.port()}`,
  );

  return {};
}

export async function stop(): Promise<void> {
  const server = await mockttpServer();
  await server.stop();
  mockServer = undefined;
  await mockWebsocketServer?.close();
  const websocketRequests = (await websocketEndpoint?.getSeenRequests()) ?? [];
  websocketRequests.forEach((r) => console.log('WEBSOCKET REQUEST PROXIED:', r.url));
}

export function port(): number {
  return mockServer!.port;
}
