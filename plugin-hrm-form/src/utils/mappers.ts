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

import { callTypes } from '@tech-matters/hrm-form-definitions';

import { channelTypes } from '../states/DomainConstants';

export const mapCallType = (str: string) => {
  switch (str) {
    case callTypes.child:
      return 'SELF';
    case callTypes.caller:
      return 'CALLER';
    default:
      return str.toUpperCase();
  }
};

const isOtherContactChannel = (channel: string) => !(Object.values(channelTypes) as string[]).includes(channel); // Needed typecast here. For details see https://github.com/microsoft/TypeScript/issues/26255

export const mapChannel = (channel: string) => {
  if (isOtherContactChannel(channel)) {
    return channel;
  }
  switch (channel) {
    case channelTypes.messenger:
    case channelTypes.facebook:
      return 'Facebook Messenger';
    case channelTypes.web:
      return 'Chat';
    case channelTypes.voice:
      return 'Voice';
    case channelTypes.sms:
    case channelTypes.modica:
      return 'SMS';
    case channelTypes.whatsapp:
      return 'WhatsApp';
    case channelTypes.telegram:
      return 'Telegram';
    case channelTypes.instagram:
      return 'Instagram';
    case channelTypes.line:
      return 'Line';
    default:
      return 'Undefined';
  }
};

// Flex Insights reporting uses slightly different channel names than other uses
export const mapChannelForInsights = (channel: string) => {
  switch (channel) {
    case channelTypes.facebook:
      return 'Facebook';
    case channelTypes.web:
      return 'Web';
    case channelTypes.voice:
      return 'Call';
    default:
      return mapChannel(channel);
  }
};

export const mapAge = (ageOptions: string[]) => (age: string) => {
  const ageInt = parseInt(age, 10);

  const maxAge = ageOptions.find(e => e.includes('>'));

  if (maxAge) {
    const maxAgeInt = parseInt(maxAge.replace('>', ''), 10);

    if (ageInt >= 0 && ageInt <= maxAgeInt) {
      return ageOptions.find(o => parseInt(o, 10) === ageInt);
    }

    if (ageInt > maxAgeInt) return maxAge;
  } else {
    console.error('Pre populate form error: no maxAge option provided.');
  }

  return 'Unknown';
};

export const mapGenericOption = (options: string[]) => (value: string) => {
  const validOption = options.find(e => e.toLowerCase() === value.toLowerCase());

  if (!validOption) {
    return 'Unknown';
  }

  return validOption;
};
