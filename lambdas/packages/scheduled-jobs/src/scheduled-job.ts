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
import { AccountSID } from '@tech-matters/twilio-types';

export type CreateVoicemailSchedule = {
  jobType: 'create-voicemail-schedule';
  voicemailTask: {
    accountSid: AccountSID;
    attributes: {
      callSid: string;
      from: string;
      name: string;
      callbackAttempts: [string, string][];
      maxCallbackAttempts?: number;
      routingAttributes?: Record<string, any>;
    };
    workflowSid: string;
  };
};

export const isValidVoicemailTask = (
  task: any,
): task is CreateVoicemailSchedule['voicemailTask'] => {
  if (!task || typeof task !== 'object') return false;
  if (!task.accountSid || typeof task.accountSid !== 'string') return false;
  if (!task.workflowSid || typeof task.workflowSid !== 'string') return false;
  if (!task.attributes || typeof task.attributes !== 'object') return false;
  if (!task.attributes.callSid || typeof task.attributes.callSid !== 'string')
    return false;
  if (!task.attributes.from || typeof task.attributes.from !== 'string') return false;
  if (!task.attributes.name || typeof task.attributes.name !== 'string') return false;
  if (
    !task.attributes.callbackAttempts ||
    !Array.isArray(task.attributes.callbackAttempts)
  )
    return false;
  if (
    task.attributes.maxCallbackAttempts &&
    typeof task.attributes.maxCallbackAttempts !== 'number'
  )
    return false;
  if (
    task.attributes.routingAttributes &&
    typeof task.attributes.routingAttributes !== 'object'
  )
    return false;

  return true;
};

export type ScheduledJobType = CreateVoicemailSchedule;
