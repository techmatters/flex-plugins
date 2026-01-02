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

import { AccountScopedHandler, HttpError } from '../httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { newErr, newOk, Result } from '../Result';
import { getSsmParameter, SsmParameterNotFound } from '@tech-matters/ssm-cache';

export const handleLookupSensitiveData: AccountScopedHandler = async (
  { body },
  accountSid: AccountSID,
): Promise<Result<HttpError, any>> => {
  const { key } = body;
  try {
    const value = await getSsmParameter(
      `/${process.env.NODE_ENV}/configuration/${accountSid}/sensitive_data/${key}`,
    );

    return newOk({ value });
  } catch (error) {
    if (error instanceof SsmParameterNotFound) {
      const message = `'${key}' not found as a key for sensitive data lookups in account ${accountSid}`;

      return newErr({
        message,
        error: { cause: error, statusCode: 404 },
      });
    } else throw error;
  }
};
