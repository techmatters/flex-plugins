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

export const mapAge = age => {
  let ageStr;
  if (age === undefined) {
    ageStr = 'Unknown';
  } else {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum)) {
      ageStr = 'Unknown';
    } else if (ageNum >= 0 && ageNum <= 3) {
      ageStr = '0-03';
    } else if (ageNum >= 4 && ageNum <= 6) {
      ageStr = '04-06';
    } else if (ageNum >= 7 && ageNum <= 9) {
      ageStr = '07-09';
    } else if (ageNum >= 10 && ageNum <= 12) {
      ageStr = '10-12';
    } else if (ageNum >= 13 && ageNum <= 15) {
      ageStr = '13-15';
    } else if (ageNum >= 16 && ageNum <= 17) {
      ageStr = '16-17';
    } else if (ageNum >= 18 && ageNum <= 25) {
      ageStr = '18-25';
    } else if (ageNum > 25 && ageNum <= 100) {
      ageStr = '>25';
    } else {
      console.error('Invalid age value: %s', ageStr);
      ageStr = 'Unknown';
    }
  }

  return ageStr;
};

export const mapGender = gender => {
  if (gender === undefined) {
    gender = 'Unknown';
  } else {
    gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  }

  return gender;
};
