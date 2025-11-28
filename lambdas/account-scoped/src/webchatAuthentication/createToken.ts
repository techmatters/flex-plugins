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

import { AccountSID } from '@tech-matters/twilio-types';
import { jwt as TwilioJwt } from 'twilio';
import { getChatServiceSid, getHelplineCode } from '@tech-matters/twilio-configuration';
import { getSsmParameter } from '@tech-matters/ssm-cache';

export const TOKEN_TTL_IN_SECONDS = 60 * 60 * 6;

const lookupLegacySsmParameter = async (accountSid: AccountSID, suffix: string) => {
  const shortCode = (await getHelplineCode(accountSid)).toUpperCase();
  //const { NODE_ENV } = process.env!;
  const shortEnv: string = 'DEV';
  /*switch (NODE_ENV) {
    case 'production':
      shortEnv = 'PROD';
      break;
    case 'staging':
      shortEnv = 'STAGING';
      break;
    default:
      shortEnv = 'DEV';
  }*/
  return getSsmParameter(`${shortEnv}_TWILIO_${shortCode}_${suffix}`);
};

export const getApiSecret = async (accountSid: AccountSID): Promise<string> =>
  lookupLegacySsmParameter(accountSid, 'SECRET');

export const createToken = async (accountSid: AccountSID, identity: string) => {
  console.debug('Creating new token', accountSid);

  const apiKey = await lookupLegacySsmParameter(accountSid, 'API_KEY');
  const apiSecret = await getApiSecret(accountSid);

  const { AccessToken } = TwilioJwt;
  const { ChatGrant } = AccessToken;
  const serviceSid = await getChatServiceSid(accountSid);
  const chatGrant = new ChatGrant({
    serviceSid,
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
