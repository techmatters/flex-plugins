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
