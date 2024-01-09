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

const defaultChannelTypes = {
  voice: 'voice',
  sms: 'sms',
  facebook: 'facebook',
  whatsapp: 'whatsapp',
  web: 'web',
} as const;

export const customChannelTypes = {
  twitter: 'twitter',
  instagram: 'instagram',
  line: 'line',
} as const;

export const smsChannelTypes = ['sms', 'modica'];

export const channelTypes = {
  ...defaultChannelTypes,
  ...customChannelTypes,
};

export type ChannelTypes = typeof channelTypes[keyof typeof channelTypes];

const chatChannels = [
  channelTypes.whatsapp,
  channelTypes.facebook,
  channelTypes.web,
  channelTypes.sms,
  channelTypes.twitter,
  channelTypes.instagram,
  channelTypes.line,
];

export const isVoiceChannel = (channel: string) => channel === channelTypes.voice;
export const isChatChannel = (channel: string) => chatChannels.includes(channel as any);

export type ChannelColors = {
  [C in ChannelTypes]: string;
};

export const transferModes = {
  cold: 'COLD',
  warm: 'WARM',
};

export const transferStatuses = {
  transferring: 'transferring',
  accepted: 'accepted',
  rejected: 'rejected',
} as const;
