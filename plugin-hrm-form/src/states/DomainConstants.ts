export const channelTypes = {
  voice: 'voice',
  sms: 'sms',
  facebook: 'facebook',
  whatsapp: 'whatsapp',
  web: 'web',
  twitter: 'twitter',
  instagram: 'instagram',
} as const;

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

export const caseStatuses = {
  open: 'open',
  closed: 'closed',
};
