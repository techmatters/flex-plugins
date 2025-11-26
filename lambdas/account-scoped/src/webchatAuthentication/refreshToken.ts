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

import { AccountScopedHandler } from '../httpTypes';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { newMissingEnvironmentVariableResult } from '../httpErrors';
import { createToken, TOKEN_TTL_IN_SECONDS } from './createToken';
import { isOk, newErr, newJsErrorResult, newOk, Result } from '../Result';

export const refreshTokenHandler: AccountScopedHandler = async ({ body }, accountSid) => {
  console.info('Refreshing token', accountSid);
  let providedIdentity;
  const { ADDRESS_SID, API_KEY, API_SECRET } = process.env;
  if (!ADDRESS_SID) {
    return newMissingEnvironmentVariableResult('ADDRESS_SID');
  }
  if (!API_KEY) {
    return newMissingEnvironmentVariableResult('API_KEY');
  }
  if (!API_SECRET) {
    return newMissingEnvironmentVariableResult('API_SECRET');
  }
  const validationResult = await new Promise<
    Result<VerifyErrors | Error, jwt.JwtPayload | undefined>
  >(res =>
    jwt.verify(body.token, API_SECRET, {}, (err, decoded) => {
      if (err) return res(newJsErrorResult(err));
      if (typeof decoded === 'string') {
        return res(
          newJsErrorResult(
            new Error(`Decoded token is string not a payload object: '${decoded}'`),
          ),
        );
      }
      return res(newOk(decoded));
    }),
  );
  if (isOk(validationResult)) {
    providedIdentity = validationResult.data?.grants?.identity;
  } else {
    return newErr({
      message: 'Error validating token',
      error: { statusCode: 403, cause: validationResult.error },
    });
  }

  console.info('Token is valid for', providedIdentity, accountSid);

  const refreshedToken = createToken(accountSid, API_KEY, API_SECRET, providedIdentity);

  console.info('Token refreshed', providedIdentity, accountSid);

  return newOk({
    token: refreshedToken,
    expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000,
  });
};
