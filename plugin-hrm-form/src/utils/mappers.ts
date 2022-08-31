import { callTypes } from 'hrm-form-definitions';

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
    case channelTypes.facebook:
      return 'Facebook Messenger';
    case channelTypes.web:
      return 'Chat';
    case channelTypes.voice:
      return 'Voice';
    case channelTypes.sms:
      return 'SMS';
    case channelTypes.whatsapp:
      return 'WhatsApp';
    case channelTypes.twitter:
      return 'Twitter';
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
