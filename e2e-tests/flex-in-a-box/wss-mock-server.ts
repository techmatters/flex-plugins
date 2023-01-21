// based on https://gist.github.com/jedireza/9b39e88079331ed0ff66ffaddaa800f6

import https from 'https';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

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
  httpsServer.on('connect', (inc) =>
    console.log('INCOMING CONNECT EVENT TO WSS HTTPS SERVER:', inc.url),
  );

  httpsServer.on('request', (req, res) => {
    console.log('INCOMING CONNECT EVENT TO WSS HTTPS SERVER:', req.url);
    res.writeHead(200);
    res.end('hello HTTPS world\n');
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
    onConnection: (handler: (ws: WebSocket, message: IncomingMessage, path?: string) => void) => {
      wss.on('headers', (ev, headerMessage) => {
        console.log('WSS HEADERS EVENT', JSON.stringify(ev), headerMessage.url ?? '(NO URL)');
        // Veeery hacky, just trying it
        wss.once('connection', (ws, message) => handler(ws, message, headerMessage.url));
      });
      wss.on('open', (ev) => {
        console.log('WSS OPEN EVENT', JSON.stringify(ev));
      });
      wss.on('close', () => {
        console.log('WSS CLOSE EVENT');
      });
    },
    close: (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        wss.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
};

export type MockSecureWebsocketServer = ReturnType<typeof secureWebsocketServer>;
