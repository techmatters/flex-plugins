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

import each from 'jest-each';
import * as crypto from 'crypto';
import {
  lineToFlexHandler,
  Body,
  LINE_SIGNATURE_HEADER,
} from '../../../../src/customChannels/line/lineToFlex';
import { HttpRequest } from '../../../../src/httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { isOk } from '../../../../src/Result';
import { getTwilioClient } from '@tech-matters/twilio-configuration';

const MOCK_LINE_CHANNEL_SECRET = 'test-line-channel-secret';

jest.mock('../../../../src/customChannels/configuration', () => ({
  getLineChannelSecret: jest.fn().mockResolvedValue('test-line-channel-secret'),
  getChannelStudioFlowSid: jest.fn().mockResolvedValue('LINE_STUDIO_FLOW_SID'),
}));

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

const MOCK_CHANNEL_TYPE = 'line';
const MOCK_USER_ID = 'Uabcdef1234567890';
const MOCK_DESTINATION = 'Udeadbeef1234567890';
const MOCK_SENDER_CHANNEL_SID = `${MOCK_CHANNEL_TYPE}:${MOCK_USER_ID}`;

const newConversation = (sid: string) => ({
  attributes: '{}',
  sid,
  messages: {
    create: jest.fn().mockResolvedValue(`Message sent in channel ${sid}.`),
    list: async () => [],
  },
  webhooks: {
    create: async () => {},
  },
  update: async () => {},
});

const conversations: { [x: string]: any } = {
  [MOCK_SENDER_CHANNEL_SID]: newConversation(MOCK_SENDER_CHANNEL_SID),
};

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
let mockTwilioClient: any;

const ACCOUNT_SID: AccountSID = 'ACxx';

const validBody = ({
  userId = MOCK_USER_ID,
  destination = MOCK_DESTINATION,
  text = 'Hello from Line!',
}: {
  userId?: string;
  destination?: string;
  text?: string;
} = {}): Body => ({
  destination,
  events: [
    {
      type: 'message',
      message: { type: 'text', id: 'msg001', text },
      timestamp: 1234567890,
      replyToken: 'reply-token-001',
      source: { type: 'user', userId },
    },
  ],
});

const computeLineSignature = (body: Body): string => {
  const payloadAsString = JSON.stringify(body);
  return crypto
    .createHmac('sha256', MOCK_LINE_CHANNEL_SECRET)
    .update(payloadAsString)
    .digest('base64');
};

const validHeaders = (body: Body) => ({
  [LINE_SIGNATURE_HEADER]: computeLineSignature(body),
});

describe('LineToFlex', () => {
  beforeEach(() => {
    mockTwilioClient = {
      conversations: {
        v1: {
          conversations: {
            get: (conversationSid: string) => {
              if (!conversations[conversationSid])
                throw new Error('Channel does not exist.');
              return {
                fetch: async () => conversations[conversationSid],
                ...conversations[conversationSid],
              };
            },
          },
          participantConversations: {
            list: () => [{ conversationState: 'active' }],
          },
        },
      },
    };
    mockGetTwilioClient.mockResolvedValue(mockTwilioClient);
  });

  each([
    {
      conditionDescription: 'the x-line-signature header is missing',
      body: validBody(),
      headers: {},
      expectedStatus: 403,
      expectedMessage: 'Forbidden',
    },
    {
      conditionDescription: 'the x-line-signature header is incorrect',
      body: validBody(),
      headers: { [LINE_SIGNATURE_HEADER]: 'invalid-signature' },
      expectedStatus: 403,
      expectedMessage: 'Forbidden',
    },
  ]).test(
    "Should return $expectedStatus '$expectedMessage' when $conditionDescription",
    async ({ body, headers, expectedStatus, expectedMessage }) => {
      const result = await lineToFlexHandler(
        { body, headers } as unknown as HttpRequest,
        ACCOUNT_SID,
      );

      expect(result).toBeDefined();
      if (!isOk(result)) {
        expect(result.error.statusCode).toBe(expectedStatus);
        expect(result.message).toContain(expectedMessage);
      } else {
        throw new Error(`Expected error result but got OK`);
      }
    },
  );

  test('Should return success when there are no message events', async () => {
    const body: Body = { destination: MOCK_DESTINATION, events: [] };
    const headers = { [LINE_SIGNATURE_HEADER]: computeLineSignature(body) };

    const result = await lineToFlexHandler(
      { body, headers } as unknown as HttpRequest,
      ACCOUNT_SID,
    );

    expect(result).toBeDefined();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toMatchObject({ message: 'No messages to send' });
    }
  });

  test('Should return success when there are only non-message events', async () => {
    const body: Body = {
      destination: MOCK_DESTINATION,
      events: [
        {
          type: 'follow',
          message: { type: 'text', id: 'msg001', text: '' },
          timestamp: 1234567890,
          replyToken: 'reply-token-001',
          source: { type: 'user', userId: MOCK_USER_ID },
        },
      ],
    };
    const headers = { [LINE_SIGNATURE_HEADER]: computeLineSignature(body) };

    const result = await lineToFlexHandler(
      { body, headers } as unknown as HttpRequest,
      ACCOUNT_SID,
    );

    expect(result).toBeDefined();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toMatchObject({ message: 'No messages to send' });
    }
  });

  test('Should process a valid Line message and send it to Flex', async () => {
    mockTwilioClient.conversations.v1.participantConversations.list = jest
      .fn()
      .mockResolvedValue([]);
    mockTwilioClient.conversations.v1.conversations.create = jest
      .fn()
      .mockResolvedValue({ sid: MOCK_SENDER_CHANNEL_SID });
    mockTwilioClient.conversations.v1.conversations.get = jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue({ attributes: '{}' }),
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'msg_001' }),
      },
      participants: { create: jest.fn().mockResolvedValue({}) },
      webhooks: { create: jest.fn().mockResolvedValue({}) },
      update: jest.fn().mockResolvedValue({}),
    });

    const body = validBody();
    const headers = validHeaders(body);

    const result = await lineToFlexHandler(
      { body, headers } as unknown as HttpRequest,
      ACCOUNT_SID,
    );

    expect(result).toBeDefined();
    expect(isOk(result)).toBe(true);
  });
});
