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
  modicaToFlexHandler,
  Body,
} from '../../../../src/customChannels/modica/modicaToFlex';
import { HttpRequest } from '../../../../src/httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { isOk } from '../../../../src/Result';
import { getTwilioClient } from '@tech-matters/twilio-configuration';

jest.mock('../../../../src/customChannels/configuration', () => ({
  getChannelStudioFlowSid: jest.fn().mockResolvedValue('MODICA_STUDIO_FLOW_SID'),
}));

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

const MOCK_CHANNEL_TYPE = 'modica';
const MOCK_SENDER_ID = '+64211234567';
const MOCK_DESTINATION = 'helpline-short-code';
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
  source = MOCK_SENDER_ID,
  destination = MOCK_DESTINATION,
  content = 'Hello from Modica!',
}: Partial<Body> = {}): Body => ({
  source,
  destination,
  content,
});

describe('ModicaToFlex', () => {
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

  test('Should process a valid Modica message and send it to Flex', async () => {
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

    const result = await modicaToFlexHandler(
      { body: validBody() } as HttpRequest,
      ACCOUNT_SID,
    );

    expect(result).toBeDefined();
    expect(isOk(result)).toBe(true);
  });

  each([
    {
      conditionDescription:
        'sender is the same as subscriber (self-message should be ignored)',
      body: validBody({ source: MOCK_DESTINATION, destination: MOCK_DESTINATION }),
      expectedIsOk: true,
      expectedMessage: 'Ignored event.',
    },
  ]).test(
    'Should return 200 ($expectedMessage) when $conditionDescription',
    async ({ body, expectedIsOk, expectedMessage }) => {
      const result = await modicaToFlexHandler({ body } as HttpRequest, ACCOUNT_SID);

      expect(result).toBeDefined();
      expect(isOk(result)).toBe(expectedIsOk);
      if (isOk(result)) {
        expect(result.data).toMatchObject({
          message: expect.stringContaining(expectedMessage),
        });
      }
    },
  );
});
