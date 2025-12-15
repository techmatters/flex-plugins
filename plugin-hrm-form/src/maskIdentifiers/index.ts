/* eslint-disable import/no-unused-modules */
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
import { Strings, TaskChannelDefinition, MessagingCanvas, MessageList, Manager } from '@twilio/flex-ui';
// Weird type to pull in, but I can't see how it can be inferred from the public API, so it's this or 'any' xD
import type { ChatProperties } from '@twilio/flex-ui/src/internal-flex-commons/src';

import { getInitializedCan } from '../permissions/rules';
import { PermissionActions } from '../permissions/actions';

// Mask identifiers in the channel strings
export const maskChannelStringsWithIdentifiers = (channelType: TaskChannelDefinition) => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  if (!maskIdentifiers) return;

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

export const maskConversationServiceUserNames = (manager: Manager) => {
  let can: ReturnType<typeof getInitializedCan>;
  manager.store.subscribe(() => {
    can = getInitializedCan();
    if (!can(PermissionActions.VIEW_IDENTIFIERS)) {
      const {
        participants: { bySid },
        chat,
      } = manager.store.getState().flex;
      const flexNonAgentParticipantList = Object.values(bySid).filter(fp => fp.type !== 'agent');
      for (const [conversationSid, conversation] of Object.entries(chat.conversations)) {
        for (const participant of conversation.participants.values()) {
          // Check if this conversation participant matches the convo sid and conversation member sid of a non agent participant.
          const isNotAgent = Boolean(
            flexNonAgentParticipantList.find(fp => {
              const mediaProperties = fp.mediaProperties as ChatProperties;
              return (
                mediaProperties.conversationSid === conversationSid && mediaProperties.sid === participant.source.sid
              );
            }),
          );
          // Only mask non agent participants, which should only be the service user
          // The right side of the OR condition is for webchat 2.
          // Programmable Chat conversation participants are not listed in the 'participants' redux store so the above check soes not work
          // However they do have a member_type attribute set on the participant in the conversation, so we can use that
          // This check can be removed once webchat 2 support is removed
          // eslint-disable-next-line dot-notation
          if (isNotAgent || participant.source.attributes['member_type'] === 'guest') {
            // eslint-disable-next-line dot-notation
            (participant as any).friendlyName = manager.strings['MaskIdentifiers'] || 'XXXXXX';
          }
        }
      }
    }
  });
};
