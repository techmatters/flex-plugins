/**
 * Copyright (C) 2021-2025 Technology Matters
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

import type { Context } from 'aws-lambda';
import { CreateVoicemailSchedule, ScheduledJobType } from '@tech-matters/scheduled-jobs';
import { createVoicemailTask } from '@tech-matters/voicemail';

const handleCreateVoicemailJob = async ({
  accountSid,
  workflowSid,
  attributes,
}: CreateVoicemailSchedule['voicemailTask']) => {
  const result = await createVoicemailTask({
    accountSid,
    name: attributes.name,
    routingAttributes: attributes.routingAttributes,
    maxCallbackAttempts: attributes.maxCallbackAttempts,
    callSid: attributes.callSid,
    from: attributes.from,
    receivedTime: new Date().toISOString(),
    callbackAttemptsMade: attributes.callbackAttemptsMade + 1,
    workflowSid,
  });

  return result;
};

export const handler = async (
  event: ScheduledJobType,
  context: Context,
): Promise<void> => {
  console.log('Received scheduled event', {
    requestId: context.awsRequestId,
    event,
  });

  try {
    switch (event.jobType) {
      case 'create-voicemail-schedule': {
        const result = await handleCreateVoicemailJob(event.voicemailTask);
        result.unwrap();
      }
      default: {
        console.warn(`Job type ${event.jobType} not supported`);
      }
    }

    return;
  } catch (err) {
    console.error(
      'Error processing job',
      JSON.stringify(event),
      err instanceof Error ? err.message : String(err),
    );
  }
};
