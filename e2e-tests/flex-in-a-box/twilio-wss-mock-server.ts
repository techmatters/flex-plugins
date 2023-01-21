import { MockSecureWebsocketServer } from './wss-mock-server';
import { identifySocketType, TwilioWebsocketType } from './twilio-wss-socket-type';
import { twilsockSocket } from './twilsock-socket';
import { twilioChunderwSocket } from './twilio-chunderw-socket';
import { twilioChannelSocket } from './twilio-channel-socket';

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
