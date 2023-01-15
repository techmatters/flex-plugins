// eslint-disable-next-line import/no-extraneous-dependencies
import { Mockttp, getLocal, generateCACertificate, MockedEndpoint } from 'mockttp';
import { secureWebsocketServer, MockSecureWebsocketServer } from './wss-mock-server';
import { twilsockServer } from './twilsock-server';

export const MOCKTTP_SERVER_PORT = process.env.PROXY_SERVER_PORT
  ? Number.parseInt(process.env.PROXY_SERVER_PORT)
  : 4000;
const WEBSOCKET_SERVER_PORT = process.env.WEBSOCKET_SERVER_PORT
  ? Number.parseInt(process.env.WEBSOCKET_SERVER_PORT)
  : 4001;

let mockServer: Mockttp;
let mockWebsocketServer: MockSecureWebsocketServer;
let websocketEndpoint: MockedEndpoint;

/**
 * The Mockttp server should only be required to mock webscocket interactions
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
    mockWebsocketServer = secureWebsocketServer(wss, WEBSOCKET_SERVER_PORT);
  }
  return mockServer;
}

export async function start(): Promise<any> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const server = await mockttpServer();
  await mockWebsocketServer.listen();
  twilsockServer(mockWebsocketServer);
  console.log('WEBSOCKET SERVER LISTENING FOR CONNECTIONS');

  await server.start(MOCKTTP_SERVER_PORT);
  console.log('STARTED MOCK / PROXY SERVER');
  await server.forAnyRequest().thenPassThrough();
  websocketEndpoint = await server
    .forAnyWebSocket()
    .thenForwardTo(`localhost:${WEBSOCKET_SERVER_PORT}`, {
      ignoreHostHttpsErrors: ['localhost', `localhost:${WEBSOCKET_SERVER_PORT}`],
    });
  console.log('WEBSOCKETS NOW BEING PROXIED TO MOCK WSS SERVER');

  return {};
}

export async function stop(): Promise<void> {
  const server = await mockttpServer();
  await server.stop();
  await mockWebsocketServer?.close();
  const websocketRequests = (await websocketEndpoint?.getSeenRequests()) ?? [];
  websocketRequests.forEach((r) => console.log('WEBSOCKET REQUEST PROXIED:', JSON.stringify(r)));
}
