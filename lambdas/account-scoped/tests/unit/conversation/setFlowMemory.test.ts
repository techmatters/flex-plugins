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

import { setFlowMemoryHandler } from '../../../src/conversation/setFlowMemory';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '@tech-matters/result-type';
import type { HttpRequest } from '../../../src/httpTypes';
import { TEST_ACCOUNT_SID, TEST_CONVERSATION_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;

const mockFetch = jest.fn();
const mockUpdate = jest.fn();

const createMockClient = () => ({
  conversations: {
    v1: {
      conversations: {
        get: jest.fn().mockReturnValue({ fetch: mockFetch, update: mockUpdate }),
      },
    },
  },
});

const createMockRequest = (body: any): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
});

// The attributes the conversation was updated with
const updatedAttributes = () => JSON.parse(mockUpdate.mock.calls[0][0].attributes);

describe('setFlowMemoryHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTwilioClient.mockResolvedValue(createMockClient() as any);
    mockUpdate.mockResolvedValue({});
  });

  it('keeps the values in flowMemory, leaving the other attributes as they are', async () => {
    mockFetch.mockResolvedValue({
      sid: TEST_CONVERSATION_SID,
      attributes: JSON.stringify({
        channel_type: 'sms',
        memory: { age: '15' },
        preSurveyComplete: true,
      }),
    });

    const result = await setFlowMemoryHandler(
      createMockRequest({
        conversationSid: TEST_CONVERSATION_SID,
        flowMemory: { entryPoint: 'sms_redirect', service: 'tya' },
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toEqual({
        flowMemory: { entryPoint: 'sms_redirect', service: 'tya' },
      });
    }
    expect(updatedAttributes()).toEqual({
      channel_type: 'sms',
      memory: { age: '15' },
      preSurveyComplete: true,
      flowMemory: { entryPoint: 'sms_redirect', service: 'tya' },
    });
  });

  it('adds to what an earlier call kept, replacing values with the same key', async () => {
    mockFetch.mockResolvedValue({
      sid: TEST_CONVERSATION_SID,
      attributes: JSON.stringify({ flowMemory: { entryPoint: 'sms', service: 'std' } }),
    });

    await setFlowMemoryHandler(
      createMockRequest({
        conversationSid: TEST_CONVERSATION_SID,
        // As a JSON string, e.g. from form-encoded parameters
        flowMemory: '{"service": "tya", "attempts": "2"}',
      }),
      TEST_ACCOUNT_SID,
    );

    expect(updatedAttributes().flowMemory).toEqual({
      entryPoint: 'sms',
      service: 'tya',
      attempts: '2',
    });
  });

  it.each([
    [{ flowMemory: { a: '1' } }, 'conversationSid'],
    [{ conversationSid: 'IS123', flowMemory: { a: '1' } }, 'conversationSid'],
    [{ conversationSid: TEST_CONVERSATION_SID }, 'must be an object'],
    [
      { conversationSid: TEST_CONVERSATION_SID, flowMemory: '{not json' },
      'not valid JSON',
    ],
    [{ conversationSid: TEST_CONVERSATION_SID, flowMemory: ['a'] }, 'must be an object'],
    [{ conversationSid: TEST_CONVERSATION_SID, flowMemory: {} }, 'no values'],
    [
      { conversationSid: TEST_CONVERSATION_SID, flowMemory: { '1st': 'x', 'a-b': 'y' } },
      '1st, a-b',
    ],
  ])('rejects %j (400) without touching the conversation', async (body, message) => {
    const result = await setFlowMemoryHandler(createMockRequest(body), TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain(message);
    }
    expect(mockGetTwilioClient).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns 500 when Twilio fails', async () => {
    mockFetch.mockRejectedValue(new Error('Conversation not found'));

    const result = await setFlowMemoryHandler(
      createMockRequest({
        conversationSid: TEST_CONVERSATION_SID,
        flowMemory: { a: '1' },
      }),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('Conversation not found');
    }
  });
});
