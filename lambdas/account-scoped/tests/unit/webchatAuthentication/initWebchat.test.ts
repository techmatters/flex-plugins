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

import { initWebchatHandler } from '../../../src/webchatAuthentication/initWebchat';
import { TEST_ACCOUNT_SID, TEST_CONVERSATION_SID } from '../../testTwilioValues';
import { isErr, isOk } from '../../../src/Result';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

jest.mock('../../../src/customChannels/configuration', () => ({
  getChannelStudioFlowSid: jest.fn(),
}));

jest.mock('../../../src/conversation/createConversation', () => ({
  createConversation: jest.fn(),
}));

jest.mock('../../../src/webchatAuthentication/createToken', () => ({
  createToken: jest.fn(),
  TOKEN_TTL_IN_SECONDS: 3600,
}));

import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { getChannelStudioFlowSid } from '../../../src/customChannels/configuration';
import { createConversation } from '../../../src/conversation/createConversation';
import { createToken } from '../../../src/webchatAuthentication/createToken';

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetChannelStudioFlowSid = getChannelStudioFlowSid as jest.MockedFunction<
  typeof getChannelStudioFlowSid
>;
const mockCreateConversation = createConversation as jest.MockedFunction<
  typeof createConversation
>;
const mockCreateToken = createToken as jest.MockedFunction<typeof createToken>;

const TEST_STUDIO_FLOW_SID = 'FWtest_studio_flow_sid';
const TEST_TOKEN = 'mock.jwt.token';

const createMockRequest = (body: Record<string, any> = {}) => ({
  method: 'POST',
  headers: {},
  path: '/init-webchat',
  query: {},
  body: {
    PreEngagementData: JSON.stringify({ friendlyName: 'Test Customer' }),
    ...body,
  },
});

describe('initWebchatHandler', () => {
  const mockTwilioClient = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTwilioClient.mockResolvedValue(mockTwilioClient);
    mockGetChannelStudioFlowSid.mockResolvedValue(TEST_STUDIO_FLOW_SID);
    mockCreateConversation.mockResolvedValue({ conversationSid: TEST_CONVERSATION_SID });
    mockCreateToken.mockResolvedValue(TEST_TOKEN);
  });

  it('calls getChannelStudioFlowSid with accountSid and "web" channel', async () => {
    const request = createMockRequest();
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockGetChannelStudioFlowSid).toHaveBeenCalledWith(TEST_ACCOUNT_SID, 'web');
  });

  it('calls createConversation with correct parameters', async () => {
    const request = createMockRequest();
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockCreateConversation).toHaveBeenCalledWith(mockTwilioClient, {
      channelType: 'web',
      conversationFriendlyName: 'Test Customer',
      senderScreenName: 'Test Customer',
      studioFlowSid: TEST_STUDIO_FLOW_SID,
      testSessionId: undefined,
      twilioNumber: `web:${TEST_ACCOUNT_SID}`,
      uniqueUserName: expect.stringMatching(/^web:/),
      additionalConversationAttributes: {
        pre_engagement_data: { friendlyName: 'Test Customer' },
        from: 'Test Customer',
      },
    });
  });

  it('calls createToken with accountSid and the generated sender identity', async () => {
    const request = createMockRequest();
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    const createConversationCall = mockCreateConversation.mock.calls[0];
    const identity = createConversationCall[1].uniqueUserName;
    expect(mockCreateToken).toHaveBeenCalledWith(TEST_ACCOUNT_SID, identity);
  });

  it('returns a success result with token, conversationSid and expiration', async () => {
    const request = createMockRequest();
    const result = await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.token).toBe(TEST_TOKEN);
      expect(result.data.conversationSid).toBe(TEST_CONVERSATION_SID);
      expect(typeof result.data.expiration).toBe('number');
    }
  });

  it('returns an error result when createConversation throws', async () => {
    mockCreateConversation.mockRejectedValue(new Error('Conversation creation failed'));
    const request = createMockRequest();
    const result = await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toBe('Conversation creation failed');
    }
    expect(mockCreateToken).not.toHaveBeenCalled();
  });

  it('uses CustomerFriendlyName from body when friendlyName is absent in form data', async () => {
    const request = createMockRequest({
      PreEngagementData: JSON.stringify({}),
      CustomerFriendlyName: 'Fallback Customer',
    });
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockCreateConversation).toHaveBeenCalledWith(
      mockTwilioClient,
      expect.objectContaining({
        conversationFriendlyName: 'Fallback Customer',
        senderScreenName: 'Fallback Customer',
        additionalConversationAttributes: expect.objectContaining({
          from: 'Fallback Customer',
        }),
      }),
    );
  });

  it('falls back to "Anonymous" when no friendly name is available', async () => {
    const request = createMockRequest({
      PreEngagementData: JSON.stringify({}),
    });
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockCreateConversation).toHaveBeenCalledWith(
      mockTwilioClient,
      expect.objectContaining({
        conversationFriendlyName: 'Anonymous',
        senderScreenName: 'Anonymous',
        additionalConversationAttributes: expect.objectContaining({
          from: 'Anonymous',
        }),
      }),
    );
  });

  it('passes the pre-engagement form data as additionalConversationAttributes.pre_engagement_data', async () => {
    const formData = { friendlyName: 'Test Customer', question: 'Help with account' };
    const request = createMockRequest({
      PreEngagementData: JSON.stringify(formData),
    });
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockCreateConversation).toHaveBeenCalledWith(
      mockTwilioClient,
      expect.objectContaining({
        additionalConversationAttributes: {
          pre_engagement_data: formData,
          from: 'Test Customer',
        },
      }),
    );
  });
});
