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

import {
  DescribeParametersCommand,
  GetParametersCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import {
  getCachedParameters,
  loadSsmCacheByName,
  ssmCache,
  SsmLoadBackingOff,
} from '../../src';

const SHORT_HELPLINE_REGEX = /^\/[^/]+\/twilio\/AC[^/]+\/short_helpline$/;
// Fakes SSM, returning the listed parameter names in pages of pageSize
const mockSsm = (parameters: Record<string, string>, pageSize = 2) =>
  jest.spyOn(SSMClient.prototype, 'send').mockImplementation(async (command: unknown) => {
    if (command instanceof DescribeParametersCommand) {
      const start = Number(command.input.NextToken ?? 0);
      const names = Object.keys(parameters);
      const end = start + pageSize;
      return {
        Parameters: names.slice(start, end).map(Name => ({ Name })),
        NextToken: end < names.length ? String(end) : undefined,
      };
    }
    if (command instanceof GetParametersCommand) {
      return {
        Parameters: (command.input.Names ?? []).map(Name => ({
          Name,
          Value: parameters[Name],
        })),
      };
    }
    throw new Error('Unexpected command');
  });

const sentCommands = <T>(
  send: jest.SpyInstance,
  commandType: new (...args: any[]) => T,
) =>
  send.mock.calls
    .map(([command]) => command)
    .filter(command => command instanceof commandType);

const loadShortHelplines = () =>
  loadSsmCacheByName({
    configs: [{ nameContains: '/short_helpline', regex: SHORT_HELPLINE_REGEX }],
  });

beforeEach(() => {
  ssmCache.values = {};
  ssmCache.byNameExpiryDates = {};
  ssmCache.byNameRetryDates = {};
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('loadSsmCacheByName', () => {
  test('caches the values of every listed parameter matching the regex, across pages', async () => {
    mockSsm({
      '/production/twilio/AC1/short_helpline': 'ZM',
      '/staging/twilio/AC2/short_helpline': 'EUMC',
      '/production/twilio/AC1/short_helpline_old': 'XX',
      '/development/twilio/AC3/short_helpline': 'AS',
    });

    await loadShortHelplines();

    expect(getCachedParameters(SHORT_HELPLINE_REGEX)).toStrictEqual({
      '/production/twilio/AC1/short_helpline': 'ZM',
      '/staging/twilio/AC2/short_helpline': 'EUMC',
      '/development/twilio/AC3/short_helpline': 'AS',
    });
  });

  test('reads values in batches of at most 10 names', async () => {
    const parameters = Object.fromEntries(
      Array.from({ length: 23 }, (_, i) => [
        `/production/twilio/AC${i}/short_helpline`,
        `H${i}`,
      ]),
    );
    // A single page, so every name is read from the same listing
    const send = mockSsm(parameters, 50);

    await loadShortHelplines();

    const batchSizes = sentCommands(send, GetParametersCommand).map(
      command => command.input.Names?.length,
    );
    expect(batchSizes).toEqual([10, 10, 3]);
    expect(Object.keys(getCachedParameters(SHORT_HELPLINE_REGEX))).toHaveLength(23);
  });

  test('does not call SSM again while the cache has not expired', async () => {
    const send = mockSsm({ '/production/twilio/AC1/short_helpline': 'ZM' });

    await loadShortHelplines();
    await loadShortHelplines();

    expect(sentCommands(send, DescribeParametersCommand)).toHaveLength(1);
  });

  test('backs off after a partially failed load, then loads everything again', async () => {
    const now = Date.now();
    const dateNow = jest.spyOn(Date, 'now').mockReturnValue(now);
    const send = mockSsm({
      '/production/twilio/AC1/short_helpline': 'ZM',
      '/staging/twilio/AC2/short_helpline': 'EUMC',
      '/development/twilio/AC3/short_helpline': 'AS',
    });
    const fakeSsm = send.getMockImplementation()!;
    // Fail listing the second page once, after the first page has been cached
    let hasFailed = false;
    send.mockImplementation(async (command: unknown) => {
      if (
        !hasFailed &&
        command instanceof DescribeParametersCommand &&
        command.input.NextToken
      ) {
        hasFailed = true;
        throw new Error('Throttled');
      }
      return fakeSsm(command as any);
    });

    await expect(loadShortHelplines()).rejects.toThrow('Throttled');
    expect(Object.keys(getCachedParameters(SHORT_HELPLINE_REGEX))).toHaveLength(2);

    // Within the backoff, SSM isn't called again
    send.mockClear();
    dateNow.mockReturnValue(now + 29 * 1000);
    await expect(loadShortHelplines()).rejects.toThrow(SsmLoadBackingOff);
    expect(send).not.toHaveBeenCalled();

    dateNow.mockReturnValue(now + 31 * 1000);
    await loadShortHelplines();

    expect(getCachedParameters(SHORT_HELPLINE_REGEX)).toStrictEqual({
      '/production/twilio/AC1/short_helpline': 'ZM',
      '/staging/twilio/AC2/short_helpline': 'EUMC',
      '/development/twilio/AC3/short_helpline': 'AS',
    });
  });

  test('loads even when other parameters are already in the cache', async () => {
    ssmCache.values['/production/other/parameter'] = {
      value: 'already cached',
      expiryDate: new Date(Date.now() + 60000),
    };
    mockSsm({ '/production/twilio/AC1/short_helpline': 'ZM' });

    await loadShortHelplines();

    expect(getCachedParameters(SHORT_HELPLINE_REGEX)).toStrictEqual({
      '/production/twilio/AC1/short_helpline': 'ZM',
    });
  });

  test('loads a different config while another one has not expired', async () => {
    const send = mockSsm({ '/production/twilio/AC1/short_helpline': 'ZM' });

    await loadShortHelplines();
    await loadSsmCacheByName({ configs: [{ nameContains: '/helpline_name' }] });

    expect(sentCommands(send, DescribeParametersCommand)).toHaveLength(2);
  });
});
