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

import { sendStudioMessageHandler } from '../../../src/conversation/sendStudioMessage';
import { getChatServiceSid, getTwilioClient } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import type { HttpRequest } from '../../../src/httpTypes';
import {
  TEST_ACCOUNT_SID,
  TEST_CHANNEL_SID,
  TEST_CHAT_SERVICE_SID,
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

const TEST_MESSAGE = 'Test studio message';
const TEST_FROM = 'Bot';

const mockWebhookRemove = jest.fn();
const mockWebhookList = jest.fn();
const mockCreateChannelMessage = jest.fn();

const createMockClient = () => ({
  chat: {
    v2: {
      services: {
        get: jest.fn().mockReturnValue({
          channels: {
            get: jest.fn().mockReturnValue({
              webhooks: {
                list: mockWebhookList,
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

describe('sendStudioMessageHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetChatServiceSid.mockResolvedValue(TEST_CHAT_SERVICE_SID as any);
    mockGetTwilioClient.mockResolvedValue(createMockClient() as any);
    mockCreateChannelMessage.mockResolvedValue({ sid: 'IM_channel_message' });
    mockWebhookList.mockResolvedValue([]);
  });

  it('should remove studio webhook and send message', async () => {
    mockWebhookList.mockResolvedValue([
      { type: 'studio', remove: mockWebhookRemove },
      { type: 'trigger', remove: jest.fn() },
    ]);
    mockWebhookRemove.mockResolvedValue(true);

    const request = createMockRequest({
      channelSid: TEST_CHANNEL_SID,
      message: TEST_MESSAGE,
      from: TEST_FROM,
    });

    const result = await sendStudioMessageHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    expect(mockWebhookRemove).toHaveBeenCalledTimes(1);
    expect(mockCreateChannelMessage).toHaveBeenCalledWith({
      body: TEST_MESSAGE,
      from: TEST_FROM,
      xTwilioWebhookEnabled: 'true',
    });
  });

  it('should proceed without removing webhook when no studio webhook exists', async () => {
    mockWebhookList.mockResolvedValue([{ type: 'trigger', remove: jest.fn() }]);

    const request = createMockRequest({
      channelSid: TEST_CHANNEL_SID,
      message: TEST_MESSAGE,
    });

    const result = await sendStudioMessageHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    expect(mockCreateChannelMessage).toHaveBeenCalled();
  });

  it('should return 500 when an unexpected error occurs', async () => {
    mockGetTwilioClient.mockRejectedValue(new Error('Connection error'));

    const request = createMockRequest({
      channelSid: TEST_CHANNEL_SID,
      message: TEST_MESSAGE,
    });

    const result = await sendStudioMessageHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('Connection error');
    }
  });
});
