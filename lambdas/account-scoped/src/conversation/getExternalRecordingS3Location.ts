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

import { FlexValidatedHandler } from '../validation/flexToken';
import type { AccountSID } from '@tech-matters/twilio-types';
import { newErr, newOk } from '../Result';
import { getTwilioClient, getDocsBucketName } from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';

export const getExternalRecordingS3LocationHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { callSid } = event as { callSid?: string };

  if (!callSid) {
    return newMissingParameterResult('callSid');
  }

  try {
    const client = await getTwilioClient(accountSid);
    const bucket = await getDocsBucketName(accountSid);

    const recordings = await client.recordings.list({ callSid, limit: 20 });

    if (recordings.length === 0) {
      return newErr({
        message: 'No recording found',
        error: { statusCode: 404 },
      });
    }
    if (recordings.length > 1) {
      return newErr({
        message: 'More than one recording found',
        error: { statusCode: 409 },
      });
    }

    const recordingSid = recordings[0].sid;
    const key = `voice-recordings/${accountSid}/${recordingSid}`;
    return newOk({ recordingSid, key, bucket });
  } catch (err: any) {
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
