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

import { DefaultTaskChannels, ReservationStatuses, TaskChannelHelper, TaskChannels } from '@twilio/flex-ui';
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
import { getTemplateStrings } from '../hrmConfig';
import { isSmsChannelType } from '../utils/smsChannels';
import { setCallTaskCardString, setChatTaskCardString } from '../teamsView/taskCardEnhancement';
import { maskTemplatesWithIdentifiers } from '../maskIdentifiers/maskTemplatesWithIdentifiers';

const isIncomingTransfer = task => TransferHelpers.hasTransferStarted(task) && task.status === 'pending';

const setSecondLine = ({ channel, string }: { channel: string; string: string }) => {
  const strings = getTemplateStrings();

  const defaultStrings = DefaultTaskChannels[channel].templates.TaskListItem.secondLine;

  DefaultTaskChannels[channel].templates.TaskListItem.secondLine = (task, componentType) => {
    if (isIncomingTransfer(task)) {
      const { originalCounselorName } = task.attributes.transferMeta;
      const mode = TransferHelpers.isWarmTransfer(task) ? strings['Transfer-Warm'] : strings['Transfer-Cold'];

      const baseMessage = `${mode} ${strings[string]} ${originalCounselorName}`;

      if (task.attributes.transferTargetType === 'queue') return `${baseMessage} (${task.queueName})`;

      if (task.attributes.transferTargetType === 'worker') return `${baseMessage} (direct)`;

      return baseMessage;
    }

    return TaskChannelHelper.getTemplateForStatus(task, defaultStrings, componentType);
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
  DefaultTaskChannels.Call.icons = generateIcons(callIcon);
  maskTemplatesWithIdentifiers(DefaultTaskChannels.Call);
  setCallTaskCardString(DefaultTaskChannels.Call);
};

export const setupChatChannel = () => {
  maskTemplatesWithIdentifiers(DefaultTaskChannels.Chat);
  setChatTaskCardString(DefaultTaskChannels.Chat);
};

export const setupDefaultChannel = () => {
  maskTemplatesWithIdentifiers(DefaultTaskChannels.Default);
};

export const setupFacebookChannel = () => {
  const facebookIcon = <FacebookIcon width="24px" height="24px" color={colors.facebook} />;
  DefaultTaskChannels.ChatMessenger.icons = generateIcons(facebookIcon);
  maskTemplatesWithIdentifiers(DefaultTaskChannels.ChatMessenger);
  setChatTaskCardString(DefaultTaskChannels.ChatMessenger);
};

export const setupWhatsAppChannel = () => {
  const whatsappIcon = <WhatsappIcon width="24px" height="24px" color={colors.whatsapp} />;
  DefaultTaskChannels.ChatWhatsApp.icons = generateIcons(whatsappIcon);
  maskTemplatesWithIdentifiers(DefaultTaskChannels.ChatWhatsApp);
  setChatTaskCardString(DefaultTaskChannels.ChatWhatsApp);
};

export const setupSmsChannel = () => {
  const smsIcon = <SmsIcon width="24px" height="24px" color={colors.sms} />;
  DefaultTaskChannels.ChatSms.icons = generateIcons(smsIcon);
  DefaultTaskChannels.ChatSms.isApplicable = task => isSmsChannelType(task.channelType);
  maskTemplatesWithIdentifiers(DefaultTaskChannels.ChatSms);
  setChatTaskCardString(DefaultTaskChannels.ChatSms);
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
  const TwitterChatChannel = DefaultTaskChannels.createChatTaskChannel(
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
    Wrapping: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  TaskChannels.register(TwitterChatChannel);
};

export const setupInstagramChatChannel = () => {
  const InstagramChatChannel = DefaultTaskChannels.createChatTaskChannel(
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
    Wrapping: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  TaskChannels.register(InstagramChatChannel);
};

export const setupLineChatChannel = () => {
  const LineChatChannel = DefaultTaskChannels.createChatTaskChannel('line', task => task.channelType === 'line');

  const icon = <LineIcon width="24px" height="24px" color={colors.line} />;
  LineChatChannel.icons = generateIcons(icon);

  maskTemplatesWithIdentifiers(LineChatChannel);
  setChatTaskCardString(LineChatChannel);

  LineChatChannel.colors.main = {
    Accepted: colors.line,
    Assigned: colors.line,
    Pending: colors.line,
    Reserved: colors.line,
    Wrapping: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Wrapping),
    Completed: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Completed),
    Canceled: mainChannelColor(DefaultTaskChannels.Chat, ReservationStatuses.Canceled),
  };

  TaskChannels.register(LineChatChannel);
};
