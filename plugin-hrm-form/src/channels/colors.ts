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

import { ITask, ReservationStatuses, TaskChannelDefinition } from '@twilio/flex-ui';
import React from 'react';
import * as Flex from '@twilio/flex-ui';

import { ChannelColors } from '../states/DomainConstants';

export const mainChannelColor = (
  channel: TaskChannelDefinition,
  status: ReservationStatuses = ReservationStatuses.Accepted,
  task?: ITask,
  component?: React.ComponentType,
): string => {
  switch (typeof channel.colors.main) {
    case 'string':
      return channel.colors.main;
    case 'function':
      return channel.colors.main(task, component);
    default:
      return channel.colors.main[status];
  }
};

const voiceColor = mainChannelColor(Flex.DefaultTaskChannels.Call);
const webColor = mainChannelColor(Flex.DefaultTaskChannels.Chat);
const facebookColor = mainChannelColor(Flex.DefaultTaskChannels.ChatMessenger);
const smsColor = mainChannelColor(Flex.DefaultTaskChannels.ChatSms);
const whatsappColor = mainChannelColor(Flex.DefaultTaskChannels.ChatWhatsApp);
const emailColor = mainChannelColor(Flex.DefaultTaskChannels.ChatEmail)
const twitterColor = '#1DA1F2';
const instagramColor = '#833AB4';
const lineColor = '#00C300';

export const colors: ChannelColors = {
  voice: voiceColor,
  web: webColor,
  facebook: facebookColor,
  sms: smsColor,
  whatsapp: whatsappColor,
  twitter: twitterColor,
  instagram: instagramColor,
  line: lineColor,
  email: emailColor
};
