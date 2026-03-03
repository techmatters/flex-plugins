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
import { isErr, isOk } from '../../../src/Result';
import { HttpRequest } from '../../../src/httpTypes';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

jest.mock('../../../src/conversation/interactionChannelParticipants', () => ({
  transitionAgentParticipants: jest.fn(),
}));

import { transitionAgentParticipants } from '../../../src/conversation/interactionChannelParticipants';

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockTransitionAgentParticipants =
  transitionAgentParticipants as jest.MockedFunction<typeof transitionAgentParticipants>;

const FLEX_INTERACTION_SID = 'KDtest';
const FLEX_INTERACTION_CHANNEL_SID = 'UOtest';

const createMockRequest = (body: any): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
});

describe('transitionAgentParticipantsHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTwilioClient.mockResolvedValue({} as any);
    mockTransitionAgentParticipants.mockResolvedValue(undefined);
  });

  test('missing flexInteractionSid - returns 400 error', async () => {
    const result = await transitionAgentParticipantsHandler(
      createMockRequest({
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
        targetStatus: 'closed',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('missing flexInteractionChannelSid - returns 400 error', async () => {
    const result = await transitionAgentParticipantsHandler(
      createMockRequest({
        flexInteractionSid: FLEX_INTERACTION_SID,
        targetStatus: 'closed',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('missing targetStatus - returns 400 error', async () => {
    const result = await transitionAgentParticipantsHandler(
      createMockRequest({
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
    expect(mockTransitionAgentParticipants).not.toHaveBeenCalled();
  });

  test('valid request - calls transitionAgentParticipants and returns success', async () => {
    const result = await transitionAgentParticipantsHandler(
      createMockRequest({
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
        targetStatus: 'closed',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(mockTransitionAgentParticipants).toHaveBeenCalledWith(
      {},
      {
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
      },
      'closed',
      undefined,
    );
  });

  test('valid request with interactionChannelParticipantSid - passes it along', async () => {
    const PARTICIPANT_SID = 'KPtest';

    const result = await transitionAgentParticipantsHandler(
      createMockRequest({
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
        targetStatus: 'closed',
        interactionChannelParticipantSid: PARTICIPANT_SID,
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(mockTransitionAgentParticipants).toHaveBeenCalledWith(
      {},
      {
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
      },
      'closed',
      PARTICIPANT_SID,
    );
  });

  test('transitionAgentParticipants throws - returns 500 error', async () => {
    mockTransitionAgentParticipants.mockRejectedValue(new Error('Twilio error'));

    const result = await transitionAgentParticipantsHandler(
      createMockRequest({
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
        targetStatus: 'closed',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
    }
  });
});
