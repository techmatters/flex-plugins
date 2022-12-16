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
};
