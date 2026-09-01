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

import { timingSafeEqual } from 'crypto';
import { ALBEvent } from 'aws-lambda';
import { isErr, newErr, newOk, Result } from '@tech-matters/result-type';
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { getAccountSid } from '@tech-matters/twilio-configuration';
import { AccountSID } from '@tech-matters/twilio-types';

export type HttpError = {
  statusCode: number;
  cause?: Error;
};
export const ROUTE_PREFIX = '/lambda/twilio/external-task/';
const getAccountSidFromPath = async (event: ALBEvent) => {
  try {
    if (event.path.startsWith(ROUTE_PREFIX)) {
      const path = event.path.substring(ROUTE_PREFIX.length);
      const [accountShortCode] = path.split('/'); // ignore anothing after account short code

      if (!accountShortCode) {
        const message = 'Missing account short code';
        console.warn(message);
        return newErr<HttpError>({
          message,
          error: { statusCode: 400 },
        });
      }

      const accountSid = await getAccountSid(accountShortCode);
      return newOk({ accountSid, accountShortCode });
    }

    const message = 'Invalid route prefix';
    console.warn(message);
    return newErr<HttpError>({
      message,
      error: { statusCode: 400 },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message, err);
    return newErr<HttpError>({
      message,
      error: { statusCode: 500 },
    });
  }
};

export const authenticateWithExternalApiKey = async ({
  event,
}: {
  event: ALBEvent;
}): Promise<Result<HttpError, { accountSid: AccountSID; accountShortCode: string }>> => {
  if (!event.headers) {
    const message = 'Missing headers in request';
    console.warn(message);
    return newErr({ message, error: { statusCode: 400 } });
  }

  const {
    headers: { authorization },
  } = event;

  if (!authorization || !authorization.startsWith('Basic')) {
    const message = 'Invalid authorization header';
    console.warn(message);
    return newErr({ message, error: { statusCode: 400 } });
  }

  const result = await getAccountSidFromPath(event);

  if (isErr(result)) {
    return result;
  }

  const { accountSid } = result.data;
  const externalTaskApiKeyParam = `/${process.env.NODE_ENV}/twilio/${accountSid}/external_task_api_key`;

  try {
    const requestSecret = authorization.replace('Basic ', '');
    console.debug(`Authenticating against key ${externalTaskApiKeyParam} `);
    const externalTaskApiKey = await getSsmParameter(externalTaskApiKeyParam);

    const isStaticSecretValid =
      externalTaskApiKey &&
      requestSecret &&
      timingSafeEqual(Buffer.from(requestSecret), Buffer.from(externalTaskApiKeyParam));

    if (isStaticSecretValid) {
      console.debug(
        `Successfully authenticated against static key ${externalTaskApiKeyParam}`,
      );

      return newOk(result.data);
    }
  } catch (err) {
    const message = `Static key authentication failed for ${externalTaskApiKeyParam}`;
    console.warn(message, err);
    return newErr({ message, error: { statusCode: 403 } });
  }

  const message = 'Invalid state reached';
  console.warn('authenticateWithExternalApiKey', message);
  return newErr({ message, error: { statusCode: 500 } });
};
