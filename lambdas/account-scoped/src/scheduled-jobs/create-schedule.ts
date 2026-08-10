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

import { ScheduledJobType } from '@tech-matters/scheduled-jobs/dist/scheduled-job';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { newErr, newOk, Result } from '../Result';
import { createScheduledJob, isValidVoicemailTask } from '@tech-matters/scheduled-jobs';
import { addHours } from 'date-fns/addHours';

const supportedJobType: ScheduledJobType['jobType'][] = ['create-voicemail-schedule'];

export const handleCreateScheduleJob: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, string>> => {
  try {
      Arn: process.env.SCHEDULED_JOBS_PROCESSOR_LAMBDA_ARN,
      RoleArn: process.env.SCHEDULED_JOBS_EXECUTION_ROLE_ARN,
    });
    const { jobType } = request.body as {
      jobType: ScheduledJobType['jobType'];
    };

    if (!supportedJobType.includes(jobType)) {
      return newErr({
        message: 'Invalid job type, not supported by user facing handler',
        error: { statusCode: 400 },
      });
    }

    if (jobType === 'create-voicemail-schedule') {
      const { voicemailTask } = request.body;

      if (!isValidVoicemailTask(voicemailTask)) {
        return newErr({
          message: 'Invalid voicemailTask parameter',
          error: { statusCode: 400 },
        });
      }

      const scheduleName = `${jobType}-${voicemailTask.attributes.callSid}`;
      const {
        timeout,
        workflowSid,
        attributes: {
          callSid,
          from,
          name,
          channelType,
          ignoreAgent,
          isVoicemail,
          customChannelType,
          routingAttributes,
          transferTargetType,
        },
      } = voicemailTask;
      const scheduledJob: ScheduledJobType = {
        jobType,
        voicemailTask: {
          attributes: {
            callSid,
            from,
            name,
            channelType,
            ignoreAgent,
            isVoicemail,
            customChannelType,
            routingAttributes,
            transferTargetType,
          },
          timeout,
          workflowSid,
        },
      };
      const scheduleExpression = `at(${addHours(Date.now(), 24).toISOString().slice(0, 19)})`; // 24 hours later

      await createScheduledJob({
        scheduledJob,
        scheduleName,
        scheduleExpression,
      });
      console.debug(
        `[${accountSid}] Scheduled job ${scheduleName}  ${scheduledJob.jobType} for account ${accountSid}`,
      );

      return newOk(scheduleName);
    }

    return newErr({
      message: 'Invalid job type',
      error: { statusCode: 400 },
    });
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
