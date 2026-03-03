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

import { checkBlockListHandler } from '../../../src/conversation/checkBlockList';
import { getBlockListKey } from '@tech-matters/twilio-configuration';
import { SsmParameterNotFound } from '@tech-matters/ssm-cache';
import { isErr, isOk } from '../../../src/Result';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';
import { HttpRequest } from '../../../src/httpTypes';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getBlockListKey: jest.fn(),
}));

const mockGetBlockListKey = getBlockListKey as jest.MockedFunction<
  typeof getBlockListKey
>;

const createMockRequest = (body: any): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
});

const TEST_BLOCK_LIST_KEY = 'test-helpline';

describe('checkBlockListHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockGetBlockListKey.mockResolvedValue(TEST_BLOCK_LIST_KEY);
  });

  it('should return 400 when callFrom is missing', async () => {
    const request = createMockRequest({});
    const result = await checkBlockListHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('callFrom');
    }
  });

  it('should return not-blocked when no block list key is configured in SSM', async () => {
    mockGetBlockListKey.mockRejectedValue(
      new SsmParameterNotFound('Parameter not found'),
    );
    const request = createMockRequest({ callFrom: '+12345678901' });
    const result = await checkBlockListHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blocked).toBe(false);
    }
  });

  it('should rethrow unexpected errors from getBlockListKey', async () => {
    mockGetBlockListKey.mockRejectedValue(new Error('Unexpected SSM error'));
    const request = createMockRequest({ callFrom: '+12345678901' });

    await expect(checkBlockListHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'Unexpected SSM error',
    );
  });

  it('should return not-blocked when block list file does not exist', async () => {
    mockGetBlockListKey.mockResolvedValue('nonexistent-key');
    const request = createMockRequest({ callFrom: '+12345678901' });
    const result = await checkBlockListHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blocked).toBe(false);
    }
  });

  it('should return 403 when caller is on the block list', async () => {
    jest.doMock(
      '../../../src/conversation/blockList/test-helpline.json',
      () => ({ numbers: ['+12345678901', '+19876543210'] }),
      { virtual: true },
    );

    const request = createMockRequest({ callFrom: '+12345678901' });
    const result = await checkBlockListHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(403);
      expect(result.message).toContain('blocked');
    }
  });

  it('should return not-blocked when caller is not on the block list', async () => {
    jest.doMock(
      '../../../src/conversation/blockList/test-helpline.json',
      () => ({ numbers: ['+19876543210'] }),
      { virtual: true },
    );

    const request = createMockRequest({ callFrom: '+12345678901' });
    const result = await checkBlockListHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blocked).toBe(false);
    }
  });
});
