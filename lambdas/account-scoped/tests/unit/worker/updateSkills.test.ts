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

import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { retrieveServiceConfigurationTaskRouterSkills } from '../../../src/configuration/aseloConfiguration';
import { handleUpdateWorkersSkills } from '../../../src/worker/updateSkills';
import { HttpRequest } from '../../../src/httpTypes';
import { isErr, isOk } from '../../../src/Result';
import {
  TEST_ACCOUNT_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
}));

jest.mock('../../../src/configuration/aseloConfiguration', () => ({
  retrieveServiceConfigurationTaskRouterSkills: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;
const mockRetrieveServiceConfigurationTaskRouterSkills =
  retrieveServiceConfigurationTaskRouterSkills as jest.MockedFunction<
    typeof retrieveServiceConfigurationTaskRouterSkills
  >;

type WorkerAttributes = {
  routing?: { skills: string[]; levels: Record<string, number> };
  disabled_skills?: { skills: string[]; levels: Record<string, number> };
  [k: string]: any;
};

const createRequest = (body: any): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/taskrouter/update-workers-skills',
  query: {},
  body,
});

const createMockTwilioClient = (
  initialAttributesByWorkerSid: Record<string, WorkerAttributes>,
) => {
  const workerAttributesBySid = new Map<string, WorkerAttributes>(
    Object.entries(initialAttributesByWorkerSid),
  );

  const workerUpdateMocks: Record<string, jest.Mock> = {};

  const workers = jest.fn().mockImplementation((workerSid: string) => {
    const update = jest
      .fn()
      .mockImplementation(({ attributes }: { attributes: string }) => {
        workerAttributesBySid.set(workerSid, JSON.parse(attributes));
        return Promise.resolve();
      });

    workerUpdateMocks[workerSid] = update;

    return {
      fetch: jest.fn().mockResolvedValue({
        attributes: JSON.stringify(workerAttributesBySid.get(workerSid) ?? {}),
        update,
      }),
    };
  });

  const workspaces = jest.fn().mockReturnValue({ workers });

  return {
    client: {
      taskrouter: {
        v1: {
          workspaces,
        },
      },
    },
    workspaces,
    workers,
    workerAttributesBySid,
    workerUpdateMocks,
  };
};

const knownTaskRouterSkills = [
  { name: 'english', multivalue: true as const, minimum: 1, maximum: 10 },
  { name: 'spanish', multivalue: true as const, minimum: 1, maximum: 10 },
  { name: 'french', multivalue: true as const, minimum: 1, maximum: 10 },
  { name: 'german', multivalue: true as const, minimum: 1, maximum: 10 },
];

describe('handleUpdateWorkersSkills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
    mockRetrieveServiceConfigurationTaskRouterSkills.mockResolvedValue(
      knownTaskRouterSkills,
    );
  });

  it.each([
    {
      body: { skills: { english: { level: 1 } }, operation: 'assign' },
      field: 'workers',
    },
    {
      body: { workers: [TEST_WORKER_SID], operation: 'assign' },
      field: 'skills',
    },
    {
      body: { workers: [TEST_WORKER_SID], skills: { english: { level: 1 } } },
      field: 'operation',
    },
    {
      body: {
        workers: [TEST_WORKER_SID],
        skills: { english: { level: 1 } },
        operation: 'invalid-operation',
      },
      field: 'operation',
    },
  ])(
    'returns missing parameter result when $field is invalid',
    async ({ body, field }) => {
      const result = await handleUpdateWorkersSkills(
        createRequest(body),
        TEST_ACCOUNT_SID,
      );

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.statusCode).toBe(400);
        expect(result.message).toContain(field);
      }

      expect(mockGetTwilioClient).not.toHaveBeenCalled();
    },
  );

  it('returns InvalidSkills when a requested skill does not exist', async () => {
    const { client } = createMockTwilioClient({ [TEST_WORKER_SID]: {} });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID],
        skills: { not_existing_skill: { level: 3 } },
        operation: 'assign',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain(
        'InvalidSkill: not_existing_skill skill does not exists',
      );
    }
  });

  it('returns InvalidSkills when an operation that requires levels has invalid level', async () => {
    const { client } = createMockTwilioClient({ [TEST_WORKER_SID]: {} });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID],
        skills: { english: { level: null } },
        operation: 'enable',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('InvalidLevel: english level is not an integer');
    }
  });

  it('returns InvalidSkills when a multivalue level is out of range', async () => {
    const { client } = createMockTwilioClient({ [TEST_WORKER_SID]: {} });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID],
        skills: { english: { level: 11 } },
        operation: 'assign',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain(
        'InvalidLevel: english level is not within the valid range',
      );
    }
  });

  it('applies enable operation correctly', async () => {
    const { client, workerAttributesBySid, workspaces, workers, workerUpdateMocks } =
      createMockTwilioClient({
        [TEST_WORKER_SID]: {
          routing: { skills: ['english'], levels: { english: 1 } },
          disabled_skills: { skills: ['spanish'], levels: { spanish: 2 } },
        },
      });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID],
        skills: { spanish: { level: 4 }, french: { level: 5 } },
        operation: 'enable',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(workspaces).toHaveBeenCalledWith(TEST_WORKSPACE_SID);
    expect(workers).toHaveBeenCalledWith(TEST_WORKER_SID);
    expect(workerUpdateMocks[TEST_WORKER_SID]).toHaveBeenCalledTimes(1);

    const updatedAttributes = workerAttributesBySid.get(TEST_WORKER_SID);
    expect(updatedAttributes?.routing).toEqual({
      skills: expect.arrayContaining(['english', 'spanish', 'french']),
      levels: { english: 1, spanish: 4, french: 5 },
    });
    expect(updatedAttributes?.disabled_skills).toEqual({ skills: [], levels: {} });
  });

  it('applies disable operation correctly', async () => {
    const { client, workerAttributesBySid } = createMockTwilioClient({
      [TEST_WORKER_SID]: {
        routing: { skills: ['english', 'spanish'], levels: { english: 1, spanish: 4 } },
        disabled_skills: { skills: ['french'], levels: { french: 2 } },
      },
    });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID],
        skills: { english: { level: 5 }, german: { level: 6 } },
        operation: 'disable',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);

    const updatedAttributes = workerAttributesBySid.get(TEST_WORKER_SID);
    expect(updatedAttributes?.routing).toEqual({
      skills: ['spanish'],
      levels: { spanish: 4 },
    });
    expect(updatedAttributes?.disabled_skills).toEqual({
      skills: expect.arrayContaining(['french', 'english', 'german']),
      levels: { french: 2, english: 5, german: 6 },
    });
  });

  it('applies assign operation correctly', async () => {
    const { client, workerAttributesBySid } = createMockTwilioClient({
      [TEST_WORKER_SID]: {
        routing: { skills: ['english'], levels: { english: 1 } },
        disabled_skills: { skills: ['french'], levels: { french: 2 } },
      },
    });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID],
        skills: { spanish: { level: 3 } },
        operation: 'assign',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);

    const updatedAttributes = workerAttributesBySid.get(TEST_WORKER_SID);
    expect(updatedAttributes?.routing).toEqual({
      skills: expect.arrayContaining(['english', 'spanish']),
      levels: { english: 1, spanish: 3 },
    });
    expect(updatedAttributes?.disabled_skills).toEqual({
      skills: ['french'],
      levels: { french: 2 },
    });
  });

  it('applies unassign operation correctly for both enabled and disabled skills', async () => {
    const { client, workerAttributesBySid } = createMockTwilioClient({
      [TEST_WORKER_SID]: {
        routing: { skills: ['english', 'spanish'], levels: { english: 1, spanish: 3 } },
        disabled_skills: { skills: ['french'], levels: { french: 2 } },
      },
    });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID],
        skills: { spanish: { level: null }, french: { level: null } },
        operation: 'unassign',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);

    const updatedAttributes = workerAttributesBySid.get(TEST_WORKER_SID);
    expect(updatedAttributes?.routing).toEqual({
      skills: ['english'],
      levels: { english: 1 },
    });
    expect(updatedAttributes?.disabled_skills).toEqual({
      skills: [],
      levels: {},
    });
  });

  it('updates all workers passed in the request', async () => {
    const anotherWorkerSid = 'WKanother';
    const { client, workerAttributesBySid, workers } = createMockTwilioClient({
      [TEST_WORKER_SID]: {
        routing: { skills: [], levels: {} },
        disabled_skills: { skills: [], levels: {} },
      },
      [anotherWorkerSid]: {
        routing: { skills: [], levels: {} },
        disabled_skills: { skills: [], levels: {} },
      },
    });
    mockGetTwilioClient.mockResolvedValue(client as any);

    const result = await handleUpdateWorkersSkills(
      createRequest({
        workers: [TEST_WORKER_SID, anotherWorkerSid],
        skills: { english: { level: 2 } },
        operation: 'assign',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(workers).toHaveBeenCalledTimes(2);
    expect(workerAttributesBySid.get(TEST_WORKER_SID)?.routing?.skills).toEqual([
      'english',
    ]);
    expect(workerAttributesBySid.get(anotherWorkerSid)?.routing?.skills).toEqual([
      'english',
    ]);
  });
});
