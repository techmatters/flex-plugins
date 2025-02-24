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
import { getSsmParameter } from '../ssmCache';
import { AccountSID } from '../twilioTypes';
import { newErr, newOk, Result } from '../Result';
import { HttpClientError } from '../httpErrors';
import { HrmAccountId } from './types';

const requestFromInternalHrmEndpoint = async <TRequest, TResponse>(
  hrmAccountId: HrmAccountId,
  hrmApiVersion: string,
  path: string,
  body: TRequest,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
): Promise<Result<HttpClientError, TResponse>> => {
  const [accountSid] = hrmAccountId.split('-');
  const [hrmStaticKey] = await Promise.all([
    getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/static_key`),
  ]);
  const endpointUrl = `${process.env.INTERNAL_HRM_URL}/internal/${hrmApiVersion}/accounts/${hrmAccountId}/${path}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${hrmStaticKey}`,
    },
    ...(body === undefined || body === null ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(endpointUrl, options);
  if (!response.ok) {
    const bodyText = await response.text();
    return newErr<HttpClientError>({
      message: bodyText,
      error: new HttpClientError(bodyText, response.status),
    });
  }
  return newOk((await response.json()) as TResponse);
};

export const getFromInternalHrmEndpoint = async <TResponse>(
  accountSid: AccountSID,
  hrmApiVersion: string,
  path: string,
): Promise<Result<HttpClientError, TResponse>> =>
  requestFromInternalHrmEndpoint(accountSid, hrmApiVersion, path, null, 'GET');

export const postToInternalHrmEndpoint = async <TRequest, TResponse>(
  accountSid: AccountSID,
  hrmApiVersion: string,
  path: string,
  body: TRequest,
): Promise<Result<HttpClientError, TResponse>> =>
  requestFromInternalHrmEndpoint(accountSid, hrmApiVersion, path, body, 'GET');
