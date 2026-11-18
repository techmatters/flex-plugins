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

import { patchWorker } from '../../../src/worker/patchWorker';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '@tech-matters/result-type';
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

const TEST_ETAG = '"abc123"';
const ORIGINAL_ATTRIBUTES = { existingKey: 'original', anotherKey: 42 };
const UPDATED_ATTRIBUTES = { existingKey: 'updated', anotherKey: 42, newKey: true };
const PREVIOUS_ACTIVITY_SID = 'WAprevious';

const makeRestException = (status: number): Error => {
  const err = new Error(`HTTP ${status}`) as any;
  err.status = status;
  return err;
};

describe('patchWorker', () => {
  let mockFetch: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockClient: any;
  let patchGenerator: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    patchGenerator = jest.fn().mockReturnValue({ attributes: UPDATED_ATTRIBUTES });

    mockFetch = jest.fn().mockResolvedValue({
      activitySid: PREVIOUS_ACTIVITY_SID,
      attributes: JSON.stringify(ORIGINAL_ATTRIBUTES),
    });
    mockUpdate = jest.fn().mockResolvedValue({});

    mockClient = {
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            workers: jest.fn().mockReturnValue({
              fetch: mockFetch,
              update: mockUpdate,
            }),
          }),
        },
      },
      httpClient: {
        lastResponse: {
          headers: { etag: TEST_ETAG },
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockClient as any);
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
  });

  describe('successful patch', () => {
    it('should return an Ok result when fetch and update succeed', async () => {
      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isOk(result)).toBe(true);
    });

    it('should call the patchGenerator with the worker previous activitySid and parsed attributes', async () => {
      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(patchGenerator).toHaveBeenCalledWith({
        activitySid: PREVIOUS_ACTIVITY_SID,
        attributes: ORIGINAL_ATTRIBUTES,
      });
    });

    it('should return the previous activitySid and attributes in the Ok result', async () => {
      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual({
          previousActivitySid: PREVIOUS_ACTIVITY_SID,
          previousAttributes: ORIGINAL_ATTRIBUTES,
        });
      }
    });

    it('should update the worker with the generated attributes', async () => {
      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ attributes: JSON.stringify(UPDATED_ATTRIBUTES) }),
      );
    });

    it('should update the worker with a generated activitySid when provided', async () => {
      patchGenerator.mockReturnValue({ activitySid: 'WAavailable' });

      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ activitySid: 'WAavailable' }),
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({ attributes: expect.anything() }),
      );
    });

    it('should update the worker with rejectPendingReservations when provided', async () => {
      patchGenerator.mockReturnValue({ rejectPendingReservations: true });

      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ rejectPendingReservations: true }),
      );
    });

    it('should include ifMatch with the ETag from the fetch response', async () => {
      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ ifMatch: TEST_ETAG }),
      );
    });

    it('should update without ifMatch when lastResponse headers contain no etag', async () => {
      mockClient.httpClient.lastResponse = {
        headers: { 'Content-Type': 'application/json' },
      };

      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({ ifMatch: expect.anything() }),
      );
    });

    it('should update without ifMatch when httpClient has no lastResponse', async () => {
      mockClient.httpClient.lastResponse = null;

      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({ ifMatch: expect.anything() }),
      );
    });

    it('should fail without updating when an ETag is required but missing', async () => {
      mockClient.httpClient.lastResponse = {
        headers: { 'Content-Type': 'application/json' },
      };

      const result = await patchWorker(
        TEST_ACCOUNT_SID,
        TEST_WORKER_SID,
        patchGenerator,
        {
          requireEtag: true,
        },
      );

      expect(isErr(result)).toBe(true);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should fetch the worker from the correct workspace', async () => {
      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockClient.taskrouter.v1.workspaces).toHaveBeenCalledWith(
        TEST_WORKSPACE_SID,
      );
      expect(
        mockClient.taskrouter.v1.workspaces(TEST_WORKSPACE_SID).workers,
      ).toHaveBeenCalledWith(TEST_WORKER_SID);
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('missing workerSid', () => {
    it('should throw when workerSid is an empty string', async () => {
      await expect(
        patchWorker(TEST_ACCOUNT_SID, '' as any, patchGenerator),
      ).rejects.toThrow('WorkerSid missing in event object');
    });
  });

  describe('fetch errors', () => {
    it('should return an error result when fetch throws a 404', async () => {
      mockFetch.mockRejectedValue(makeRestException(404));

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('fetch');
        expect(result.error.workerSid).toBe(TEST_WORKER_SID);
        expect(result.error.accountSid).toBe(TEST_ACCOUNT_SID);
        expect((result.error as any).workspaceSid).toBe(TEST_WORKSPACE_SID);
      }
    });

    it('should return an error result when fetch throws a non-404 error', async () => {
      mockFetch.mockRejectedValue(makeRestException(500));

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('fetch');
        expect((result.error as any).workspaceSid).toBeUndefined();
      }
    });
  });

  describe('update errors', () => {
    it('should return an error result when update throws a 404', async () => {
      mockUpdate.mockRejectedValue(makeRestException(404));

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('update');
        expect((result.error as any).workspaceSid).toBe(TEST_WORKSPACE_SID);
      }
    });

    it('should return an error result when update throws a non-404/412 error', async () => {
      mockUpdate.mockRejectedValue(makeRestException(500));

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('update');
      }
    });
  });

  describe('optimistic locking - 412 retry mechanism', () => {
    it('should retry once when update returns 412 and succeed on second attempt', async () => {
      mockUpdate.mockRejectedValueOnce(makeRestException(412)).mockResolvedValueOnce({});

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isOk(result)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('should re-fetch the worker on each retry attempt, passing the latest state to patchGenerator', async () => {
      const firstActivitySid = 'WAfirst';
      const secondActivitySid = 'WAsecond';

      mockFetch
        .mockResolvedValueOnce({
          activitySid: firstActivitySid,
          attributes: JSON.stringify(ORIGINAL_ATTRIBUTES),
        })
        .mockResolvedValueOnce({
          activitySid: secondActivitySid,
          attributes: JSON.stringify(ORIGINAL_ATTRIBUTES),
        });

      mockUpdate.mockRejectedValueOnce(makeRestException(412)).mockResolvedValueOnce({});

      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(patchGenerator).toHaveBeenNthCalledWith(1, {
        activitySid: firstActivitySid,
        attributes: ORIGINAL_ATTRIBUTES,
      });
      expect(patchGenerator).toHaveBeenNthCalledWith(2, {
        activitySid: secondActivitySid,
        attributes: ORIGINAL_ATTRIBUTES,
      });
    });

    it('should return an error result after exhausting all retry attempts (412 on every attempt)', async () => {
      // MAX_ATTEMPTS is 10; with 1 initial attempt plus 10 retries, 11 total calls are made before giving up
      const totalAttempts = 11;
      for (let i = 0; i < totalAttempts; i++) {
        mockUpdate.mockRejectedValueOnce(makeRestException(412));
      }

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.step).toBe('update');
        expect((result.error as any).etag).toBe(TEST_ETAG);
      }
      expect(mockFetch).toHaveBeenCalledTimes(totalAttempts);
      expect(mockUpdate).toHaveBeenCalledTimes(totalAttempts);
    });

    it('should use ifMatch on retry attempts', async () => {
      mockUpdate.mockRejectedValueOnce(makeRestException(412)).mockResolvedValueOnce({});

      await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(mockUpdate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ ifMatch: TEST_ETAG }),
      );
    });

    it('propagates an error thrown from within patchGenerator without retrying', async () => {
      const guardError = new Error('worker already waiting for a specific task');
      const throwingGenerator = jest.fn(() => {
        throw guardError;
      });

      await expect(
        patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, throwingGenerator),
      ).rejects.toBe(guardError);

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('error message content', () => {
    it('should include accountSid and workerSid in error messages', async () => {
      mockFetch.mockRejectedValue(makeRestException(500));

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toContain(TEST_ACCOUNT_SID);
        expect(result.message).toContain(TEST_WORKER_SID);
      }
    });

    it('should include workspaceSid in the error message when worker is not found on fetch', async () => {
      mockFetch.mockRejectedValue(makeRestException(404));

      const result = await patchWorker(TEST_ACCOUNT_SID, TEST_WORKER_SID, patchGenerator);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.message).toContain(TEST_WORKSPACE_SID);
      }
    });
  });
});
