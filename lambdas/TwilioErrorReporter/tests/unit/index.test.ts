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
import { acquireLock, getCachedItem, putCachedItems } from '@tech-matters/dynamo-cache';
import { getCachedParameters, loadSsmCacheByName } from '@tech-matters/ssm-cache';
import { handler } from '../../index';

jest.mock('@tech-matters/dynamo-cache', () => ({
  acquireLock: jest.fn(),
  getCachedItem: jest.fn(),
  putCachedItems: jest.fn(),
}));
jest.mock('@tech-matters/ssm-cache', () => ({
  getCachedParameters: jest.fn(),
  loadSsmCacheByName: jest.fn(),
}));

const mockAcquireLock = acquireLock as jest.MockedFunction<typeof acquireLock>;
const mockGetCachedItem = getCachedItem as jest.MockedFunction<typeof getCachedItem>;
const mockPutCachedItems = putCachedItems as jest.MockedFunction<typeof putCachedItems>;
const mockGetCachedParameters = getCachedParameters as jest.MockedFunction<
  typeof getCachedParameters
>;
const mockLoadSsmCacheByName = loadSsmCacheByName as jest.MockedFunction<
  typeof loadSsmCacheByName
>;

const ACCOUNT_SID = 'ACtest';
const PAYLOAD = { error_code: '11200' };
const NOW_SECONDS = 1_800_000_000;
const THREE_DAYS_SECONDS = 3 * 24 * 60 * 60;

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
  mockPutCachedItems.mockResolvedValue();
  mockAcquireLock.mockResolvedValue(true);
  jest.spyOn(Date, 'now').mockReturnValue(NOW_SECONDS * 1000);
  consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('handler', () => {
  test('uses the account stored in DynamoDB without reading SSM', async () => {
    mockGetCachedItem.mockResolvedValue({
      accountSid: ACCOUNT_SID,
      environment: 'production',
      shortHelpline: 'ZM',
    });

    await handler(debuggerEvent());

    expect(mockLoadSsmCacheByName).not.toHaveBeenCalled();
    expect(mockPutCachedItems).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalledWith(
      '[PRODUCTION Error]: ',
      `ZM_PRODUCTION (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('treats an account stored without a short helpline as unknown, without reading SSM', async () => {
    mockGetCachedItem.mockResolvedValue({
      accountSid: ACCOUNT_SID,
      expiresAt: NOW_SECONDS + 60,
    });

    await handler(debuggerEvent());

    expect(mockLoadSsmCacheByName).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalledWith(
      '[UNKNOWN Error]: ',
      `UNRECOGNISED_ACCOUNT (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('reads SSM again once an account stored as unknown has expired', async () => {
    mockGetCachedItem.mockResolvedValue({
      accountSid: ACCOUNT_SID,
      expiresAt: NOW_SECONDS - 1,
    });
    mockGetCachedParameters.mockReturnValue({
      [`/staging/twilio/${ACCOUNT_SID}/short_helpline`]: 'eumc',
    });

    await handler(debuggerEvent());

    expect(mockPutCachedItems).toHaveBeenCalledWith(expect.anything(), [
      { accountSid: ACCOUNT_SID, environment: 'staging', shortHelpline: 'EUMC' },
    ]);
    expect(consoleLog).toHaveBeenCalledWith(
      '[STAGING Error]: ',
      `EUMC_STAGING (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('loads an account missing from DynamoDB from SSM and stores every loaded account', async () => {
    mockGetCachedItem.mockResolvedValue(undefined);
    mockGetCachedParameters.mockReturnValue({
      [`/staging/twilio/${ACCOUNT_SID}/short_helpline`]: 'eumc',
      '/production/twilio/ACother/short_helpline': 'zm',
    });

    await handler(debuggerEvent());

    expect(mockPutCachedItems).toHaveBeenCalledWith(expect.anything(), [
      { accountSid: ACCOUNT_SID, environment: 'staging', shortHelpline: 'EUMC' },
      { accountSid: 'ACother', environment: 'production', shortHelpline: 'ZM' },
    ]);
    expect(consoleLog).toHaveBeenCalledWith(
      '[STAGING Error]: ',
      `EUMC_STAGING (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('stores an account missing from both DynamoDB and SSM with just its SID, expiring in 3 days, with the loaded accounts', async () => {
    mockGetCachedItem.mockResolvedValue(undefined);
    mockGetCachedParameters.mockReturnValue({
      '/production/twilio/ACother/short_helpline': 'zm',
    });

    await handler(debuggerEvent());

    expect(mockPutCachedItems).toHaveBeenCalledWith(expect.anything(), [
      { accountSid: 'ACother', environment: 'production', shortHelpline: 'ZM' },
      { accountSid: ACCOUNT_SID, expiresAt: NOW_SECONDS + THREE_DAYS_SECONDS },
    ]);
    expect(consoleLog).toHaveBeenCalledWith(
      '[UNKNOWN Error]: ',
      `UNRECOGNISED_ACCOUNT (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('still logs the event, as unknown, without storing anything when the SSM lookup fails', async () => {
    const lookupError = new Error('Throttled');
    mockGetCachedItem.mockResolvedValue(undefined);
    mockLoadSsmCacheByName.mockRejectedValue(lookupError);

    const response = await handler(debuggerEvent());

    expect(response.statusCode).toBe(200);
    expect(mockPutCachedItems).not.toHaveBeenCalled();
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

  test('still logs the event with the account loaded from SSM when storing it fails', async () => {
    const storeError = new Error('Throttled');
    mockGetCachedItem.mockResolvedValue(undefined);
    mockGetCachedParameters.mockReturnValue({
      [`/staging/twilio/${ACCOUNT_SID}/short_helpline`]: 'eumc',
    });
    mockPutCachedItems.mockRejectedValue(storeError);

    const response = await handler(debuggerEvent());

    expect(response.statusCode).toBe(200);
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to store the helpline accounts',
      storeError,
    );
    expect(consoleLog).toHaveBeenCalledWith(
      '[STAGING Error]: ',
      `EUMC_STAGING (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('reads SSM directly, without waiting or storing, when the table is unavailable', async () => {
    mockGetCachedItem.mockRejectedValue(new Error('Table not found'));
    mockGetCachedParameters.mockReturnValue({
      [`/staging/twilio/${ACCOUNT_SID}/short_helpline`]: 'eumc',
    });

    await handler(debuggerEvent());

    expect(mockLoadSsmCacheByName).toHaveBeenCalled();
    expect(mockAcquireLock).not.toHaveBeenCalled();
    expect(mockPutCachedItems).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalledWith(
      '[STAGING Error]: ',
      `EUMC_STAGING (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('takes the SSM load lock for 30 seconds before repopulating the table', async () => {
    mockGetCachedItem.mockResolvedValue(undefined);
    mockGetCachedParameters.mockReturnValue({});

    await handler(debuggerEvent());

    expect(mockAcquireLock).toHaveBeenCalledWith(expect.anything(), 'lock:ssm-load', 30);
  });

  test('uses only what the container has in memory, without reading SSM or storing, when another invocation holds the lock', async () => {
    mockGetCachedItem.mockResolvedValue(undefined);
    mockAcquireLock.mockResolvedValue(false);
    mockGetCachedParameters.mockReturnValue({
      [`/staging/twilio/${ACCOUNT_SID}/short_helpline`]: 'eumc',
    });

    await handler(debuggerEvent());

    expect(mockLoadSsmCacheByName).not.toHaveBeenCalled();
    expect(mockPutCachedItems).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalledWith(
      '[STAGING Error]: ',
      `EUMC_STAGING (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('logs the event as unknown, without storing it, when another invocation holds the lock and the container has nothing in memory', async () => {
    mockGetCachedItem.mockResolvedValue(undefined);
    mockAcquireLock.mockResolvedValue(false);
    mockGetCachedParameters.mockReturnValue({});

    await handler(debuggerEvent());

    expect(mockLoadSsmCacheByName).not.toHaveBeenCalled();
    expect(mockPutCachedItems).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalledWith(
      '[UNKNOWN Error]: ',
      `UNRECOGNISED_ACCOUNT (${ACCOUNT_SID})`,
      PAYLOAD,
    );
  });

  test('does not read SSM when taking the lock fails', async () => {
    const lockError = new Error('Throttled');
    mockGetCachedItem.mockResolvedValue(undefined);
    mockAcquireLock.mockRejectedValue(lockError);
    mockGetCachedParameters.mockReturnValue({});

    await handler(debuggerEvent());

    expect(mockLoadSsmCacheByName).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to acquire the SSM load lock',
      lockError,
    );
  });
});
