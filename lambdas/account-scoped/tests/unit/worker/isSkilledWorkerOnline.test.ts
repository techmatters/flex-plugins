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

import { isSkilledWorkerOnlineHandler } from '../../../src/worker/isSkilledWorkerOnline';
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

const mockWorker = (sid: string, skills: string[], activityName = 'Available') => ({
  sid,
  friendlyName: sid,
  activityName,
  attributes: JSON.stringify({ routing: { skills } }),
});

describe('isSkilledWorkerOnlineHandler', () => {
  let mockWorkersList: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
    mockWorkersList = jest
      .fn()
      .mockResolvedValue([
        mockWorker('WK1', ['Spanish', 'Chat']),
        mockWorker('WK2', ['English']),
        mockWorker('WK3', ['Spanish'], 'Break'),
        mockWorker('WK4', ['Spanish', 'Chat'], 'Offline'),
      ]);
    mockGetTwilioClient.mockResolvedValue({
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({ workers: { list: mockWorkersList } }),
        },
      },
    } as any);
  });

  it('should return 400 when targetSkills is missing', async () => {
    const result = await isSkilledWorkerOnlineHandler(
      createMockRequest({}),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('targetSkills');
    }
  });

  it('should return 400 when targetSkills has no valid skills', async () => {
    const result = await isSkilledWorkerOnlineHandler(
      createMockRequest({ targetSkills: ' , ' }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should count non-Offline workers that have every required skill', async () => {
    const result = await isSkilledWorkerOnlineHandler(
      createMockRequest({ targetSkills: 'Spanish' }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toEqual({
        totalOnlineWorkers: 2,
        onlineWorkerSids: ['WK1', 'WK3'],
      });
    }
    expect(mockWorkersList).toHaveBeenCalledWith();
  });

  it('should require all skills when several are supplied', async () => {
    const result = await isSkilledWorkerOnlineHandler(
      createMockRequest({ targetSkills: 'Spanish, Chat' }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.onlineWorkerSids).toEqual(['WK1']);
    }
  });

  it('should also exclude activities passed in excludedActivities, case-insensitively', async () => {
    const result = await isSkilledWorkerOnlineHandler(
      createMockRequest({
        targetSkills: 'Spanish',
        excludedActivities: 'break, Unavailable',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.onlineWorkerSids).toEqual(['WK1']);
    }
  });

  it('should still exclude Offline when excludedActivities does not list it', async () => {
    const result = await isSkilledWorkerOnlineHandler(
      createMockRequest({ targetSkills: 'Spanish,Chat', excludedActivities: 'Break' }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.onlineWorkerSids).toEqual(['WK1']);
    }
  });
});
