import callTypes, { channelTypes, otherContactChannels } from '../states/DomainConstants';

/**
 * @param {string} str
 * @return {string}
 */
export const mapCallType = str => {
  switch (str) {
    case callTypes.child:
      return 'SELF';
    case callTypes.caller:
      return 'CALLER';
    default:
      return str.toUpperCase();
  }
};

/**
 * @param {string} channel
 */
export const mapChannel = channel => {
  if (Object.values(otherContactChannels).includes(channel)) return channel;

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
    default:
      return 'Undefined';
  }
};

// Flex Insights reporting uses slightly different channel names than other uses
export const mapChannelForInsights = channel => {
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

/**
 * @param {string} age
 * @returns {string}
 */
export const mapAge = age => {
  const ageInt = parseInt(age, 10);

  if (ageInt >= 0 && ageInt <= 25) return age;
  if (ageInt > 25) return '>25';

  return 'Unknown';
};

export const mapGender = gender => {
  if (gender === undefined) {
    gender = 'Unknown';
  } else {
    gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  }

  return gender;
};
