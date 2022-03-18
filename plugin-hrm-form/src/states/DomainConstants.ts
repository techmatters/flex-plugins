export const channelTypes = {
  facebook: 'facebook',
  web: 'web',
  voice: 'voice',
  sms: 'sms',
  whatsapp: 'whatsapp',
  twitter: 'twitter',
  instagram: 'instagram',
} as const;

export const channelsAndDefault = {
  ...channelTypes,
  default: 'default',
} as const;

export type ChannelTypes = typeof channelTypes[keyof typeof channelTypes];

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
