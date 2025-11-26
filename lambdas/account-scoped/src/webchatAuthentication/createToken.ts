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

import { AccountSID } from '../twilioTypes';
import { jwt as TwilioJwt } from 'twilio';

export const TOKEN_TTL_IN_SECONDS = 60 * 60 * 6;

export const createToken = (
  accountSid: AccountSID,
  apiKey: string,
  apiSecret: string,
  identity: string,
) => {
  console.debug('Creating new token', accountSid);
  const { AccessToken } = TwilioJwt;
  const { ChatGrant } = AccessToken;

  const chatGrant = new ChatGrant({
    serviceSid: process.env.CONVERSATIONS_SERVICE_SID,
  });

  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: TOKEN_TTL_IN_SECONDS,
  });
  token.addGrant(chatGrant);
  const jwt = token.toJwt();
  console.debug('New token created', accountSid);
  return jwt;
};
