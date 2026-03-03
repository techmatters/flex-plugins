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

import { populateCounselorsHandler } from '../../../src/worker/populateCounselors';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import {
  TEST_ACCOUNT_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;

const createMockRequest = (body: any): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
  tokenResult: { worker_sid: TEST_WORKER_SID, roles: ['agent'] },
});

const createMockWorker = (sid: string, attributes: object) => ({
  sid,
  attributes: JSON.stringify(attributes),
});

describe('populateCounselorsHandler', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);

    mockClient = {
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            workers: {
              list: jest.fn().mockResolvedValue([]),
            },
          }),
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockClient as any);
  });

  it('should return all workerSummaries when no helpline is specified', async () => {
    const workers = [
      createMockWorker('WK1', { full_name: 'Alice', helpline: 'helpline-a' }),
      createMockWorker('WK2', { full_name: 'Bob', helpline: 'helpline-b' }),
    ];
    mockClient.taskrouter.v1.workspaces().workers.list.mockResolvedValue(workers);

    const request = createMockRequest({});
    const result = await populateCounselorsHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.workerSummaries).toEqual([
        { sid: 'WK1', fullName: 'Alice' },
        { sid: 'WK2', fullName: 'Bob' },
      ]);
    }
  });

  it('should return filtered workerSummaries when helpline is specified', async () => {
    const workers = [
      createMockWorker('WK1', { full_name: 'Alice', helpline: 'helpline-a' }),
      createMockWorker('WK2', { full_name: 'Bob', helpline: 'helpline-b' }),
      createMockWorker('WK3', { full_name: 'Carol', helpline: '' }),
    ];
    mockClient.taskrouter.v1.workspaces().workers.list.mockResolvedValue(workers);

    const request = createMockRequest({ helpline: 'helpline-a' });
    const result = await populateCounselorsHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.workerSummaries).toEqual([
        { sid: 'WK1', fullName: 'Alice' },
        { sid: 'WK3', fullName: 'Carol' },
      ]);
    }
  });

  it('should return 500 when Twilio client throws an error', async () => {
    mockClient.taskrouter.v1.workspaces.mockReturnValue({
      workers: {
        list: jest.fn().mockRejectedValue(new Error('Twilio error')),
      },
    });

    const request = createMockRequest({});
    const result = await populateCounselorsHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('Twilio error');
    }
  });

  it('should use the workspace SID from configuration', async () => {
    const request = createMockRequest({});
    await populateCounselorsHandler(request, TEST_ACCOUNT_SID);

    expect(mockGetWorkspaceSid).toHaveBeenCalledWith(TEST_ACCOUNT_SID);
    expect(mockClient.taskrouter.v1.workspaces).toHaveBeenCalledWith(TEST_WORKSPACE_SID);
  });
});
