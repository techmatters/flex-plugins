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

import {
  sendSystemMessage,
  sendSystemMessageHandler,
} from '../../../src/conversation/sendSystemMessage';
import {
  getChatServiceSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import {
  TEST_ACCOUNT_SID,
  TEST_CHANNEL_SID,
  TEST_CHAT_SERVICE_SID,
  TEST_CONVERSATION_SID,
  TEST_TASK_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getChatServiceSid: jest.fn(),
  getWorkspaceSid: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetChatServiceSid = getChatServiceSid as jest.MockedFunction<
  typeof getChatServiceSid
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;

const TEST_MESSAGE = 'Test system message';
const TEST_FROM = 'Bot';

const mockCreateConversationMessage = jest.fn();
const mockCreateChannelMessage = jest.fn();
const mockFetchTask = jest.fn();

const createMockClient = () => ({
  conversations: {
    v1: {
      conversations: {
        get: jest.fn().mockReturnValue({
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
              messages: {
                create: mockCreateChannelMessage,
              },
            }),
          },
        }),
      },
    },
  },
  taskrouter: {
    v1: {
      workspaces: {
        get: jest.fn().mockReturnValue({
          tasks: {
            get: jest.fn().mockReturnValue({
              fetch: mockFetchTask,
            }),
          },
        }),
      },
    },
  },
});

const createMockRequest = (body: any): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
  tokenResult: { worker_sid: 'WK1234', roles: ['agent'] },
});

describe('sendSystemMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetChatServiceSid.mockResolvedValue(TEST_CHAT_SERVICE_SID as any);
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
    mockGetTwilioClient.mockResolvedValue(createMockClient() as any);
    mockCreateConversationMessage.mockResolvedValue({ sid: 'IM_conversation_message' });
    mockCreateChannelMessage.mockResolvedValue({ sid: 'IM_channel_message' });
  });

  it('should return 400 when none of channelSid, conversationSid, taskSid provided', async () => {
    const result = await sendSystemMessage(TEST_ACCOUNT_SID, {
      message: TEST_MESSAGE,
    } as any);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('channelSid');
    }
  });

  it('should return 400 when message is missing', async () => {
    const result = await sendSystemMessage(TEST_ACCOUNT_SID, {
      conversationSid: TEST_CONVERSATION_SID,
    } as any);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('message');
    }
  });

  it('should send message to conversation when conversationSid provided', async () => {
    const result = await sendSystemMessage(TEST_ACCOUNT_SID, {
      conversationSid: TEST_CONVERSATION_SID,
      message: TEST_MESSAGE,
      from: TEST_FROM,
    });

    expect(isOk(result)).toBe(true);
    expect(mockCreateConversationMessage).toHaveBeenCalledWith({
      body: TEST_MESSAGE,
      author: TEST_FROM,
      xTwilioWebhookEnabled: 'true',
    });
  });

  it('should send message to channel when channelSid provided', async () => {
    const result = await sendSystemMessage(TEST_ACCOUNT_SID, {
      channelSid: TEST_CHANNEL_SID,
      message: TEST_MESSAGE,
      from: TEST_FROM,
    });

    expect(isOk(result)).toBe(true);
    expect(mockCreateChannelMessage).toHaveBeenCalledWith({
      body: TEST_MESSAGE,
      from: TEST_FROM,
      xTwilioWebhookEnabled: 'true',
    });
  });

  it('should look up task and send to conversation when taskSid provided and task has conversationSid', async () => {
    mockFetchTask.mockResolvedValue({
      attributes: JSON.stringify({ conversationSid: TEST_CONVERSATION_SID }),
    });

    const result = await sendSystemMessage(TEST_ACCOUNT_SID, {
      taskSid: TEST_TASK_SID,
      message: TEST_MESSAGE,
      from: TEST_FROM,
    });

    expect(isOk(result)).toBe(true);
    expect(mockCreateConversationMessage).toHaveBeenCalledWith({
      body: TEST_MESSAGE,
      author: TEST_FROM,
      xTwilioWebhookEnabled: 'true',
    });
  });

  it('should look up task and send to channel when taskSid provided and task has channelSid', async () => {
    mockFetchTask.mockResolvedValue({
      attributes: JSON.stringify({ channelSid: TEST_CHANNEL_SID }),
    });

    const result = await sendSystemMessage(TEST_ACCOUNT_SID, {
      taskSid: TEST_TASK_SID,
      message: TEST_MESSAGE,
      from: TEST_FROM,
    });

    expect(isOk(result)).toBe(true);
    expect(mockCreateChannelMessage).toHaveBeenCalledWith({
      body: TEST_MESSAGE,
      from: TEST_FROM,
      xTwilioWebhookEnabled: 'true',
    });
  });

  it('should return 400 when task has neither channelSid nor conversationSid', async () => {
    mockFetchTask.mockResolvedValue({
      attributes: JSON.stringify({}),
    });

    const result = await sendSystemMessage(TEST_ACCOUNT_SID, {
      taskSid: TEST_TASK_SID,
      message: TEST_MESSAGE,
    });

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });
});

describe('sendSystemMessageHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetChatServiceSid.mockResolvedValue(TEST_CHAT_SERVICE_SID as any);
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
    mockGetTwilioClient.mockResolvedValue(createMockClient() as any);
    mockCreateConversationMessage.mockResolvedValue({ sid: 'IM_conversation_message' });
  });

  it('should successfully send message via handler', async () => {
    const request = createMockRequest({
      conversationSid: TEST_CONVERSATION_SID,
      message: TEST_MESSAGE,
    });

    const result = await sendSystemMessageHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
  });

  it('should return 500 when an unexpected error occurs', async () => {
    mockGetTwilioClient.mockRejectedValue(new Error('Connection error'));

    const request = createMockRequest({
      conversationSid: TEST_CONVERSATION_SID,
      message: TEST_MESSAGE,
    });

    const result = await sendSystemMessageHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('Connection error');
    }
  });
});
