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
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { FlexValidatedHandler } from '../validation/flexToken';
import { newErr, newOk } from '../Result';
import { newMissingParameterResult } from '../httpErrors';

export const getWorkerAttributesHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { workerSid } = event as { workerSid?: string };

  if (workerSid === undefined) {
    return newMissingParameterResult('workerSid');
  }

  try {
    const client = await getTwilioClient(accountSid);
    const workspaceSid = await getWorkspaceSid(accountSid);

    const worker = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workers(workerSid)
      .fetch();

    const workerAttributes = JSON.parse(worker.attributes);

    if (workerAttributes.helpline === undefined) {
      throw new Error(
        'Error: the target worker does not have helpline attribute set, check the worker configuration.',
      );
    }

    const allowedAttributes = {
      helpline: workerAttributes.helpline,
    };

    return newOk(allowedAttributes);
  } catch (err: any) {
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
