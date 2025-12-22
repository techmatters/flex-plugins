/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { ChatChannelSID, ConversationSID } from '@tech-matters/twilio-types';

/**
 * Conversation Event Types: https://www.twilio.com/docs/taskrouter/api/event/reference#event-types
 */

// Conversations
export const CONVERSATION_ADD = 'onConversationAdd'; // Fires when a new conversation is created.
export const CONVERSATION_REMOVE = 'onConversationRemove'; // Fires when a conversation is removed from the Service.
export const CONVERSATION_UPDATE = 'onConversationUpdate'; // Fires when any attribute of a conversation is changed.

export const MESSAGE_ADD = 'onMessageAdd'; // Fires when a new message is posted to a conversation.
export const MESSAGE_REMOVE = 'onMessageRemove'; // Fires when a message is deleted from a conversation.
export const MESSAGE_UPDATE = 'onMessageUpdate'; // Fires when a posted message's body or any attribute is changed.

export const PARTICIPANT_ADD = 'onParticipantAdd'; // Fires when a Participant has joined a Conversation as a Member.
export const PARTICIPANT_REMOVE = 'onParticipantRemove'; // Fires when a User is removed from the set of Conversation Members.
export const PARTICIPANT_UPDATE = 'onParticipantUpdate'; // Fires when any configurable attribute of a User is changed. Will not be fired for reachability events.

export const CONVERSATION_ADDED = 'onConversationAdded'; // Fires when a new conversation is created.
export const CONVERSATION_REMOVED = 'onConversationRemoved'; // Fires when a conversation is removed from the Service.
export const CONVERSATION_UPDATED = 'onConversationUpdated'; // Fires when any attribute of a conversation is changed.
export const CONVERSATION_STATE_UPDATED = 'onConversationStateUpdated'; // Fires when the state of a Conversation is updated, e.g., from "active" to "inactive"

export const MESSAGE_ADDED = 'onMessageAdded'; // Fires when a new message is posted to a conversation.
export const MESSAGE_REMOVED = 'onMessageRemoved'; // Fires when a message is deleted from a conversation.
export const MESSAGE_UPDATED = 'onMessageUpdated'; // Fires when a posted message's body or any attribute is changed.

export const PARTICIPANT_ADDED = 'onParticipantAdded'; // Fires when a Participant has joined a Conversation as a Member.
export const PARTICIPANT_REMOVED = 'onParticipantRemoved'; // Fires when a User is removed from the set of Conversation Members.
export const PARTICIPANT_UPDATED = 'onParticipantUpdated'; // Fires when any configurable attribute of a User is changed. Will not be fired for reachability events.

export const DELIVERY_UPDATED = 'onDeliveryUpdated'; // Fires when delivery receipt status is updated

// Programmable Chat
export const MESSAGE_SEND = 'onMessageSend'; // Sending a Message
// export const MESSAGE_UPDATE = 'onMessageUpdate'; // Editing Message Body / Attributes
// export const MESSAGE_REMOVE = 'onMessageRemove'; // Deleting Message
export const MEDIA_MESSAGE_SEND = 'onMediaMessageSend'; // Sending a Media Message
export const CHANNEL_ADD = 'onChannelAdd'; // Creating a Channel
export const CHANNEL_UPDATE = 'onChannelUpdate'; // Edit Channel Properties
export const CHANNEL_UPDATED = 'onChannelUpdated'; // Edited Channel Properties
export const CHANNEL_DESTROY = 'onChannelDestroy'; // Deleting Channel / Destroying Channel
export const MEMBER_ADD = 'onMemberAdd'; // Joining Channel / Channel Member being Added
export const MEMBER_UPDATE = 'onMemberUpdate'; // Channel Member to be Updated
export const MEMBER_REMOVE = 'onMemberRemove'; // Channel Member to be Removed / Channel Member Leaving
export const USER_UPDATE = 'onUserUpdate'; // User to be Updated

export const conversationEventTypes = {
  CONVERSATION_ADD,
  CONVERSATION_REMOVE,
  CONVERSATION_UPDATE,

  MESSAGE_ADD,
  MESSAGE_REMOVE,
  MESSAGE_UPDATE,

  PARTICIPANT_ADD,
  PARTICIPANT_REMOVE,
  PARTICIPANT_UPDATE,

  CONVERSATION_ADDED,
  CONVERSATION_REMOVED,
  CONVERSATION_UPDATED,
  CONVERSATION_STATE_UPDATED,

  MESSAGE_ADDED,
  MESSAGE_REMOVED,
  MESSAGE_UPDATED,

  PARTICIPANT_ADDED,
  PARTICIPANT_REMOVED,
  PARTICIPANT_UPDATED,

  DELIVERY_UPDATED,
} as const;

export type ConversationEvent =
  (typeof conversationEventTypes)[keyof typeof conversationEventTypes];

export const programmableChatEventTypes = {
  MESSAGE_SEND,
  MESSAGE_UPDATE,
  MESSAGE_REMOVE,
  MEDIA_MESSAGE_SEND,
  CHANNEL_ADD,
  CHANNEL_UPDATE,
  CHANNEL_UPDATED,
  CHANNEL_DESTROY,
  MEMBER_ADD,
  MEMBER_UPDATE,
  MEMBER_REMOVE,
  USER_UPDATE,
} as const;

export type ProgrammableChatEvent =
  (typeof programmableChatEventTypes)[keyof typeof programmableChatEventTypes];

export type ConversationStateUpdatedEvent = {
  EventType: 'onConversationStateUpdated';
  ChatServiceSid: string;
  StateUpdated: string; // ISO8601 time	Modification date of the state
  StateFrom: 'active' | 'inactive' | 'closed';
  StateTo: 'active' | 'inactive' | 'closed';
  ConversationSid: ConversationSID;
  Reason: 'API' | 'TIMER' | 'EVENT';
  MessagingServiceSid: string;
};

export type ChannelUpdatedEvent = {
  EventType: 'onChannelUpdate';
  ChannelSid: ChatChannelSID;
  Attributes?: string;
  DateCreated: string; // The date of creation of the channel
  CreatedBy: string;
  FriendlyName?: string;
  UniqueName?: string;
};
