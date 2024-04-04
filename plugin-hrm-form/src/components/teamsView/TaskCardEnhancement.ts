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
import { DefaultTaskChannels } from '@twilio/flex-ui';

import { setupTwitterChatChannel, setupInstagramChatChannel, setupLineChatChannel } from '../../channels/setUpChannels';
import { getAseloFeatureFlags, getTemplateStrings } from '../../hrmConfig';
import { getInitializedCan, PermissionActions } from '../../permissions';

export const setUpEnhancedTaskCard = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  const strings = getTemplateStrings();

  DefaultTaskChannels.Call.templates.TaskCard.firstLine = task => {
    const truncatedIdentifier = maskIdentifiers ? 'XXXX' : task.defaultFrom.slice(-4);
    return `${task.queueName} | ...${truncatedIdentifier}`;
  };

  const getTwitterChatChannel = setupTwitterChatChannel(maskIdentifiers);
  const TwitterChatChannel = getTwitterChatChannel();

  const getInstagramChatChannel = setupInstagramChatChannel(maskIdentifiers);
  const InstagramChatChannel = getInstagramChatChannel();

  const getLineChatChannel = setupLineChatChannel(maskIdentifiers);
  const LineChatChannel = getLineChatChannel();

  const channels = [
    DefaultTaskChannels.Chat,
    DefaultTaskChannels.ChatSms,
    DefaultTaskChannels.Default,
    DefaultTaskChannels.ChatMessenger,
    DefaultTaskChannels.ChatWhatsApp,
    TwitterChatChannel,
    InstagramChatChannel,
    LineChatChannel,
  ];
  const setTaskCardInfo = channel => {
    channel.templates.TaskCard.firstLine = task => {
      const identifier = maskIdentifiers ? strings.MaskIdentifiers : '@';
      return `${task.queueName} | ${identifier}`;
    };
  };
  channels.forEach(channel => setTaskCardInfo(channel));
};
