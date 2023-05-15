import { WebSocket } from 'ws';
import context from './global-context';

const serverInitMessage = () => ({
  event_type: 'init',
  payload: {
    token_lifetime: 3566253,
    workspace_sid: context.WORKSPACE_SID,
    account_sid: context.ACCOUNT_SID,
    channel_id: context.LOGGED_IN_WORKER_SID,
  },
});

export const twilioChannelSocket = (websocket: WebSocket) => {
  websocket.send(JSON.stringify(serverInitMessage()));
  const keepAliveInterval = setInterval(() => websocket.send('\n'), 15 * 1000);
  websocket.send('\n');
  websocket.on('close', () => clearInterval(keepAliveInterval));

  return {};
};
