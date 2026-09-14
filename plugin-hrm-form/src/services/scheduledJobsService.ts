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

// WE ARE TRYING TO BREAK THIS FILE UP! NO NEW METHODS IN HERE PLEASE!
// Add to one of the other function specific serverless service files that already exist like twilioTaskService.ts or twilioWorkerService.ts
// If an appropriate file doesn't exist, start another one, and move any existing functions here that should also be in there into it

/* eslint-disable sonarjs/prefer-immediate-return */
/* eslint-disable camelcase */
import { ITask } from '@twilio/flex-ui';

import fetchProtectedApi from './fetchProtectedApi';

// copy paste lambdas/packages/scheduled-jobs/src/scheduled-job.ts until we have a better package sharing with Flex
type CreateVoicemailScheduleParams = {
  voicemailTask: ITask;
};

export const createVoicemailSchedule = async (payload: CreateVoicemailScheduleParams): Promise<string> => {
  const {
    workflowSid,
    attributes: { callSid, from, name, routingAttributes, callbackAttempts, maxCallbackAttempts },
  } = payload.voicemailTask;

  const voicemailTask = {
    workflowSid,
    attributes: {
      callSid,
      from,
      name,
      routingAttributes,
      callbackAttempts,
      maxCallbackAttempts,
    },
  };
  const body = { voicemailTask, jobType: 'create-voicemail-schedule' };
  const scheduleName = await fetchProtectedApi('/scheduled-jobs/create', body, {
    useTwilioLambda: true,
    useJsonEncode: true,
  });
  return scheduleName;
};
