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

import type { ALBEvent } from 'aws-lambda';
import { getCachedParameters, loadSsmCacheByName } from '@tech-matters/ssm-cache';
import { handler } from '../../index';

jest.mock('@tech-matters/ssm-cache', () => ({
  getCachedParameters: jest.fn(),
  loadSsmCacheByName: jest.fn(),
}));

const mockGetCachedParameters = getCachedParameters as jest.MockedFunction<
  typeof getCachedParameters
>;
const mockLoadSsmCacheByName = loadSsmCacheByName as jest.MockedFunction<
  typeof loadSsmCacheByName
>;

const ACCOUNT_SID = 'ACtest';
const PAYLOAD = { error_code: '11200' };

const debuggerEvent = (): ALBEvent =>
  ({
    body: Buffer.from(
      new URLSearchParams({
        AccountSid: ACCOUNT_SID,
        Level: 'Error',
        Payload: JSON.stringify(PAYLOAD),
      }).toString(),
    ).toString('base64'),
  }) as ALBEvent;

let consoleLog: jest.SpyInstance;
let consoleError: jest.SpyInstance;

beforeEach(() => {
  jest.resetAllMocks();
  consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleLog.mockRestore();
  consoleError.mockRestore();
});

describe('handler', () => {
  test('logs the event with the account loaded from SSM', async () => {
    mockGetCachedParameters.mockReturnValue({
      [`/staging/twilio/${ACCOUNT_SID}/short_helpline`]: 'eumc',
      '/production/twilio/ACother/short_helpline': 'zm',
    });

    await handler(debuggerEvent());

    expect(consoleLog).toHaveBeenCalledWith(
      '[STAGING Error]: ',
      `EUMC_STAGING (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('logs the event as unknown when the account is not in SSM', async () => {
    mockGetCachedParameters.mockReturnValue({});

    await handler(debuggerEvent());

    expect(consoleLog).toHaveBeenCalledWith(
      '[UNKNOWN Error]: ',
      `UNRECOGNISED_ACCOUNT (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('still logs the event, as unknown, when the account lookup fails', async () => {
    const lookupError = new Error('Throttled');
    mockLoadSsmCacheByName.mockRejectedValue(lookupError);

    const response = await handler(debuggerEvent());

    expect(response.statusCode).toBe(200);
    expect(consoleError).toHaveBeenCalledWith(
      `Failed to look up the helpline account for ${ACCOUNT_SID}`,
      lookupError,
    );
    expect(consoleLog).toHaveBeenCalledWith(
      '[UNKNOWN Error]: ',
      `UNRECOGNISED_ACCOUNT (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });
});
