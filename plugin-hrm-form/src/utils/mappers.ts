import callTypes, { channelTypes, otherContactChannels } from '../states/DomainConstants';

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

const isOtherContactChannel = (channel: string) => (Object.values(otherContactChannels) as string[]).includes(channel); // Needed typecast here. For details see https://github.com/microsoft/TypeScript/issues/26255

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

    if (ageInt >= 0 && ageInt <= maxAgeInt) return age;
    if (ageInt > maxAgeInt) return maxAge;
  }

  return 'Unknown';
};

export const mapGender = (genderOptions: string[]) => (gender: string) => {
  const validOption = genderOptions.find(e => e.toLowerCase() === gender.toLowerCase());

  if (!validOption) {
    return 'Unknown';
  }

  return validOption;
};
