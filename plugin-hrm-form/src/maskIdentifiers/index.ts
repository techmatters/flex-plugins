/* eslint-disable import/no-unused-modules,dot-notation */
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
import {
  Strings,
  TaskChannelDefinition,
  MessagingCanvas,
  MessageList,
  StateHelper,
  ConversationHelper,
  TaskHelper,
  DefaultTaskChannels,
  Manager,
} from '@twilio/flex-ui';

import { getInitializedCan } from '../permissions/rules';
import { PermissionActions } from '../permissions/actions';

// Mask identifiers in the channel strings
export const maskChannelStringsWithIdentifiers = (channelType: TaskChannelDefinition) => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  if (!maskIdentifiers) return;
  const { strings } = Manager.getInstance();
  const {
    IncomingTaskCanvas,
    TaskListItem,
    CallCanvas,
    TaskCanvasHeader,
    Supervisor,
    TaskCard,
  } = channelType.templates;

  IncomingTaskCanvas.firstLine = 'MaskIdentifiers';

  CallCanvas.firstLine = 'MaskIdentifiers';

  // Task list and panel when a call comes in
  TaskListItem.firstLine = 'MaskIdentifiers';
  if (channelType.name === DefaultTaskChannels.ChatSms.name) {
    // The unmasked service user number appears in the last message info on SMS if they sent the last message
    // Let's replace it with a version that doesn't include the sender's identity, regardless of who sent the last message.
    TaskListItem.secondLine = task => {
      const taskHelper = new TaskHelper(task);
      const conversationState = StateHelper.getConversationStateForTask(task);
      if (!conversationState) {
        return taskHelper.durationSinceUpdate;
      }
      const conversationHelper = new ConversationHelper(conversationState);
      return `${taskHelper.durationSinceUpdate} | ${
        conversationHelper.lastMessage?.isFromMe
          ? conversationHelper.lastMessage?.authorName
          : strings['MaskIdentifiers'] ?? '-'
      }: ${conversationHelper.lastMessage?.source.body ?? ''}`;
    };
  }
  // Task panel during an active call
  TaskCanvasHeader.title = 'MaskIdentifiers';
  Supervisor.TaskCanvasHeader.title = 'MaskIdentifiers';

  // Task Status in Agents page
  TaskCard.firstLine = 'MaskIdentifiers';

  Supervisor.TaskOverviewCanvas.firstLine = 'MaskIdentifiers';
};

// Mask identifiers in the manager strings & messaging canvas
export const maskManagerStringsWithIdentifiers = <T extends Strings<string> & { MaskIdentifiers?: string }>(
  newStrings: T,
) => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  if (!maskIdentifiers) return newStrings;

  if (!newStrings.MaskIdentifiers) return newStrings;

  Object.entries(newStrings).forEach(([key, value]) => {
    if (/{{task.defaultFrom}}/g.test(value)) {
      newStrings[key] = value.replace(/{{task.defaultFrom}}/g, newStrings.MaskIdentifiers);
    } else if (/{{defaultFrom}}/g.test(value)) {
      newStrings[key] = value.replace(/{{defaultFrom}}/g, newStrings.MaskIdentifiers);
    }
  });

  const maskedMessage = newStrings.MaskIdentifiers || 'XXXXXX';
  // Mask identifiers in messaging canvas for the sender
  MessagingCanvas.defaultProps.memberDisplayOptions = {
    theirDefaultName: maskedMessage,
    theirFriendlyNameOverride: false,
    yourFriendlyNameOverride: true,
  };

  // Mask IP address shown in the first message for web channel
  MessageList.Content.remove('0', {
    if: ({ conversation }) => conversation?.source?.attributes?.channel_type === 'web',
  });
  return newStrings;
};
