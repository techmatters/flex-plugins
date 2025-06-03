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

import { HttpRequestPipelineStep } from '../httpTypes';
import { validator } from 'twilio-flex-token-validator';
import { newErr, newOk } from '../Result';
import { newMissingParameterResult } from '../httpErrors';
import { getAccountAuthToken } from '../configuration/twilioConfiguration';

type TokenValidatorResponse = { worker_sid: string; roles: string[] };

const isWorker = (tokenResult: TokenValidatorResponse) =>
  Boolean(tokenResult.worker_sid) && tokenResult.worker_sid.startsWith('WK');
const isGuest = (tokenResult: TokenValidatorResponse) =>
  Array.isArray(tokenResult.roles) && tokenResult.roles.includes('guest');

export const validateFlexTokenRequest: HttpRequestPipelineStep = async (
  request,
  { accountSid },
) => {
  const { Token: token } = request.body;
  if (!token) {
    return newMissingParameterResult('Token');
  }
  try {
    const tokenResult: TokenValidatorResponse = (await validator(
      token,
      accountSid,
      await getAccountAuthToken(accountSid),
    )) as TokenValidatorResponse;
    const isGuestToken = !isWorker(tokenResult) || isGuest(tokenResult);
    if (isGuestToken) {
      return newErr({
        message: 'Guest tokens are not authorized for this endpoint',
        error: { statusCode: 403 },
      });
    }
    return newOk(request);
  } catch (err) {
    const error = err as Error;

    return newErr({
      message: 'Validating flex token failed',
      error: { statusCode: 403, cause: error },
    });
  }
};
