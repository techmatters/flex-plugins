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

import { RawData, WebSocket } from 'ws';

type ChunderWMessage = {
  type: 'connected' | 'listen' | 'register' | 'ready';
  version: string;
} & Record<string, any>;

const CONNECT_MESSAGE: ChunderWMessage = {
  payload: {
    region: 'FAKE_REGION',
    gateway: 'fake.chunderw.gateway',
    home: 'aa1',
  },
  type: 'connected',
  version: '',
};

const READY_MESSAGE: ChunderWMessage = { payload: {}, type: 'ready', version: '' };

export const twilioChunderwSocket = (websocket: WebSocket) => {
  const decoder = new TextDecoder();

  const sendMessage = (message: ChunderWMessage) => {
    websocket.send(JSON.stringify(message));
  };

  const sendBlank = () => {
    websocket.send('\n');
  };
  let keepAliveInterval: NodeJS.Timer;

  const processIncomingMessage = (data: RawData) => {
    const messageText = decoder.decode(data as ArrayBuffer);
    console.log('ChunderW message:', messageText);
    if (messageText === '\n') {
      // Keepalive
      return;
    }
    const message: ChunderWMessage = JSON.parse(messageText);
    switch (message.type) {
      case 'listen':
        sendMessage(CONNECT_MESSAGE);
        return;
      case 'register': {
        sendMessage(READY_MESSAGE);
        sendBlank();
        keepAliveInterval = setInterval(sendBlank, 10 * 1000);
        return;
      }
    }
  };
  websocket.on('message', processIncomingMessage);
  websocket.on('close', () => clearInterval(keepAliveInterval));

  return {};
};
