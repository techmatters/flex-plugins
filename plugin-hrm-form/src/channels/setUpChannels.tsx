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

import * as Flex from '@twilio/flex-ui';
import { ReservationStatuses } from '@twilio/flex-ui';
import React from 'react';

import TwitterIcon from '../components/common/icons/TwitterIcon';
import InstagramIcon from '../components/common/icons/InstagramIcon';
import LineIcon from '../components/common/icons/LineIcon';
import WhatsappIcon from '../components/common/icons/WhatsappIcon';
import FacebookIcon from '../components/common/icons/FacebookIcon';
import CallIcon from '../components/common/icons/CallIcon';
import SmsIcon from '../components/common/icons/SmsIcon';
import * as TransferHelpers from '../transfer/transferTaskState';
import { colors, mainChannelColor } from './colors';
import { getTemplateStrings, getAseloFeatureFlags } from '../hrmConfig';
import { isSmsChannelType } from '../utils/smsChannels';
import { setCallTaskCardString, setChatTaskCardString } from '../teamsView/taskCardEnhancement';
import { maskTemplatesWithIdentifiers } from '../maskIdentifiers/maskIdentifiersForChannels';

const isIncomingTransfer = task => TransferHelpers.hasTransferStarted(task) && task.status === 'pending';

const setSecondLine = ({ channel, string }: { channel: string; string: string }) => {
  const strings = getTemplateStrings();

  const defaultStrings = Flex.DefaultTaskChannels[channel].templates.TaskListItem.secondLine;

  Flex.DefaultTaskChannels[channel].templates.TaskListItem.secondLine = (task, componentType) => {
    if (isIncomingTransfer(task)) {
      const { originalCounselorName } = task.attributes.transferMeta;
      const mode = TransferHelpers.isWarmTransfer(task) ? strings['Transfer-Warm'] : strings['Transfer-Cold'];

      const baseMessage = `${mode} ${strings[string]} ${originalCounselorName}`;

      if (task.attributes.transferTargetType === 'queue') return `${baseMessage} (${task.queueName})`;

      if (task.attributes.transferTargetType === 'worker') return `${baseMessage} (direct)`;

      return baseMessage;
    }

    return Flex.TaskChannelHelper.getTemplateForStatus(task, defaultStrings, componentType);
  };
};

export const setUpIncomingTransferMessage = () => {
  const chatChannels = [
    { channel: 'Call', string: 'Transfer-TaskLineCallReserved' },
    { channel: 'Chat', string: 'Transfer-TaskLineChatReserved' },
    { channel: 'ChatMessenger', string: 'Transfer-TaskLineChatMessengerReserved' },
    { channel: 'ChatSms', string: 'Transfer-TaskLineChatSmsReserved' },
    { channel: 'ChatWhatsApp', string: 'Transfer-TaskLineChatWhatsAppReserved' },
  ];

  chatChannels.forEach(el => setSecondLine(el));
};

const generateIcons = (icon: JSX.Element) => ({
  active: icon,
  list: icon,
  main: icon,
});

export const setupCallChannel = () => {
  const callIcon = <CallIcon width="24px" height="24px" color={colors.voice} />;
  Flex.DefaultTaskChannels.Call.icons = generateIcons(callIcon);
  maskTemplatesWithIdentifiers(Flex.DefaultTaskChannels.Call);
  setCallTaskCardString(Flex.DefaultTaskChannels.Call);
};

export const setupChatChannel = () => {
  maskTemplatesWithIdentifiers(Flex.DefaultTaskChannels.Chat);
  setChatTaskCardString(Flex.DefaultTaskChannels.Chat);
};

export const setupDefaultChannel = () => {
  maskTemplatesWithIdentifiers(Flex.DefaultTaskChannels.Default);
};

