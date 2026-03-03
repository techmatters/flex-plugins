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

import twilio from 'twilio';
import { chatChannelJanitor } from '../../../src/conversation/chatChannelJanitor';
import { RecursivePartial } from '../RecursivePartial';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';
import { ChatChannelSID, ConversationSID } from '@tech-matters/twilio-types';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getChatServiceSid: jest.fn().mockResolvedValue('ISut'),
  getFlexProxyServiceSid: jest.fn().mockResolvedValue('KSut'),
}));

import { getTwilioClient } from '@tech-matters/twilio-configuration';

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;

const TEST_CHANNEL_SID = 'CHtest' as ChatChannelSID;
const TEST_CONVERSATION_SID = 'COtest' as ConversationSID;
const TEST_PROXY_SESSION = 'KC123';

describe('chatChannelJanitor', () => {
  let mockUpdateChannel: jest.Mock;
  let mockFetchChannel: jest.Mock;
  let mockUpdateConversation: jest.Mock;
  let mockFetchConversation: jest.Mock;
  let mockFetchProxySession: jest.Mock;
  let mockRemoveProxySession: jest.Mock;
  let mockTwilioClient: RecursivePartial<twilio.Twilio>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateChannel = jest.fn().mockResolvedValue({});
    mockFetchChannel = jest.fn();
    mockUpdateConversation = jest.fn().mockResolvedValue({});
    mockFetchConversation = jest.fn();
    mockFetchProxySession = jest.fn();
    mockRemoveProxySession = jest.fn().mockResolvedValue(true);

    mockTwilioClient = {
      chat: {
        v2: {
          services: {
            get: () => ({
              channels: {
                get: () => ({
                  fetch: mockFetchChannel,
                  update: mockUpdateChannel,
                }),
              },
            }),
          },
        },
      },
      conversations: {
        v1: {
          conversations: {
            get: () => ({
              fetch: mockFetchConversation,
              update: mockUpdateConversation,
            }),
          },
        },
      },
      proxy: {
        v1: {
          services: {
            get: () => ({
              sessions: {
                get: () => ({
                  fetch: mockFetchProxySession,
                }),
              },
            }),
          },
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockTwilioClient as twilio.Twilio);
  });

  describe('when conversationSid is provided', () => {
    test('active conversation without proxy session - closes conversation', async () => {
      mockFetchConversation.mockResolvedValue({
        state: 'active',
        attributes: JSON.stringify({}),
        update: mockUpdateConversation,
      });

      const result = await chatChannelJanitor(TEST_ACCOUNT_SID, {
        conversationSid: TEST_CONVERSATION_SID,
      });

      expect(mockUpdateConversation).toHaveBeenCalledWith({
        state: 'closed',
        xTwilioWebhookEnabled: 'true',
      });
      expect(result.message).toContain(TEST_CONVERSATION_SID);
    });

    test('active conversation with proxy session - deletes proxy session then closes conversation', async () => {
      mockFetchConversation.mockResolvedValue({
        state: 'active',
        attributes: JSON.stringify({ proxySession: TEST_PROXY_SESSION }),
        update: mockUpdateConversation,
      });
      mockFetchProxySession.mockResolvedValue({
        remove: mockRemoveProxySession,
      });

      await chatChannelJanitor(TEST_ACCOUNT_SID, {
        conversationSid: TEST_CONVERSATION_SID,
      });

      expect(mockFetchProxySession).toHaveBeenCalled();
      expect(mockRemoveProxySession).toHaveBeenCalled();
      expect(mockUpdateConversation).toHaveBeenCalledWith({
        state: 'closed',
        xTwilioWebhookEnabled: 'true',
      });
    });

    test('already closed conversation - skips update', async () => {
      mockFetchConversation.mockResolvedValue({
        state: 'closed',
        attributes: JSON.stringify({}),
        update: mockUpdateConversation,
      });

      const result = await chatChannelJanitor(TEST_ACCOUNT_SID, {
        conversationSid: TEST_CONVERSATION_SID,
      });

      expect(mockUpdateConversation).not.toHaveBeenCalled();
      expect(result.result).toEqual({
        message: 'Conversation already closed, event ignored',
      });
    });
  });

  describe('when only channelSid is provided', () => {
    test('active channel without proxy session - deactivates channel', async () => {
      mockFetchChannel.mockResolvedValue({
        attributes: JSON.stringify({ status: 'ACTIVE' }),
        update: mockUpdateChannel,
      });

      const result = await chatChannelJanitor(TEST_ACCOUNT_SID, {
        channelSid: TEST_CHANNEL_SID,
      });

      expect(mockUpdateChannel).toHaveBeenCalledWith({
        attributes: JSON.stringify({ status: 'INACTIVE' }),
        xTwilioWebhookEnabled: 'true',
      });
      expect(result.message).toContain(TEST_CHANNEL_SID);
    });

    test('active channel with proxy session - deletes proxy session then deactivates channel', async () => {
      mockFetchChannel.mockResolvedValue({
        attributes: JSON.stringify({
          status: 'ACTIVE',
          proxySession: TEST_PROXY_SESSION,
        }),
        update: mockUpdateChannel,
      });
      mockFetchProxySession.mockResolvedValue({
        remove: mockRemoveProxySession,
      });

      await chatChannelJanitor(TEST_ACCOUNT_SID, {
        channelSid: TEST_CHANNEL_SID,
      });

      expect(mockFetchProxySession).toHaveBeenCalled();
      expect(mockRemoveProxySession).toHaveBeenCalled();
      expect(mockUpdateChannel).toHaveBeenCalledWith({
        attributes: JSON.stringify({
          status: 'INACTIVE',
          proxySession: TEST_PROXY_SESSION,
        }),
        xTwilioWebhookEnabled: 'true',
      });
    });

    test('already INACTIVE channel - skips update', async () => {
      mockFetchChannel.mockResolvedValue({
        attributes: JSON.stringify({ status: 'INACTIVE' }),
        update: mockUpdateChannel,
      });

      const result = await chatChannelJanitor(TEST_ACCOUNT_SID, {
        channelSid: TEST_CHANNEL_SID,
      });

      expect(mockUpdateChannel).not.toHaveBeenCalled();
      expect(result.result).toEqual({
        message: 'Channel already INACTIVE, event ignored',
      });
    });

    test('proxy session not found - continues and deactivates channel', async () => {
      mockFetchChannel.mockResolvedValue({
        attributes: JSON.stringify({
          status: 'ACTIVE',
          proxySession: TEST_PROXY_SESSION,
        }),
        update: mockUpdateChannel,
      });
      mockFetchProxySession.mockResolvedValue(null);

      await chatChannelJanitor(TEST_ACCOUNT_SID, {
        channelSid: TEST_CHANNEL_SID,
      });

      expect(mockRemoveProxySession).not.toHaveBeenCalled();
      expect(mockUpdateChannel).toHaveBeenCalledWith({
        attributes: JSON.stringify({
          status: 'INACTIVE',
          proxySession: TEST_PROXY_SESSION,
        }),
        xTwilioWebhookEnabled: 'true',
      });
    });

    test('proxy session fetch throws - continues and deactivates channel', async () => {
      mockFetchChannel.mockResolvedValue({
        attributes: JSON.stringify({
          status: 'ACTIVE',
          proxySession: TEST_PROXY_SESSION,
        }),
        update: mockUpdateChannel,
      });
      mockFetchProxySession.mockRejectedValue(new Error('Not found'));

      await chatChannelJanitor(TEST_ACCOUNT_SID, {
        channelSid: TEST_CHANNEL_SID,
      });

      expect(mockRemoveProxySession).not.toHaveBeenCalled();
      expect(mockUpdateChannel).toHaveBeenCalledWith({
        attributes: JSON.stringify({
          status: 'INACTIVE',
          proxySession: TEST_PROXY_SESSION,
        }),
        xTwilioWebhookEnabled: 'true',
      });
    });
  });
});
