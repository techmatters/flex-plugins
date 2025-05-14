import { callTypes } from '@tech-matters/hrm-form-definitions';

export * from './callTypes';

type TaskSID = `WT${string}`;

export type ChannelTypes =
  | 'voice'
  | 'sms'
  | 'facebook'
  | 'messenger'
  | 'whatsapp'
  | 'web'
  | 'telegram'
  | 'instagram'
  | 'line'
  | 'modica';

export type HrmContactRawJson = {
  definitionVersion?: string;
  callType: (typeof callTypes)[keyof typeof callTypes];
  childInformation: Record<string, FormValue>;
  callerInformation: Record<string, FormValue>;
  caseInformation: Record<string, FormValue>;
  categories: Record<string, string[]>;
  contactlessTask: {
    channel: ChannelTypes;
    createdOnBehalfOf: `WK${string}` | '';
    [key: string]: string | boolean;
  };
};

export type HrmContact = {
  id: string;
  accountSid?: `AC${string}`;
  twilioWorkerId?: `WK${string}`;
  number: string;
  conversationDuration: number;
  csamReports: unknown[];
  referrals?: unknown[];
  conversationMedia?: unknown[];
  createdAt: string;
  createdBy: string;
  helpline: string;
  taskId: TaskSID | null;
  profileId?: string;
  identifierId?: string;
  channel: ChannelTypes | 'default';
  updatedBy: string;
  updatedAt?: string;
  finalizedAt?: string;
  rawJson: HrmContactRawJson;
  timeOfContact: string;
  queueName: string;
  channelSid: string;
  serviceSid: string;
  caseId?: string;
  definitionVersion: string;
};

export type FormValue = string | string[] | boolean | null;