export const setupFacebookChannel = () => {
  const facebookIcon = <FacebookIcon width="24px" height="24px" color={colors.facebook} />;
  Flex.DefaultTaskChannels.ChatMessenger.icons = generateIcons(facebookIcon);
  maskTemplatesWithIdentifiers(Flex.DefaultTaskChannels.ChatMessenger);
  setChatTaskCardString(Flex.DefaultTaskChannels.ChatMessenger);
};

export const setupWhatsAppChannel = () => {
  const whatsappIcon = <WhatsappIcon width="24px" height="24px" color={colors.whatsapp} />;
  Flex.DefaultTaskChannels.ChatWhatsApp.icons = generateIcons(whatsappIcon);
  maskTemplatesWithIdentifiers(Flex.DefaultTaskChannels.ChatWhatsApp);
  setChatTaskCardString(Flex.DefaultTaskChannels.ChatWhatsApp);
};

export const setupSmsChannel = () => {
  const smsIcon = <SmsIcon width="24px" height="24px" color={colors.sms} />;
  Flex.DefaultTaskChannels.ChatSms.icons = generateIcons(smsIcon);
  Flex.DefaultTaskChannels.ChatSms.isApplicable = task => isSmsChannelType(task.channelType);
  maskTemplatesWithIdentifiers(Flex.DefaultTaskChannels.ChatSms);
  setChatTaskCardString(Flex.DefaultTaskChannels.ChatSms);
};

export const setupDefaultChannels = () => {
  setupFacebookChannel();
  setupWhatsAppChannel();
  setupSmsChannel();
  setupCallChannel();
  setupChatChannel();
  setupDefaultChannel();
};

export const setupTwitterChatChannel = () => {
  const TwitterChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel(
    'twitter',
    task => task.channelType === 'twitter',
  );

  const icon = <TwitterIcon width="24px" height="24px" color={colors.twitter} />;
  TwitterChatChannel.icons = generateIcons(icon);

  TwitterChatChannel.templates.CallCanvas.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.TaskListItem.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.TaskCard.firstLine = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.Supervisor.TaskCanvasHeader.title = 'TaskHeaderLineTwitter';
  TwitterChatChannel.templates.Supervisor.TaskOverviewCanvas.firstLine = 'TaskHeaderLineTwitter';

  maskTemplatesWithIdentifiers(TwitterChatChannel);
  setChatTaskCardString(TwitterChatChannel);

  TwitterChatChannel.colors.main = {
    Accepted: colors.twitter,
    Assigned: colors.twitter,
    Pending: colors.twitter,
    Reserved: colors.twitter,
    Wrapping: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  Flex.TaskChannels.register(TwitterChatChannel);
};

export const setupInstagramChatChannel = () => {
  const InstagramChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel(
    'instagram',
    task => task.channelType === 'instagram',
  );

  const icon = <InstagramIcon width="24px" height="24px" color="white" />;
  InstagramChatChannel.icons = generateIcons(icon);

  maskTemplatesWithIdentifiers(InstagramChatChannel);
  setChatTaskCardString(InstagramChatChannel);

  InstagramChatChannel.colors.main = {
    Accepted: colors.instagram,
    Assigned: colors.instagram,
    Pending: colors.instagram,
    Reserved: colors.instagram,
    Wrapping: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  Flex.TaskChannels.register(InstagramChatChannel);
};

export const setupLineChatChannel = () => {
  const LineChatChannel = Flex.DefaultTaskChannels.createChatTaskChannel('line', task => task.channelType === 'line');

  const icon = <LineIcon width="24px" height="24px" color={colors.line} />;
  LineChatChannel.icons = generateIcons(icon);

  maskTemplatesWithIdentifiers(LineChatChannel);
  setChatTaskCardString(LineChatChannel);

  LineChatChannel.colors.main = {
    Accepted: colors.line,
    Assigned: colors.line,
    Pending: colors.line,
    Reserved: colors.line,
    Wrapping: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(Flex.DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  Flex.TaskChannels.register(LineChatChannel);
};
