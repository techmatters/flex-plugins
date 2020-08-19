import callTypes, { channelTypes } from '../states/DomainConstants';

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

export const mapAge = age => {
  let ageStr;
  if (age === undefined) {
    ageStr = 'Unknown';
  } else {
    const ageNum = parseInt(age, 10);
    if (ageNum >= 0 && ageNum <= 3) {
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
    } else {
      ageStr = '>25';
    }
  }

  return ageStr;
};
