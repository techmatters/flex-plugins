import { MockSecureWebsocketServer } from './wss-mock-server';
import { identifySocketType, TwilioWebsocketType } from './twilio-wss-socket-type';
import { twilsockSocket } from './twilsock-socket';
import { chunderwSocket } from './chunderwSocket';

export const twilioWssMockServer = (wss: MockSecureWebsocketServer) => {
  const twilsockSockets: { connected: Date; socket: ReturnType<typeof twilsockSocket> }[] = [];
  const chunderwSockets: { connected: Date; socket: ReturnType<typeof chunderwSocket> }[] = [];

  wss.onConnection((ws, connectMsg) => {
    console.log(`New connection to mock twilio wss server`);
    ws.once('message', (initialMessage) => {
      const tsType = identifySocketType(ws, connectMsg, initialMessage);
      switch (tsType) {
        case TwilioWebsocketType.Twilsock: {
          console.log(`Identified as Twilsock connection:`);
          const socket = twilsockSocket(ws, initialMessage);
          twilsockSockets.push({ connected: new Date(), socket });
          return;
        }
        case TwilioWebsocketType.ChunderW: {
          console.log(`Identified as ChunderW connection:`);
          const socket = chunderwSocket(ws, initialMessage);
          chunderwSockets.push({ connected: new Date(), socket });
          return;
        }
        default: {
          console.log(`Unidentified twilio wss connection:`);
        }
      }
    });

    ws.on('message', (data) => {
      console.log(`message received: ${data}`);
    });
    ws.on('close', () => {
      console.log('socket closed');
    });
  });
};
