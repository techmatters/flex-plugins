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

import { AccountScopedHandler, HttpError } from '../httpTypes';
import { newErr, newOk, Result } from '../Result';
import { createScheduledJob } from '@tech-matters/scheduled-jobs';

export const handleCreateScheduleJob: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, undefined>> => {
  try {
    // const authToken = await getAccountAuthToken(accountSid);
    // const { hrm_api_version: hrmApiVersion } =
    //   await retrieveServiceConfigurationAttributes(twilio(accountSid, authToken));
    const { scheduledJob, scheduleName, scheduleExpression } = request.body;

    await createScheduledJob({
      scheduledJob,
      scheduleName,
      scheduleExpression,
    });
    console.debug(
      `[${accountSid}] Scheduled job ${scheduleName}  ${scheduledJob.jobType} for account ${accountSid}`,
    );

    return newOk(undefined);
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
