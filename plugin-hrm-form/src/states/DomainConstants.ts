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

const chatChannels = [
  channelTypes.whatsapp,
  channelTypes.facebook,
  channelTypes.web,
  channelTypes.sms,
  channelTypes.twitter,
  channelTypes.instagram,
  channelTypes.line,
];

export const isVoiceChannel = (channel: string) => channel === channelTypes.voice;
export const isChatChannel = (channel: string) => chatChannels.includes(channel as any);

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
} as const;
