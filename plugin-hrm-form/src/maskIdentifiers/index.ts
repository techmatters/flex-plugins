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
import { Strings, TaskChannelDefinition, MessagingCanvas, MessageList } from '@twilio/flex-ui';

import { getInitializedCan, PermissionActions } from '../permissions';
import { getAseloFeatureFlags } from '../hrmConfig';

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
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) TaskCard.firstLine = 'MaskIdentifiers';

  Supervisor.TaskOverviewCanvas.firstLine = 'MaskIdentifiers';
};

// Mask identifiers in the manager strings
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

  return newStrings;
};

// Mask identifiers in the messaging canvas in chat window
export const maskMessageListWithIdentifiers = () => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  if (!maskIdentifiers) return;

  MessagingCanvas.defaultProps.memberDisplayOptions = {
    theirDefaultName: 'XXXXXX',
    theirFriendlyNameOverride: false,
    yourFriendlyNameOverride: true,
  };
  MessageList.Content.remove('0', {
    if: ({ conversation }) => conversation?.source?.attributes?.channel_type === 'web',
  });
};
