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
