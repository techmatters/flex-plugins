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

import { FlexValidatedHandler } from './validation/flexToken';
import type { AccountSID } from '@tech-matters/twilio-types';
import { jwt as TwilioJwt } from 'twilio';
import { getSyncServiceSid } from '@tech-matters/twilio-configuration';
import { getApiKey, getApiSecret } from './webchatAuthentication/createToken';
import { newErr, newOk } from './Result';

export const issueSyncToken = async (
  accountSid: AccountSID,
  identity: string,
): Promise<string> => {
  const syncServiceSid = await getSyncServiceSid(accountSid);
  const apiKey = await getApiKey(accountSid);
  const apiSecret = await getApiSecret(accountSid);

  const { AccessToken } = TwilioJwt;
  const { SyncGrant } = AccessToken;

  const syncGrant = new SyncGrant({ serviceSid: syncServiceSid });

  const accessToken = new AccessToken(accountSid, apiKey, apiSecret, { identity });
  accessToken.addGrant(syncGrant);

  return accessToken.toJwt();
};

export const issueSyncTokenHandler: FlexValidatedHandler = async (
  { tokenResult },
  accountSid,
) => {
  const { identity } = tokenResult;

  if (!identity) {
    return newErr({
      message: 'Identity is missing from token',
      error: { statusCode: 400, cause: new Error('Identity is required') },
    });
  }

  const token = await issueSyncToken(accountSid, identity);
  return newOk({ token });
};
