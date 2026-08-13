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

import { pullTaskHandler } from '../../../src/worker/pullTask';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { adjustChatCapacity } from '../../../src/conversation/adjustChatCapacity';
import { isErr, isOk } from '../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import {
  TEST_ACCOUNT_SID,
  TEST_TASK_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
}));

jest.mock('../../../src/conversation/adjustChatCapacity', () => ({
  adjustChatCapacity: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;
const mockAdjustChatCapacity = adjustChatCapacity as jest.MockedFunction<
  typeof adjustChatCapacity
>;

const createMockRequest = (body: any): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
  tokenResult: { worker_sid: TEST_WORKER_SID, roles: ['agent'] },
});

const mockReservation = {
  taskSid: TEST_TASK_SID,
  update: jest.fn().mockResolvedValue({}),
};

describe('pullTaskHandler', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
    mockAdjustChatCapacity.mockResolvedValue({ status: 200, message: 'ok' });

    mockClient = {
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            workers: jest.fn().mockReturnValue({
              reservations: {
                list: jest.fn().mockResolvedValue([mockReservation]),
              },
            }),
          }),
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockClient as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return 400 when workerSid is missing', async () => {
    const request = createMockRequest({});
    const result = await pullTaskHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('workerSid');
    }
  });

  it('should return 400 when adjustChatCapacity fails to provide capacity', async () => {
    mockAdjustChatCapacity.mockResolvedValue({
      status: 412,
      message: 'Reached the max capacity with no available capacity.',
    });

    const request = createMockRequest({ workerSid: TEST_WORKER_SID });
    const result = await pullTaskHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
    expect(mockAdjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'increaseUntilCapacityAvailable',
    });
    // setTo1 should still be called in finally
    expect(mockAdjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'setTo1',
    });
  });

  it('should return 404 when no pending reservations are found within the timeout', async () => {
    mockClient.taskrouter.v1
      .workspaces()
      .workers()
      .reservations.list.mockResolvedValue([]);

    const request = createMockRequest({ workerSid: TEST_WORKER_SID });

    // Run the handler and advance timers past the 5s timeout
    const resultPromise = pullTaskHandler(request, TEST_ACCOUNT_SID);
    await jest.runAllTimersAsync();
    const result = await resultPromise;

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(404);
    }
    // setTo1 should be called in finally even on 404
    expect(mockAdjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'setTo1',
    });
  });

  it('should return taskPulled when a pending reservation is found', async () => {
    const request = createMockRequest({ workerSid: TEST_WORKER_SID });

    const resultPromise = pullTaskHandler(request, TEST_ACCOUNT_SID);
    await jest.runAllTimersAsync();
    const result = await resultPromise;

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.taskPulled).toBe(TEST_TASK_SID);
    }
    // reservation.update is commented out in the implementation
    expect(mockReservation.update).not.toHaveBeenCalled();
    // setTo1 should be called in finally
    expect(mockAdjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'setTo1',
    });
  });

  it('should return 500 when Twilio client throws an error', async () => {
    mockClient.taskrouter.v1.workspaces.mockReturnValue({
      workers: jest.fn().mockReturnValue({
        reservations: {
          list: jest.fn().mockRejectedValue(new Error('Twilio error')),
        },
      }),
    });

    const request = createMockRequest({ workerSid: TEST_WORKER_SID });
    const resultPromise = pullTaskHandler(request, TEST_ACCOUNT_SID);
    await jest.runAllTimersAsync();
    const result = await resultPromise;

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('Twilio error');
    }
    // setTo1 should still be called in finally
    expect(mockAdjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'setTo1',
    });
  });

  it('should use the workspace SID from configuration and query pending reservations for the worker', async () => {
    const request = createMockRequest({ workerSid: TEST_WORKER_SID });
    const resultPromise = pullTaskHandler(request, TEST_ACCOUNT_SID);
    await jest.runAllTimersAsync();
    await resultPromise;

    expect(mockGetWorkspaceSid).toHaveBeenCalledWith(TEST_ACCOUNT_SID);
    expect(mockClient.taskrouter.v1.workspaces).toHaveBeenCalledWith(TEST_WORKSPACE_SID);
    expect(mockClient.taskrouter.v1.workspaces().workers).toHaveBeenCalledWith(
      TEST_WORKER_SID,
    );
    expect(
      mockClient.taskrouter.v1.workspaces().workers().reservations.list,
    ).toHaveBeenCalledWith({
      reservationStatus: 'pending',
    });
  });

  it('should call adjustChatCapacity with increaseUntilCapacityAvailable before polling and setTo1 in finally', async () => {
    const request = createMockRequest({ workerSid: TEST_WORKER_SID });
    const resultPromise = pullTaskHandler(request, TEST_ACCOUNT_SID);
    await jest.runAllTimersAsync();
    await resultPromise;

    expect(mockAdjustChatCapacity).toHaveBeenNthCalledWith(1, TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'increaseUntilCapacityAvailable',
    });
    expect(mockAdjustChatCapacity).toHaveBeenLastCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'setTo1',
    });
  });
});
