/**
 * Copyright (C) 2021-2026 Technology Matters
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
export const aseloCustomChannelTypes = {
  INSTAGRAM: 'instagram',
  LINE: 'line',
  MODICA: 'modica',
  TELEGRAM: 'telegram',
} as const;

export type AseloCustomChannelType =
  (typeof aseloCustomChannelTypes)[keyof typeof aseloCustomChannelTypes];

export const isAseloCustomChannelType = (channelType?: string): boolean =>
  Object.values(aseloCustomChannelTypes).includes(channelType as AseloCustomChannelType);

export const channelTypes = {
  EXTERNAL_TASK: 'external_task',
  VOICEMAIL: 'voicemail',
  SMS: 'sms',
  VOICE: 'voice',
  WEB: 'web',
  CHAT: 'chat',
  WHATSAPP: 'whatsapp',
  MESSENGER: 'messenger',
  DEFAULT: 'default',
  ...aseloCustomChannelTypes,
} as const;

export type ChannelType = (typeof channelTypes)[keyof typeof channelTypes];
