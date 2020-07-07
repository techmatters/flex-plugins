const callTypes = {
  child: 'Child calling about self',
  caller: 'Someone calling about a child',
  silent: 'Silent',
  blank: 'Blank',
  joke: 'Joke',
  hangup: 'Hang up',
  wrongnumber: 'Wrong Number',
  abusive: 'Abusive',
};

export const channelTypes = {
  facebook: 'facebook',
  web: 'web',
  voice: 'voice',
  sms: 'sms',
  whatsapp: 'whatsapp',
};

export const transferModes = {
  cold: 'COLD',
  warm: 'WARM',
};

export const transferStatuses = {
  transferring: 'transferring',
  accepted: 'accepted',
  rejected: 'rejected',
};

export const caseStatuses = {
  open: 'open',
  closed: 'closed',
};

export default callTypes;
