/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { callTypes } from './callTypes';

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
