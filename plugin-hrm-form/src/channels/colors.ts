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

import { ITask, ReservationStatuses, TaskChannelDefinition, DefaultTaskChannels } from '@twilio/flex-ui';
import React from 'react';

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

const voiceColor = '#a0a8bd'; // mainChannelColor(DefaultTaskChannels.Voice) errors without a valid task in Flex 2.11.0
const webColor = mainChannelColor(DefaultTaskChannels.Chat);
const facebookColor = mainChannelColor(DefaultTaskChannels.ChatMessenger);
const smsColor = mainChannelColor(DefaultTaskChannels.ChatSms);
const whatsappColor = mainChannelColor(DefaultTaskChannels.ChatWhatsApp);
const telegramColor = '#1DA1F2';
const instagramColor = '#833AB4';
const lineColor = '#00C300';

export const colors: ChannelColors = {
  voice: voiceColor,
  web: webColor,
  facebook: facebookColor,
  sms: smsColor,
  whatsapp: whatsappColor,
  telegram: telegramColor,
  instagram: instagramColor,
  line: lineColor,
};
