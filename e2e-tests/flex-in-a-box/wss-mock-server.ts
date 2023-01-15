// based on https://gist.github.com/jedireza/9b39e88079331ed0ff66ffaddaa800f6

import https from 'https';
import { Server, WebSocket } from 'ws';
import { promisify } from 'util';

export const secureWebsocketServer = (
  { key, cert }: { key: string; cert: string },
  port: number,
) => {
  const httpsServer = https.createServer({
    key,
    cert,
  });
  const wss = new Server({
    server: httpsServer,
  });

  httpsServer.on('request', (req, res) => {
    res.writeHead(200);
    res.end('hello HTTPS world\n');
  });
  const connectedSockets: Record<string, WebSocket> = {};

  wss.on('connection', (ws) => {
    console.log(`Websocket connection to mock server:`, JSON.stringify(ws));
    connectedSockets[ws.url] = ws;

    ws.on('message', (data) => {
      console.log(`message received: ${data}`);
    });
    ws.on('close', () => {
      console.log('socket closed');
    });
  });

  return {
    listen: () => {
      return new Promise<void>((resolve, reject) => {
        try {
          httpsServer.listen(port, () => resolve());
        } catch (err) {
          reject(err);
        }
      });
    },
    onConnection: (handler: (ws: WebSocket) => void) => {
      wss.on('connection', handler);
    },
    onMessage: (handler: (ws: WebSocket) => void) => {
      wss.on('connection', handler);
    },
    close: (): Promise<void> => {
      return promisify(wss.close)();
    },
  };
};

export type MockSecureWebsocketServer = ReturnType<typeof secureWebsocketServer>;
