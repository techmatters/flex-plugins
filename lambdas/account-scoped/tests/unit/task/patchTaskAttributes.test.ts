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

import { patchTaskAttributes } from '../../../src/task/patchTaskAttributes';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import {
  TEST_ACCOUNT_SID,
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

const TEST_ETAG = '"abc123"';
const ORIGINAL_ATTRIBUTES = { existingKey: 'original', anotherKey: 42 };
const UPDATED_ATTRIBUTES = { existingKey: 'updated', anotherKey: 42, newKey: true };

const makeRestException = (status: number): Error => {
  const err = new Error(`HTTP ${status}`) as any;
  err.status = status;
  return err;
};

describe('patchTaskAttributes', () => {
  let mockFetch: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockClient: any;
  let attributesGenerator: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    attributesGenerator = jest.fn().mockReturnValue(UPDATED_ATTRIBUTES);

    mockFetch = jest.fn().mockResolvedValue({
      attributes: JSON.stringify(ORIGINAL_ATTRIBUTES),
    });
    mockUpdate = jest.fn().mockResolvedValue({});

    mockClient = {
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            tasks: jest.fn().mockReturnValue({
              fetch: mockFetch,
              update: mockUpdate,
            }),
          }),
        },
      },
      httpClient: {
        lastRequest: {
          headers: { eTag: TEST_ETAG },
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockClient as any);
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
  });

  describe('successful patch', () => {
    it('should return an Ok result when fetch and update succeed', async () => {
      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isOk(result)).toBe(true);
    });

    it('should call the updatedAttributesGenerator with the parsed task attributes', async () => {
      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(attributesGenerator).toHaveBeenCalledWith(ORIGINAL_ATTRIBUTES);
    });

    it('should update the task with the generated attributes', async () => {
      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ attributes: JSON.stringify(UPDATED_ATTRIBUTES) }),
      );
    });

    it('should include ifMatch with the ETag from the fetch response', async () => {
      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ ifMatch: TEST_ETAG }),
      );
    });

    it('should update without ifMatch when lastRequest headers contain no eTag', async () => {
      mockClient.httpClient.lastRequest = {
        headers: { 'Content-Type': 'application/json' },
      };

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({ ifMatch: expect.anything() }),
      );
    });

    it('should log a warning when lastRequest headers contain no eTag', async () => {
      mockClient.httpClient.lastRequest = {
        headers: { 'Content-Type': 'application/json' },
      };
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no eTag header'));
      warnSpy.mockRestore();
    });

    it('should update without ifMatch when httpClient has no lastRequest', async () => {
      mockClient.httpClient.lastRequest = null;

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({ ifMatch: expect.anything() }),
      );
    });

    it('should log a warning when httpClient has no lastRequest', async () => {
      mockClient.httpClient.lastRequest = null;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no lastRequest'));
      warnSpy.mockRestore();
    });

    it('should not log a warning when ETag is present', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should fetch the task from the correct workspace', async () => {
      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(mockClient.taskrouter.v1.workspaces).toHaveBeenCalledWith(
        TEST_WORKSPACE_SID,
      );
      expect(
        mockClient.taskrouter.v1.workspaces(TEST_WORKSPACE_SID).tasks,
      ).toHaveBeenCalledWith(TEST_TASK_SID);
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('missing taskSid', () => {
    it('should throw when taskSid is an empty string', async () => {
      await expect(
        patchTaskAttributes(TEST_ACCOUNT_SID, '' as any, attributesGenerator),
      ).rejects.toThrow('TaskSid missing in event object');
    });
  });

  describe('fetch errors', () => {
    it('should return an error result when fetch throws a 404', async () => {
      mockFetch.mockRejectedValue(makeRestException(404));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('fetch');
        expect(result.error.taskSid).toBe(TEST_TASK_SID);
        expect(result.error.accountSid).toBe(TEST_ACCOUNT_SID);
        expect((result.error as any).workspaceSid).toBe(TEST_WORKSPACE_SID);
      }
    });

    it('should include workspaceSid in the error payload when fetch returns 404', async () => {
      mockFetch.mockRejectedValue(makeRestException(404));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect((result.error as any).workspaceSid).toBe(TEST_WORKSPACE_SID);
      }
    });

    it('should return an error result when fetch throws a non-404 error', async () => {
      mockFetch.mockRejectedValue(makeRestException(500));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('fetch');
        expect(result.error.taskSid).toBe(TEST_TASK_SID);
      }
    });

    it('should not include workspaceSid in the error payload when fetch throws a non-404 error', async () => {
      mockFetch.mockRejectedValue(makeRestException(500));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect((result.error as any).workspaceSid).toBeUndefined();
      }
    });
  });

  describe('update errors', () => {
    it('should return an error result when update throws a 404', async () => {
      mockUpdate.mockRejectedValue(makeRestException(404));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('update');
        expect(result.error.taskSid).toBe(TEST_TASK_SID);
        expect((result.error as any).workspaceSid).toBe(TEST_WORKSPACE_SID);
      }
    });

    it('should return an error result when update throws a non-404/412 error', async () => {
      mockUpdate.mockRejectedValue(makeRestException(500));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('update');
        expect(result.error.taskSid).toBe(TEST_TASK_SID);
      }
    });
  });

  describe('optimistic locking - 412 retry mechanism', () => {
    it('should retry once when update returns 412 and succeed on second attempt', async () => {
      mockUpdate.mockRejectedValueOnce(makeRestException(412)).mockResolvedValueOnce({});

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isOk(result)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('should re-fetch the task attributes on each retry attempt', async () => {
      const firstAttributes = { key: 'first' };
      const secondAttributes = { key: 'second' };

      mockFetch
        .mockResolvedValueOnce({ attributes: JSON.stringify(firstAttributes) })
        .mockResolvedValueOnce({ attributes: JSON.stringify(secondAttributes) });

      mockUpdate.mockRejectedValueOnce(makeRestException(412)).mockResolvedValueOnce({});

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(attributesGenerator).toHaveBeenNthCalledWith(1, firstAttributes);
      expect(attributesGenerator).toHaveBeenNthCalledWith(2, secondAttributes);
    });

    it('should succeed after multiple 412 retries', async () => {
      const failureCount = 5;
      for (let i = 0; i < failureCount; i++) {
        mockUpdate.mockRejectedValueOnce(makeRestException(412));
      }
      mockUpdate.mockResolvedValueOnce({});

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isOk(result)).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(failureCount + 1);
    });

    it('should return an error result after exhausting all retry attempts (412 on every attempt)', async () => {
      // MAX_ATTEMPTS is 10; with 1 initial attempt plus 10 retries, 11 total calls are made before giving up
      const totalAttempts = 11;
      for (let i = 0; i < totalAttempts; i++) {
        mockFetch.mockResolvedValueOnce({
          attributes: JSON.stringify(ORIGINAL_ATTRIBUTES),
        });
        mockUpdate.mockRejectedValueOnce(makeRestException(412));
      }

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('update');
        expect(result.error.taskSid).toBe(TEST_TASK_SID);
        expect((result.error as any).etag).toBe(TEST_ETAG);
      }
    });

    it('should include the ETag in the error payload when 412 retries are exhausted', async () => {
      const totalAttempts = 11;
      for (let i = 0; i < totalAttempts; i++) {
        mockFetch.mockResolvedValueOnce({
          attributes: JSON.stringify(ORIGINAL_ATTRIBUTES),
        });
        mockUpdate.mockRejectedValueOnce(makeRestException(412));
      }

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect((result.error as any).etag).toBe(TEST_ETAG);
      }
    });

    it('should make exactly 11 fetch and update calls when all 10 retries are exhausted', async () => {
      const totalAttempts = 11;
      for (let i = 0; i < totalAttempts; i++) {
        mockFetch.mockResolvedValueOnce({
          attributes: JSON.stringify(ORIGINAL_ATTRIBUTES),
        });
        mockUpdate.mockRejectedValueOnce(makeRestException(412));
      }

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(mockFetch).toHaveBeenCalledTimes(totalAttempts);
      expect(mockUpdate).toHaveBeenCalledTimes(totalAttempts);
    });

    it('should use ifMatch on retry attempts', async () => {
      mockUpdate.mockRejectedValueOnce(makeRestException(412)).mockResolvedValueOnce({});

      await patchTaskAttributes(TEST_ACCOUNT_SID, TEST_TASK_SID, attributesGenerator);

      expect(mockUpdate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ ifMatch: TEST_ETAG }),
      );
    });
  });

  describe('error message content', () => {
    it('should include accountSid and taskSid in error messages', async () => {
      mockFetch.mockRejectedValue(makeRestException(500));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toContain(TEST_ACCOUNT_SID);
        expect(result.message).toContain(TEST_TASK_SID);
      }
    });

    it('should include workspaceSid in the error message when task is not found on fetch', async () => {
      mockFetch.mockRejectedValue(makeRestException(404));

      const result = await patchTaskAttributes(
        TEST_ACCOUNT_SID,
        TEST_TASK_SID,
        attributesGenerator,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toContain(TEST_WORKSPACE_SID);
      }
    });
  });
});
