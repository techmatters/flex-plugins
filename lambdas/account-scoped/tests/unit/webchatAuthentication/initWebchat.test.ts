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
import { initWebchatHandler } from '../../../src/webchatAuthentication/initWebchat';
import { patchConversationAttributes } from '../../../src/conversation/patchConversationAttributes';
import { RecursivePartial } from '../RecursivePartial';
import { TEST_ACCOUNT_SID, TEST_CONVERSATION_SID } from '../../testTwilioValues';
import { isErr, isOk } from '../../../src/Result';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

jest.mock('../../../src/webchatAuthentication/createToken', () => ({
  createToken: jest.fn(),
  TOKEN_TTL_IN_SECONDS: 3600,
}));

jest.mock('../../../src/conversation/patchConversationAttributes', () => ({
  patchConversationAttributes: jest.fn(),
}));

import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { createToken } from '../../../src/webchatAuthentication/createToken';

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockCreateToken = createToken as jest.MockedFunction<typeof createToken>;
const mockPatchConversationAttributes =
  patchConversationAttributes as jest.MockedFunction<typeof patchConversationAttributes>;

const TEST_IDENTITY = 'customer_identity';
const TEST_TOKEN = 'mock.jwt.token';
const TEST_ADDRESS_SID = 'IG1ba46f2d6828b42ddd363f5045138044';

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
  let mockWebChannelsCreate: jest.Mock;
  let mockTwilioClient: RecursivePartial<twilio.Twilio>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWebChannelsCreate = jest.fn().mockResolvedValue({
      conversationSid: TEST_CONVERSATION_SID,
      identity: TEST_IDENTITY,
    });

    mockTwilioClient = {
      flexApi: {
        v2: {
          webChannels: {
            create: mockWebChannelsCreate,
          },
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockTwilioClient as twilio.Twilio);
    mockCreateToken.mockResolvedValue(TEST_TOKEN);
    mockPatchConversationAttributes.mockResolvedValue({} as any);
  });

  it('calls client.flexApi.v2.webChannels.create with the correct parameters', async () => {
    const request = createMockRequest();
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockWebChannelsCreate).toHaveBeenCalledWith({
      customerFriendlyName: 'Test Customer',
      addressSid: TEST_ADDRESS_SID,
      preEngagementData: JSON.stringify({ friendlyName: 'Test Customer' }),
      uiVersion: expect.any(String),
      chatFriendlyName: 'Webchat widget',
    });
  });

  it('calls patchConversationAttributes to set channel_type to web', async () => {
    const request = createMockRequest();
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockPatchConversationAttributes).toHaveBeenCalledWith(
      mockTwilioClient,
      TEST_CONVERSATION_SID,
      { channel_type: 'web' },
    );
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

  it('returns an error result when webChannels.create throws', async () => {
    mockWebChannelsCreate.mockRejectedValue(new Error('Orchestrator error'));
    const request = createMockRequest();
    const result = await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toBe('Orchestrator error');
    }

    expect(mockPatchConversationAttributes).not.toHaveBeenCalled();
  });

  it('returns an error result when patchConversationAttributes throws', async () => {
    mockPatchConversationAttributes.mockRejectedValue(new Error('Patch failed'));
    const request = createMockRequest();
    const result = await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toBe('Patch failed');
    }
  });

  it('uses CustomerFriendlyName from body when friendlyName is absent in form data', async () => {
    const request = createMockRequest({
      PreEngagementData: JSON.stringify({}),
      CustomerFriendlyName: 'Fallback Customer',
    });
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockWebChannelsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customerFriendlyName: 'Fallback Customer' }),
    );
  });

  it('falls back to "Customer" when no friendly name is available', async () => {
    const request = createMockRequest({
      PreEngagementData: JSON.stringify({}),
    });
    await initWebchatHandler(request, TEST_ACCOUNT_SID);

    expect(mockWebChannelsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customerFriendlyName: 'Customer' }),
    );
  });
});
