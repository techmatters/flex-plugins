const defaultChannelTypes = {
  voice: 'voice',
  sms: 'sms',
  facebook: 'facebook',
  whatsapp: 'whatsapp',
  web: 'web',
} as const;

export const customChannelTypes = {
  twitter: 'twitter',
  instagram: 'instagram',
  line: 'line',
} as const;

export const channelTypes = {
  ...defaultChannelTypes,
  ...customChannelTypes,
};

export type ChannelTypes = typeof channelTypes[keyof typeof channelTypes];

export type ChannelColors = {
  [C in ChannelTypes]: string;
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
