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

import { Conversation } from '@twilio/conversations';

type ConversationListenerParams = Parameters<Conversation['on']>;

const aseloListeners: Record<string, ConversationListenerParams[]> = {};

export const addAseloListener = (conversation: Conversation, ...listenerArgs: ConversationListenerParams) => {
  conversation.on(...listenerArgs);
  aseloListeners[conversation.sid] = [...(aseloListeners[conversation.sid] || []), listenerArgs];
};

export const deactivateAseloListeners = (conversation: Conversation) => {
  const listeners = aseloListeners[conversation.sid] || [];
  listeners.forEach(listenerArgs => conversation.off(...listenerArgs));
};

export const reactivateAseloListeners = (conversation: Conversation) => {
  const listeners = aseloListeners[conversation.sid] || [];
  listeners.forEach(listenerArgs => conversation.on(...listenerArgs));
};
