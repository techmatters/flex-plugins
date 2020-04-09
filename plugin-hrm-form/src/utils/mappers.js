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
