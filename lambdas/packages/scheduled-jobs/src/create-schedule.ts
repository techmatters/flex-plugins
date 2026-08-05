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

import {
  ActionAfterCompletion,
  CreateScheduleCommand,
  FlexibleTimeWindowMode,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';
import { ScheduledJobType } from './scheduled-job';

export const createScheduledJob = async ({
  scheduledJob,
  scheduleName,
  scheduleExpression,
}: {
  scheduledJob: ScheduledJobType;
  scheduleName: string;
  scheduleExpression: string; // e.g. at(yyyy-mm-ddThh:mm:ss)
}) => {
  const schedulerClient = new SchedulerClient({});

  const createdSchedule = await schedulerClient.send(
    new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: scheduleExpression,
      ScheduleExpressionTimezone: 'UTC',
      FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF }, // exact-time firing
      ActionAfterCompletion: ActionAfterCompletion.DELETE, // self-cleans after it fires
      Target: {
        Arn: process.env.JOB_PROCESSOR_LAMBDA_ARN,
        RoleArn: process.env.SCHEDULER_EXECUTION_ROLE_ARN,
        DeadLetterConfig: {
          Arn: process.env.DEAD_LETTER_QUEUE_ARN,
        },
        Input: JSON.stringify(scheduledJob),
        // RetryPolicy: {
        //   MaximumRetryAttempts: 3,
        //   MaximumEventAgeInSeconds: 3600,
        // },
      },
    }),
  );

  return createdSchedule;
};
