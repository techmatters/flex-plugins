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

import twilio from 'twilio';
import { adjustChatCapacity } from '../../../src/conversation/adjustChatCapacity';
import { RecursivePartial } from '../RecursivePartial';
import {
  TEST_ACCOUNT_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';
import { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { WorkerChannelInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker/workerChannel';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn().mockResolvedValue('WSut'),
}));

import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;

const buildMockWorkerChannel = (
  overrides: Partial<WorkerChannelInstance> = {},
): WorkerChannelInstance => {
  const channel = {
    taskChannelUniqueName: 'chat',
    configuredCapacity: 3,
    availableCapacityPercentage: 0,
    update: jest.fn().mockImplementation(async (params: { capacity?: number }) => {
      if (params?.capacity !== undefined) {
        channel.configuredCapacity = params.capacity;
        channel.availableCapacityPercentage =
          params.capacity > 0 ? (1 / params.capacity) * 100 : 0;
      }
      return channel as WorkerChannelInstance;
    }),
    ...overrides,
  } as unknown as WorkerChannelInstance;
  return channel;
};

const buildMockWorker = (
  maxMessageCapacity: number | undefined,
  channels: WorkerChannelInstance[],
): WorkerInstance => {
  return {
    attributes: JSON.stringify({
      ...(maxMessageCapacity !== undefined ? { maxMessageCapacity } : {}),
    }),
    workerChannels: jest.fn().mockReturnValue({
      list: jest.fn().mockResolvedValue(channels),
    }),
  } as unknown as WorkerInstance;
};

describe('adjustChatCapacity', () => {
  let mockTwilioClient: RecursivePartial<twilio.Twilio>;
  let mockWorkerFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWorkerFetch = jest.fn();
    mockTwilioClient = {
      taskrouter: {
        v1: {
          workspaces: {
            get: (workspaceSid: string) => {
              if (workspaceSid === TEST_WORKSPACE_SID) {
                return {
                  workers: () => ({
                    fetch: mockWorkerFetch,
                  }),
                };
              }
              throw new Error(`Unexpected workspace SID: ${workspaceSid}`);
            },
          },
        },
      },
    };
    mockGetTwilioClient.mockResolvedValue(mockTwilioClient as twilio.Twilio);
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID);
  });

  describe('setTo1 adjustment', () => {
    test('channel capacity is already 1 - returns 200 with no update', async () => {
      const channel = buildMockWorkerChannel({ configuredCapacity: 1 });
      mockWorkerFetch.mockResolvedValue(buildMockWorker(5, [channel]));

      const result = await adjustChatCapacity(TEST_ACCOUNT_SID, {
        workerSid: TEST_WORKER_SID,
        adjustment: 'setTo1',
      });

      expect(result).toEqual({
        status: 200,
        message: 'Channel capacity already 1, no adjustment made.',
      });
      expect(channel.update).not.toHaveBeenCalled();
    });

    test('channel capacity is greater than 1 - resets to 1', async () => {
      const channel = buildMockWorkerChannel({ configuredCapacity: 3 });
      mockWorkerFetch.mockResolvedValue(buildMockWorker(5, [channel]));

      const result = await adjustChatCapacity(TEST_ACCOUNT_SID, {
        workerSid: TEST_WORKER_SID,
        adjustment: 'setTo1',
      });

      expect(result).toEqual({
        status: 200,
        message: 'Successfully reset channel capacity to 1',
      });
      expect(channel.update).toHaveBeenCalledWith({ capacity: 1 });
    });

    test('worker has no maxMessageCapacity - returns 409', async () => {
      const channel = buildMockWorkerChannel({ configuredCapacity: 3 });
      mockWorkerFetch.mockResolvedValue(buildMockWorker(undefined, [channel]));

      const result = await adjustChatCapacity(TEST_ACCOUNT_SID, {
        workerSid: TEST_WORKER_SID,
        adjustment: 'setTo1',
      });

      expect(result.status).toBe(409);
      expect(channel.update).not.toHaveBeenCalled();
    });

    test('no chat channel found - returns 404', async () => {
      const voiceChannel = buildMockWorkerChannel({
        taskChannelUniqueName: 'voice',
        configuredCapacity: 1,
      });
      mockWorkerFetch.mockResolvedValue(buildMockWorker(5, [voiceChannel]));

      const result = await adjustChatCapacity(TEST_ACCOUNT_SID, {
        workerSid: TEST_WORKER_SID,
        adjustment: 'setTo1',
      });

      expect(result).toEqual({ status: 404, message: 'Could not find chat channel.' });
    });
  });

  describe('increaseUntilCapacityAvailable adjustment', () => {
    test('already has available capacity - returns 200 without update', async () => {
      const channel = buildMockWorkerChannel({
        configuredCapacity: 2,
        availableCapacityPercentage: 50,
      });
      mockWorkerFetch.mockResolvedValue(buildMockWorker(5, [channel]));

      const result = await adjustChatCapacity(TEST_ACCOUNT_SID, {
        workerSid: TEST_WORKER_SID,
        adjustment: 'increaseUntilCapacityAvailable',
      });

      expect(result).toEqual({
        status: 200,
        message: 'Adjusted chat capacity until there is capacity available',
      });
      expect(channel.update).not.toHaveBeenCalled();
    });

    test('at capacity with room to increase - increases capacity by 1', async () => {
      const channel = buildMockWorkerChannel({
        configuredCapacity: 2,
        availableCapacityPercentage: 0,
      });
      channel.update = jest.fn().mockImplementation(async () => {
        // After update, simulate capacity increased and now available
        return {
          ...channel,
          configuredCapacity: 3,
          availableCapacityPercentage: 33,
        } as unknown as WorkerChannelInstance;
      });
      mockWorkerFetch.mockResolvedValue(buildMockWorker(5, [channel]));

      const result = await adjustChatCapacity(TEST_ACCOUNT_SID, {
        workerSid: TEST_WORKER_SID,
        adjustment: 'increaseUntilCapacityAvailable',
      });

      expect(result).toEqual({
        status: 200,
        message: 'Adjusted chat capacity until there is capacity available',
      });
      expect(channel.update).toHaveBeenCalledWith({ capacity: 3 });
    });

    test('at max capacity with no available capacity - returns 412', async () => {
      const channel = buildMockWorkerChannel({
        configuredCapacity: 5,
        availableCapacityPercentage: 0,
      });
      mockWorkerFetch.mockResolvedValue(buildMockWorker(5, [channel]));

      const result = await adjustChatCapacity(TEST_ACCOUNT_SID, {
        workerSid: TEST_WORKER_SID,
        adjustment: 'increaseUntilCapacityAvailable',
      });

      expect(result).toEqual({
        status: 412,
        message: 'Reached the max capacity with no available capacity.',
      });
      expect(channel.update).not.toHaveBeenCalled();
    });
  });
});
