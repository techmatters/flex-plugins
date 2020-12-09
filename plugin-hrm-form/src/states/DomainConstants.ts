const callTypes = {
  child: 'Child calling about self',
  caller: 'Someone calling about a child',
  silent: 'Silent',
  blank: 'Blank',
  joke: 'Joke',
  hangup: 'Hang up',
  wrongnumber: 'Wrong Number',
  abusive: 'Abusive',
} as const;

export type CallTypes = typeof callTypes[keyof typeof callTypes];

export const channelTypes = {
  facebook: 'facebook',
  web: 'web',
  voice: 'voice',
  sms: 'sms',
  whatsapp: 'whatsapp',
} as const;

export const channelsAndDefault = { ...channelTypes, default: 'default' };

export type ChannelTypes = typeof channelTypes[keyof typeof channelTypes];

export const otherContactChannels = {
  email: 'E-mail',
  websiteForum: 'Website forum',
  outreach: 'Outreach',
  walkIn: 'Walk-in / In person',
  post: 'Post',
  bulletinBoard: 'Bulletin Board',
  other: 'Other',
} as const;

export type OtherContactChannels = typeof otherContactChannels[keyof typeof otherContactChannels];

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
