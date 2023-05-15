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

// based on https://gist.github.com/jedireza/9b39e88079331ed0ff66ffaddaa800f6

import https from 'https';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

/**
 * Creates a mock secure websocket server
 * This module just takes care of the boilerplate of creating a secure websocket server
 * and handling the initial handshake / connection event
 * Actual mocking is taken care of by the handler you pass in to onConnection
 * @param key
 * @param cert
 */
export const secureWebsocketServer = ({ key, cert }: { key: string; cert: string }) => {
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
          httpsServer.listen(0, () => resolve());
        } catch (err) {
          reject(err);
        }
      });
    },
    /**
     * This is the main entry point for mocking
     * You would typicaly set up this mock via the twilio-wss-mock-server wrapper rather than calling this directly
     * @param handler
     */
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
        httpsServer.close((err) => (err ? reject(err) : resolve()));
      });
    },
    port: (): number => {
      const address = httpsServer.address();
      if (!address) {
        throw new Error(
          'Attempted to retrieve port before server was listening, returning undefined',
        );
      } else if (typeof address === 'string') {
        throw new Error(
          `Attempted to retrieve port expecting AddressInfo structure for server address, got string '${address}' instead`,
        );
      } else {
        return address.port;
      }
    },
  };
};

export type MockSecureWebsocketServer = ReturnType<typeof secureWebsocketServer>;
