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
import {
  Manager,
  Strings,
  DefaultTaskChannels,
  TaskChannelDefinition,
  MessagingCanvas,
  MessageList,
} from '@twilio/flex-ui';

import { getInitializedCan, PermissionActions } from '../permissions';
import { getAseloFeatureFlags, getTemplateStrings } from '../hrmConfig';

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
    TaskInfoPanel,
  } = channelType.templates;

  IncomingTaskCanvas.firstLine = 'MaskIdentifiers';

  CallCanvas.firstLine = 'MaskIdentifiers';

  // Task list and panel when a call comes in
  TaskListItem.firstLine = 'MaskIdentifiers';
  TaskListItem.secondLine =
    channelType === DefaultTaskChannels.Chat ? 'TaskLineWebChatAssignedMasked' : 'TaskLineChatAssignedMasked';

  // Task panel during an active call
  TaskCanvasHeader.title = 'MaskIdentifiers';
  Supervisor.TaskCanvasHeader.title = 'MaskIdentifiers';

  // Task Status in Agents page
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) TaskCard.firstLine = 'MaskIdentifiers';

  // TaskInfoPanel.content = 'TaskInfoPanelContentMasked';

  Supervisor.TaskOverviewCanvas.firstLine = 'MaskIdentifiers';
  Supervisor.TaskInfoPanel.content = 'TaskInfoPanelContentMasked';
};

// Mask identifiers in the manager strings
export const maskManagerStringsWithIdentifiers = <T extends Strings<string> & { MaskIdentifiers?: string }>(
  newStrings: T,
) => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  if (!maskIdentifiers) return newStrings;

  // const { strings } = Manager.getInstance();

  return Object.entries(newStrings).reduce<T>((accum, [key, value]) => {
    if (!value || !newStrings.MaskIdentifiers) return accum;
    // If string does not contains number, just keep going
    if (/{{task.defaultFrom}}/g.test(value)) {
      return { ...accum, [key]: value.replace(/{{task.defaultFrom}}/g, newStrings.MaskIdentifiers) };
    }
    return accum;
  }, {} as T);
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
  MessageList.Content.remove('0');
};
