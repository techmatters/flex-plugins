export const channelTypes = {
  facebook: 'facebook',
  web: 'web',
  voice: 'voice',
  sms: 'sms',
  whatsapp: 'whatsapp',
  twitter: 'twitter',
} as const;

export const channelsAndDefault = {
  ...channelTypes,
  default: 'default',
} as const;

export type ChannelTypes = typeof channelTypes[keyof typeof channelTypes];

export const otherContactChannels = {
  'Bulletin board': 'Bulletin board',
  'E-mail': 'E-mail',
  'Mobile app': 'Mobile app',
  Outreach: 'Outreach',
  Post: 'Post',
  'Walk-in / In person': 'Walk-in / In person',
  'Website forum': 'Website forum',
  Other: 'Other',
} as const;

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
