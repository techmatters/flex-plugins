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

import { sendMessageAndRunJanitorHandler } from '../../../src/conversation/sendMessageAndRunJanitor';
import { getChatServiceSid, getTwilioClient } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import type { HttpRequest } from '../../../src/httpTypes';
import {
  TEST_ACCOUNT_SID,
  TEST_CHANNEL_SID,
  TEST_CHAT_SERVICE_SID,
  TEST_CONVERSATION_SID,
} from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getChatServiceSid: jest.fn(),
  getWorkspaceSid: jest.fn(),
  getFlexProxyServiceSid: jest.fn(),
}));

// Mock chatChannelJanitor to avoid its complex dependencies
jest.mock('../../../src/conversation/chatChannelJanitor', () => ({
  chatChannelJanitor: jest.fn().mockResolvedValue({ message: 'Deactivation attempted' }),
}));

import { chatChannelJanitor } from '../../../src/conversation/chatChannelJanitor';

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetChatServiceSid = getChatServiceSid as jest.MockedFunction<
  typeof getChatServiceSid
>;
const mockChatChannelJanitor = chatChannelJanitor as jest.MockedFunction<
  typeof chatChannelJanitor
>;

const TEST_MESSAGE = 'Test janitor message';
const TEST_FROM = 'Bot';

const mockConversationWebhookRemove = jest.fn();
const mockConversationWebhookList = jest.fn();
const mockChannelWebhookRemove = jest.fn();
const mockChannelWebhookList = jest.fn();
const mockCreateConversationMessage = jest.fn();
const mockCreateChannelMessage = jest.fn();

const createMockClient = () => ({
  conversations: {
    v1: {
      conversations: {
        get: jest.fn().mockReturnValue({
          webhooks: {
            list: mockConversationWebhookList,
          },
          messages: {
            create: mockCreateConversationMessage,
          },
        }),
      },
    },
  },
  chat: {
    v2: {
      services: {
        get: jest.fn().mockReturnValue({
          channels: {
            get: jest.fn().mockReturnValue({
              webhooks: {
                list: mockChannelWebhookList,
              },
              messages: {
                create: mockCreateChannelMessage,
              },
            }),
          },
        }),
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

describe('sendMessageAndRunJanitorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetChatServiceSid.mockResolvedValue(TEST_CHAT_SERVICE_SID as any);
    mockGetTwilioClient.mockResolvedValue(createMockClient() as any);
    mockCreateConversationMessage.mockResolvedValue({ sid: 'IM_conversation_message' });
    mockCreateChannelMessage.mockResolvedValue({ sid: 'IM_channel_message' });
    mockConversationWebhookList.mockResolvedValue([]);
    mockChannelWebhookList.mockResolvedValue([]);
    mockChatChannelJanitor.mockResolvedValue({
      message: 'Deactivation attempted',
    } as any);
  });

  it('should return 400 when neither channelSid nor conversationSid provided', async () => {
    const request = createMockRequest({ message: TEST_MESSAGE });

    const result = await sendMessageAndRunJanitorHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should remove studio webhook, send message, and run janitor for conversationSid', async () => {
    mockConversationWebhookList.mockResolvedValue([
      { target: 'studio', remove: mockConversationWebhookRemove },
      { target: 'function', remove: jest.fn() },
    ]);
    mockConversationWebhookRemove.mockResolvedValue(true);

    const request = createMockRequest({
      conversationSid: TEST_CONVERSATION_SID,
      message: TEST_MESSAGE,
      from: TEST_FROM,
    });

    const result = await sendMessageAndRunJanitorHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    expect(mockConversationWebhookRemove).toHaveBeenCalledTimes(1);
    expect(mockCreateConversationMessage).toHaveBeenCalledWith({
      body: TEST_MESSAGE,
      author: TEST_FROM,
      xTwilioWebhookEnabled: 'true',
    });
    expect(mockChatChannelJanitor).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      conversationSid: TEST_CONVERSATION_SID,
    });
  });

  it('should not remove non-studio webhooks for conversationSid', async () => {
    mockConversationWebhookList.mockResolvedValue([
      { target: 'function', remove: mockConversationWebhookRemove },
    ]);

    const request = createMockRequest({
      conversationSid: TEST_CONVERSATION_SID,
      message: TEST_MESSAGE,
    });

    await sendMessageAndRunJanitorHandler(request, TEST_ACCOUNT_SID);

    expect(mockConversationWebhookRemove).not.toHaveBeenCalled();
  });

  it('should remove studio webhook, send message, and run janitor for channelSid', async () => {
    mockChannelWebhookList.mockResolvedValue([
      { type: 'studio', remove: mockChannelWebhookRemove },
      { type: 'trigger', remove: jest.fn() },
    ]);
    mockChannelWebhookRemove.mockResolvedValue(true);

    const request = createMockRequest({
      channelSid: TEST_CHANNEL_SID,
      message: TEST_MESSAGE,
      from: TEST_FROM,
    });

    const result = await sendMessageAndRunJanitorHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    expect(mockChannelWebhookRemove).toHaveBeenCalledTimes(1);
    expect(mockCreateChannelMessage).toHaveBeenCalledWith({
      body: TEST_MESSAGE,
      from: TEST_FROM,
      xTwilioWebhookEnabled: 'true',
    });
    expect(mockChatChannelJanitor).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      channelSid: TEST_CHANNEL_SID,
    });
  });

  it('should return 500 when an unexpected error occurs', async () => {
    mockGetTwilioClient.mockRejectedValue(new Error('Connection error'));

    const request = createMockRequest({
      conversationSid: TEST_CONVERSATION_SID,
      message: TEST_MESSAGE,
    });

    const result = await sendMessageAndRunJanitorHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('Connection error');
    }
  });
});
