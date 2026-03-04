/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { transitionAgentParticipantsHandler } from '../../../src/conversation/transitionAgentParticipants';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { isErr, isOk, newErr, newOk } from '../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import { TEST_ACCOUNT_SID, TEST_TASK_SID, TEST_WORKER_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

jest.mock('../../../src/conversation/interactionChannelParticipants', () => ({
  transitionAgentParticipants: jest.fn(),
}));

jest.mock('../../../src/task/getTaskAndReservations', () => ({
  getTaskAndReservations: jest.fn(),
  isTaskNotFoundErrorResult: jest.fn(),
  VALID_RESERVATION_STATUSES_FOR_TASK_OWNER: ['accepted', 'wrapping', 'completed'],
}));

import { transitionAgentParticipants } from '../../../src/conversation/interactionChannelParticipants';
import {
  getTaskAndReservations,
  isTaskNotFoundErrorResult,
} from '../../../src/task/getTaskAndReservations';

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockTransitionAgentParticipants =
  transitionAgentParticipants as jest.MockedFunction<typeof transitionAgentParticipants>;
const mockGetTaskAndReservations = getTaskAndReservations as jest.MockedFunction<
  typeof getTaskAndReservations
>;
const mockIsTaskNotFoundErrorResult = isTaskNotFoundErrorResult as jest.MockedFunction<
  typeof isTaskNotFoundErrorResult
>;

const FLEX_INTERACTION_SID = 'KDtest';
const FLEX_INTERACTION_CHANNEL_SID = 'UOtest';

const MOCK_TASK_ATTRIBUTES = {
  flexInteractionSid: FLEX_INTERACTION_SID,
  flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
};

const AGENT_TOKEN_RESULT = {
  worker_sid: TEST_WORKER_SID,
  roles: ['agent'],
};

const SUPERVISOR_TOKEN_RESULT = {
  worker_sid: TEST_WORKER_SID,
  roles: ['supervisor'],
};

const VALID_RESERVATION = {
  workerSid: TEST_WORKER_SID,
  reservationStatus: 'accepted' as any,
};

const createMockRequest = (
  body: any,
  tokenResult = AGENT_TOKEN_RESULT,
): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
  tokenResult,
});

describe('transitionAgentParticipantsHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTwilioClient.mockResolvedValue({} as any);
    mockTransitionAgentParticipants.mockResolvedValue(undefined);
    mockIsTaskNotFoundErrorResult.mockReturnValue(false);
    mockGetTaskAndReservations.mockResolvedValue(
      newOk({
        task: { attributes: JSON.stringify(MOCK_TASK_ATTRIBUTES) } as any,
        reservations: [VALID_RESERVATION] as any,
      }),
    );
  });

  test('missing taskSid - returns 400 error', async () => {
    const result = await transitionAgentParticipantsHandler(
      createMockRequest({ targetStatus: 'closed' }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
    expect(mockGetTaskAndReservations).not.toHaveBeenCalled();
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('missing targetStatus - returns 400 error', async () => {
    const result = await transitionAgentParticipantsHandler(
      createMockRequest({ taskSid: TEST_TASK_SID }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
    expect(mockGetTaskAndReservations).not.toHaveBeenCalled();
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('task not found - returns 404 error', async () => {
    mockGetTaskAndReservations.mockResolvedValue(
      newErr({
        message: 'Task not found',
        error: { type: 'TaskNotFoundError', cause: new Error('not found') },
      }),
    );
    mockIsTaskNotFoundErrorResult.mockReturnValue(true);

    const result = await transitionAgentParticipantsHandler(
      createMockRequest({ taskSid: TEST_TASK_SID, targetStatus: 'closed' }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(404);
    }
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('task lookup fails with unknown error - returns 500', async () => {
    mockGetTaskAndReservations.mockResolvedValue(
      newErr({
        message: 'Unknown error',
        error: { type: 'UnknownError', cause: new Error('unknown') },
      }),
    );
    mockIsTaskNotFoundErrorResult.mockReturnValue(false);

    const result = await transitionAgentParticipantsHandler(
      createMockRequest({ taskSid: TEST_TASK_SID, targetStatus: 'closed' }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
    }
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('agent with no reservation on task - returns 403', async () => {
    mockGetTaskAndReservations.mockResolvedValue(
      newOk({
        task: { attributes: JSON.stringify(MOCK_TASK_ATTRIBUTES) } as any,
        reservations: [] as any,
      }),
    );

    const result = await transitionAgentParticipantsHandler(
      createMockRequest(
        { taskSid: TEST_TASK_SID, targetStatus: 'closed' },
        AGENT_TOKEN_RESULT,
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(403);
    }
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('supervisor with no reservation - allowed (returns success)', async () => {
    mockGetTaskAndReservations.mockResolvedValue(
      newOk({
        task: { attributes: JSON.stringify(MOCK_TASK_ATTRIBUTES) } as any,
        reservations: [] as any,
      }),
    );

    const result = await transitionAgentParticipantsHandler(
      createMockRequest(
        { taskSid: TEST_TASK_SID, targetStatus: 'closed' },
        SUPERVISOR_TOKEN_RESULT,
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(mockTransitionAgentParticipants).toHaveBeenCalledWith(
      {},
      MOCK_TASK_ATTRIBUTES,
      'closed',
      undefined,
    );
  });

  test('agent with valid reservation - calls transitionAgentParticipants and returns success', async () => {
    const result = await transitionAgentParticipantsHandler(
      createMockRequest({ taskSid: TEST_TASK_SID, targetStatus: 'wrapup' }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(mockTransitionAgentParticipants).toHaveBeenCalledWith(
      {},
      MOCK_TASK_ATTRIBUTES,
      'wrapup',
      undefined,
    );
  });

  test('valid request with interactionChannelParticipantSid - passes it along', async () => {
    const PARTICIPANT_SID = 'KPtest';

    const result = await transitionAgentParticipantsHandler(
      createMockRequest({
        taskSid: TEST_TASK_SID,
        targetStatus: 'closed',
        interactionChannelParticipantSid: PARTICIPANT_SID,
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(mockTransitionAgentParticipants).toHaveBeenCalledWith(
      {},
      MOCK_TASK_ATTRIBUTES,
      'closed',
      PARTICIPANT_SID,
    );
  });

  test('transitionAgentParticipants throws - returns 500 error', async () => {
    mockTransitionAgentParticipants.mockRejectedValue(new Error('Twilio error'));

    const result = await transitionAgentParticipantsHandler(
      createMockRequest({ taskSid: TEST_TASK_SID, targetStatus: 'closed' }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
    }
  });
});
