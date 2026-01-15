/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Client, Conversation, Participant, Message, User } from '@twilio/conversations';
import { GenericThemeShape } from '@twilio-paste/theme';
import { AlertVariants } from '@twilio-paste/core/alert';

import { FileAttachmentConfig } from '../definitions';
import { TaskState } from '../task';

export enum EngagementPhase {
  PreEngagementForm = 'PreEngagementForm',
  MessagingCanvas = 'MessagingCanvas',
  Loading = 'Loading',
}

export type ChatState = {
  conversationsClient?: Client;
  conversation?: Conversation;
  participants?: Participant[];
  users?: User[];
  messages?: Message[];
  attachedFiles?: File[];
  conversationState?: string;
  participantNames?: { [key: string]: string };
};

export type PreEngagementData = { name: string; email: string; query: string };

export type SessionState = {
  currentPhase: EngagementPhase;
  expanded: boolean;
  token?: string;
  conversationSid?: string;
  conversationsClient?: Client;
  conversation?: Conversation;
  users?: User[];
  participants?: Participant[];
  messages?: Message[];
  conversationState?: 'active' | 'inactive' | 'closed';
  preEngagementData?: PreEngagementData;
};

export type UserConfig = {
  deploymentKey: string;
  region?: string;
  appStatus?: 'open';
  theme?: {
    isLight?: boolean;
    overrides?: Partial<GenericThemeShape>;
  };
};

export type ConfigState = UserConfig & {
  fileAttachment?: FileAttachmentConfig;
};

export type Notification = {
  dismissible: boolean;
  id: string;
  onDismiss?: () => void;
  message: string;
  timeout?: number;
  type: AlertVariants;
};

export type NotificationState = Notification[];

export type AppState = {
  chat: ChatState;
  config: ConfigState;
  session: SessionState;
  notifications: NotificationState;
  task: TaskState;
};
