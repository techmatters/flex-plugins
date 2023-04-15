import { Conversation } from '@twilio/conversations';

type ConversationListener = Parameters<Conversation['on']>;

const aseloListeners: Record<string, ConversationListener[]> = {};

export const addAseloListener = (conversation: Conversation, ...[event, listener]: ConversationListener) => {
  conversation.on(event, listener);
  aseloListeners[conversation.sid] = [...(aseloListeners[conversation.sid] || []), [event, listener]];
};

export const deactivateAseloListeners = (conversation: Conversation) => {
  const listeners = aseloListeners[conversation.sid] || [];
  listeners.forEach(([event, listener]) => conversation.off(event, listener as any));
};

export const reactivateAseloListeners = (conversation: Conversation) => {
  const listeners = aseloListeners[conversation.sid] || [];
  listeners.forEach(([event, listener]) => conversation.on(event, listener as any));
};
