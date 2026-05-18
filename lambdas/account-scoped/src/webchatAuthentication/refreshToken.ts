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
import { createToken, TOKEN_TTL_IN_SECONDS } from './createToken';
import { newOk } from '../Result';

export const refreshTokenHandler: AccountScopedHandler = async ({ body }, accountSid) => {
  console.info('Refreshing token', accountSid);

  const providedIdentity = body.validationResult?.grants?.identity;

  const refreshedToken = await createToken(accountSid, providedIdentity);

  console.info('Token refreshed', providedIdentity, accountSid);

  return newOk({
    token: refreshedToken,
    expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000,
  });
};
