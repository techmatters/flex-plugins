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
import {
  telegramToFlexHandler,
  Body,
  TELEGRAM_BOT_API_SECRET_TOKEN_HEADER,
} from '../../../../src/customChannels/telegram/telegramToFlex';
import { HttpRequest } from '../../../../src/httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { isOk } from '../../../../src/Result';
import { getTwilioClient } from '@tech-matters/twilio-configuration';

const MOCK_BOT_API_SECRET_TOKEN = 'test-bot-api-secret-token';

jest.mock('../../../../src/customChannels/configuration', () => ({
  getTelegramBotApiSecretToken: jest.fn().mockResolvedValue('test-bot-api-secret-token'),
  getChannelStudioFlowSid: jest.fn().mockResolvedValue('TELEGRAM_STUDIO_FLOW_SID'),
}));

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

const MOCK_CHANNEL_TYPE = 'telegram';
const MOCK_SENDER_ID = '123456789';
const MOCK_SENDER_CHANNEL_SID = `${MOCK_CHANNEL_TYPE}:${MOCK_SENDER_ID}`;

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
  senderId = MOCK_SENDER_ID,
  username = 'testuser',
  firstName = 'Test',
  text = 'Hello!',
}: {
  senderId?: string;
  username?: string;
  firstName?: string;
  text?: string;
} = {}): Body => ({
  message: {
    chat: { id: senderId, first_name: firstName, username },
    text,
  },
});

const validHeaders = () => ({
  [TELEGRAM_BOT_API_SECRET_TOKEN_HEADER]: MOCK_BOT_API_SECRET_TOKEN,
});

describe('TelegramToFlex', () => {
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
      conditionDescription: 'the bot API secret token header is missing',
      body: validBody(),
      headers: {},
      expectedStatus: 403,
      expectedMessage: 'Forbidden',
    },
    {
      conditionDescription: 'the bot API secret token header is incorrect',
      body: validBody(),
      headers: { [TELEGRAM_BOT_API_SECRET_TOKEN_HEADER]: 'wrong-token' },
      expectedStatus: 403,
      expectedMessage: 'Forbidden',
    },
  ]).test(
    "Should return $expectedStatus '$expectedMessage' when $conditionDescription",
    async ({ body, headers, expectedStatus, expectedMessage }) => {
      const result = await telegramToFlexHandler(
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

  test('Should process a valid Telegram message and call sendConversationMessageToFlex', async () => {
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

    const result = await telegramToFlexHandler(
      { body: validBody(), headers: validHeaders() } as unknown as HttpRequest,
      ACCOUNT_SID,
    );

    expect(result).toBeDefined();
    expect(isOk(result)).toBe(true);
  });
});
