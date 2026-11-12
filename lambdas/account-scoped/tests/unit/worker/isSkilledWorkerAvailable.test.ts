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

import { isSkilledWorkerAvailableHandler } from '../../../src/worker/isSkilledWorkerAvailable';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '@tech-matters/result-type';
import { HttpRequest } from '../../../src/httpTypes';
import { TEST_ACCOUNT_SID, TEST_WORKSPACE_SID } from '../../testTwilioValues';

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

const createMockRequest = (body: any): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
});

type MockChannel = {
  taskChannelUniqueName: string;
  assignedTasks: number;
  configuredCapacity: number;
  available: boolean;
  availableCapacityPercentage: number;
};

const channel = (
  taskChannelUniqueName: string,
  overrides: Partial<MockChannel> = {},
): MockChannel => ({
  taskChannelUniqueName,
  assignedTasks: 0,
  configuredCapacity: 1,
  available: true,
  availableCapacityPercentage: 100,
  ...overrides,
});

const idleChannels = () => [channel('voice'), channel('chat')];

const mockWorker = (sid: string, skills: string[], maxMessageCapacity?: number) => ({
  sid,
  friendlyName: sid,
  attributes: JSON.stringify({ routing: { skills }, maxMessageCapacity }),
});

describe('isSkilledWorkerAvailableHandler', () => {
  let mockWorkersList: jest.Mock;
  let channelsByWorker: Record<string, MockChannel[]>;

  const setWorkers = (workers: ReturnType<typeof mockWorker>[]) =>
    mockWorkersList.mockResolvedValue(workers);

  const checkAvailability = async (targetChannel: string, targetSkills = 'Spanish') => {
    const result = await isSkilledWorkerAvailableHandler(
      createMockRequest({ targetChannel, targetSkills }),
      TEST_ACCOUNT_SID,
    );
    if (!isOk(result)) {
      throw new Error(`Expected an ok result, got ${result.message}`);
    }
    return result.data;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
    channelsByWorker = { WK1: idleChannels() };
    mockWorkersList = jest.fn().mockResolvedValue([mockWorker('WK1', ['Spanish'], 2)]);
    const workers = Object.assign(
      jest.fn((workerSid: string) => ({
        workerChannels: {
          list: jest.fn().mockResolvedValue(channelsByWorker[workerSid]),
        },
      })),
      { list: mockWorkersList },
    );
    mockGetTwilioClient.mockResolvedValue({
      taskrouter: { v1: { workspaces: jest.fn().mockReturnValue({ workers }) } },
    } as any);
  });

  it('should return 400 when targetChannel is invalid', async () => {
    const result = await isSkilledWorkerAvailableHandler(
      createMockRequest({ targetChannel: 'sms', targetSkills: 'Spanish' }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should only list Available workers and keep the response shape', async () => {
    const data = await checkAvailability('chat');

    expect(mockWorkersList).toHaveBeenCalledWith({
      activityName: 'Available',
      available: 'true',
    });
    expect(data).toEqual({
      totalAvailableWorkers: 1,
      availableWorkerSids: ['WK1'],
      availableSkilledWorkers: [
        {
          sid: 'WK1',
          friendlyName: 'WK1',
          maxMessageCapacity: 2,
          workerChannelTasks: [
            {
              taskChannelUniqueName: 'voice',
              assignedTasks: 0,
              available: true,
              availableCapacityPercentage: 100,
            },
            {
              taskChannelUniqueName: 'chat',
              assignedTasks: 0,
              available: true,
              availableCapacityPercentage: 100,
            },
          ],
        },
      ],
    });
  });

  it('should skip workers without every required skill', async () => {
    setWorkers([mockWorker('WK1', ['Spanish'], 2), mockWorker('WK2', ['English'], 2)]);
    channelsByWorker.WK2 = idleChannels();

    const data = await checkAvailability('chat', 'Spanish');

    expect(data.availableWorkerSids).toEqual(['WK1']);
  });

  test.each(['chat', 'voice'])('idle worker - available for %s', async targetChannel => {
    const data = await checkAvailability(targetChannel);

    expect(data.totalAvailableWorkers).toBe(1);
  });

  test.each(['chat', 'voice'])(
    'chat task in wrap-up - not available for %s',
    async targetChannel => {
      // assignedTasks doesn't count the task in wrap-up, but its capacity is still taken
      channelsByWorker.WK1 = [
        channel('voice'),
        channel('chat', { assignedTasks: 0, availableCapacityPercentage: 0 }),
      ];

      const data = await checkAvailability(targetChannel);

      expect(data.totalAvailableWorkers).toBe(0);
    },
  );

  test.each(['chat', 'voice'])(
    'chat channel at capacity (below maxMessageCapacity) - not available for %s',
    async targetChannel => {
      channelsByWorker.WK1 = [
        channel('voice'),
        channel('chat', { assignedTasks: 1, availableCapacityPercentage: 0 }),
      ];

      const data = await checkAvailability(targetChannel);

      expect(data.totalAvailableWorkers).toBe(0);
    },
  );

  it('chat channel with capacity left - available for chat, not for voice', async () => {
    channelsByWorker.WK1 = [
      channel('voice'),
      channel('chat', {
        assignedTasks: 1,
        configuredCapacity: 2,
        availableCapacityPercentage: 50,
      }),
    ];

    expect((await checkAvailability('chat')).totalAvailableWorkers).toBe(1);
    expect((await checkAvailability('voice')).totalAvailableWorkers).toBe(0);
  });

  test.each(['chat', 'voice'])(
    'on a call - not available for %s',
    async targetChannel => {
      channelsByWorker.WK1 = [
        channel('voice', { assignedTasks: 1, availableCapacityPercentage: 0 }),
        channel('chat'),
      ];

      const data = await checkAvailability(targetChannel);

      expect(data.totalAvailableWorkers).toBe(0);
    },
  );

  test.each(['chat', 'voice'])(
    'call in wrap-up - not available for %s',
    async targetChannel => {
      channelsByWorker.WK1 = [
        channel('voice', { assignedTasks: 0, availableCapacityPercentage: 0 }),
        channel('chat'),
      ];

      const data = await checkAvailability(targetChannel);

      expect(data.totalAvailableWorkers).toBe(0);
    },
  );

  test.each(['chat', 'voice'])(
    '%s channel available=false - not available for it',
    async targetChannel => {
      channelsByWorker.WK1 = idleChannels().map(c =>
        c.taskChannelUniqueName === targetChannel ? { ...c, available: false } : c,
      );

      const data = await checkAvailability(targetChannel);

      expect(data.totalAvailableWorkers).toBe(0);
    },
  );

  test.each([
    ['chat', 'chat'],
    ['chat', 'voice'],
    ['voice', 'chat'],
    ['voice', 'voice'],
  ])(
    'target %s, worker without a %s channel - not available',
    async (target, missing) => {
      channelsByWorker.WK1 = idleChannels().filter(
        c => c.taskChannelUniqueName !== missing,
      );

      const data = await checkAvailability(target);

      expect(data.totalAvailableWorkers).toBe(0);
    },
  );

  it('worker without maxMessageCapacity - availability comes from the chat channel', async () => {
    setWorkers([mockWorker('WK1', ['Spanish'])]);

    const data = await checkAvailability('chat');

    expect(data.totalAvailableWorkers).toBe(1);
  });
});
