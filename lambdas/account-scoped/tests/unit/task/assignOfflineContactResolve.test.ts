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

import { assignOfflineContactResolveHandler } from '../../../src/task/assignOfflineContactResolve';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import {
  TEST_ACCOUNT_SID,
  TEST_WORKER_SID,
  TEST_TASK_SID,
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

describe('assignOfflineContactResolveHandler', () => {
  let mockClient: any;
  let mockTask: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);

    mockTask = {
      sid: TEST_TASK_SID,
      attributes: JSON.stringify({ someAttr: 'value' }),
      update: jest
        .fn()
        .mockResolvedValue({ sid: TEST_TASK_SID, assignmentStatus: 'completed' }),
      remove: jest.fn().mockResolvedValue(true),
    };

    mockClient = {
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            tasks: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(mockTask),
              remove: jest.fn().mockResolvedValue(true),
            }),
          }),
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockClient as any);
  });

  it('should return 400 when action is missing', async () => {
    const request = createMockRequest({ taskSid: TEST_TASK_SID });
    const result = await assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('action');
    }
  });

  it('should return 400 when action is invalid', async () => {
    const request = createMockRequest({ action: 'invalid', taskSid: TEST_TASK_SID });
    const result = await assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should return 400 when taskSid is missing', async () => {
    const request = createMockRequest({ action: 'complete' });
    const result = await assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('taskSid');
    }
  });

  it('should return 400 when action is complete but finalTaskAttributes is missing', async () => {
    const request = createMockRequest({ action: 'complete', taskSid: TEST_TASK_SID });
    const result = await assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('finalTaskAttributes');
    }
  });

  it('should complete the task successfully', async () => {
    const finalAttributes = JSON.stringify({ finalAttr: 'value' });
    const request = createMockRequest({
      action: 'complete',
      taskSid: TEST_TASK_SID,
      finalTaskAttributes: finalAttributes,
    });
    const result = await assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    expect(mockTask.update).toHaveBeenCalledWith({ attributes: finalAttributes });
    expect(mockTask.update).toHaveBeenCalledWith({ assignmentStatus: 'completed' });
  });

  it('should throw when completing task fails', async () => {
    mockTask.update.mockRejectedValue(new Error('Task update failed'));

    const request = createMockRequest({
      action: 'complete',
      taskSid: TEST_TASK_SID,
      finalTaskAttributes: JSON.stringify({ finalAttr: 'value' }),
    });

    await expect(
      assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID),
    ).rejects.toThrow('Task update failed');
  });

  it('should remove the task successfully', async () => {
    const request = createMockRequest({ action: 'remove', taskSid: TEST_TASK_SID });
    const result = await assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.taskSid).toBe(TEST_TASK_SID);
    }
  });

  it('should throw when an unexpected error occurs', async () => {
    mockGetTwilioClient.mockRejectedValue(new Error('Connection error'));

    const request = createMockRequest({ action: 'remove', taskSid: TEST_TASK_SID });

    await expect(
      assignOfflineContactResolveHandler(request, TEST_ACCOUNT_SID),
    ).rejects.toThrow('Connection error');
  });
});
