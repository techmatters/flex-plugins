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

import { MockSecureWebsocketServer } from './wss-mock-server';
import { identifySocketType, TwilioWebsocketType } from './twilio-wss-socket-type';
import { twilsockSocket } from './twilsock-socket';
import { twilioChunderwSocket } from './twilio-chunderw-socket';
import { twilioChannelSocket } from './twilio-channel-socket';

/**
 * Wrapper for the mock WSS server that is used to set up mocks for the TwilSock and other WSS connections used in a flex session
 * @param wss - mock WSS server to be wrapped
 */
export const twilioWssMockServer = (wss: MockSecureWebsocketServer) => {
  const twilsockSockets: { connected: Date; socket: ReturnType<typeof twilsockSocket> }[] = [];
  const chunderwSockets: { connected: Date; socket: ReturnType<typeof twilioChunderwSocket> }[] =
    [];
  const channelsSockets: { connected: Date; socket: ReturnType<typeof twilioChannelSocket> }[] = [];

  wss.onConnection((ws, connectMsg, path) => {
    console.log(`New connection to mock twilio wss server`);
    const tsType = identifySocketType(path);
    switch (tsType) {
      case TwilioWebsocketType.Twilsock: {
        console.log(`Identified as Twilsock connection:`);
        const socket = twilsockSocket(ws);
        twilsockSockets.push({ connected: new Date(), socket });
        return;
      }
      case TwilioWebsocketType.ChunderW: {
        console.log(`Identified as ChunderW connection:`);
        const socket = twilioChunderwSocket(ws);
        chunderwSockets.push({ connected: new Date(), socket });
        return;
      }
      case TwilioWebsocketType.Channels: {
        console.log(`Identified as channels connection:`);
        const socket = twilioChannelSocket(ws);
        channelsSockets.push({ connected: new Date(), socket });
        return;
      }
      default: {
        console.log(`Unidentified twilio wss connection:`);
      }
    }

    ws.on('message', (data) => {
      console.log(`message received: ${data}`);
    });
    ws.on('close', () => {
      console.log('socket closed');
    });
  });

  return {};
};
