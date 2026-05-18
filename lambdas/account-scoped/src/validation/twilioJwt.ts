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

import { HttpRequestPipelineStep } from '../httpTypes';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { isErr, newErr, newJsErrorResult, newOk, Result } from '../Result';
import { getApiSecret } from '../webchatAuthentication/createToken';

export const validateRequestWithTwilioJwtToken: HttpRequestPipelineStep = async (
  request,
  { accountSid },
) => {
  const secret = await getApiSecret(accountSid);

  const validationResult = await new Promise<
    Result<VerifyErrors | Error, jwt.JwtPayload | undefined>
  >(res =>
    jwt.verify(request.body.token, secret, {}, (err, decoded) => {
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
  if (isErr(validationResult)) {
    return newErr({
      message: 'Twilio JWT validation failed',
      error: { statusCode: 403, cause: validationResult.error },
    });
  } else {
    console.info(
      'Token is valid for',
      validationResult.data?.grants?.identity,
      accountSid,
    );
    return newOk({
      ...request,
      body: {
        ...request.body,
        validationResult: validationResult.data,
      },
    });
  }
};
