import callTypes from '../states/DomainConstants';

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
    case 'facebook':
      return 'Facebook Messenger';
    case 'web':
      return 'Chat';
    case 'voice':
      return 'Voice';
    case 'sms':
      return 'SMS';
    case 'whatsapp':
      return 'WhatsApp';
    default:
      return 'Undefined';
  }
};
