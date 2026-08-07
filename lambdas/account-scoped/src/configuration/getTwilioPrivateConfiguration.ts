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

import type { AccountSID } from '@tech-matters/twilio-types';
import { getDocsBucketName } from '@tech-matters/twilio-configuration';
import { getS3Object } from '@tech-matters/s3';
import { newErr, newOk } from '../Result';
import { AccountScopedHandler } from '../httpTypes';

const TWILIO_PRIVATE_CONFIGURATION_KEY = 'configuration/twilio-private.json';

export const getTwilioPrivateConfigurationHandler: AccountScopedHandler = async (
  _event,
  accountSid: AccountSID,
) => {
  try {
    const bucket = await getDocsBucketName(accountSid);
    const content = await getS3Object(bucket, TWILIO_PRIVATE_CONFIGURATION_KEY);
    return newOk(JSON.parse(content));
  } catch (err: any) {
    if (err?.name === 'NoSuchKey') {
      return newOk({});
    }
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
