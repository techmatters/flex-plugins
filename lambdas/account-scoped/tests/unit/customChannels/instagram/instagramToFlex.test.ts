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
  instagramToFlexHandler,
  Body,
} from '../../../../src/customChannels/instagram/instagramToFlex';
import { HttpRequest } from '../../../../src/httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { isOk } from '../../../../src/Result';
import { getTwilioClient } from '../../../../src/configuration/twilioConfiguration';

jest.mock('../../../../src/customChannels/configuration', () => ({
  getFacebookPageAccessToken: jest.fn().mockResolvedValue('test token'),
  getFacebookAppSecret: jest.fn().mockResolvedValue('test secret'),
  getChannelStudioFlowSid: jest.fn().mockResolvedValue('INSTAGRAM_STUDIO_FLOW_SID'),
}));

jest.mock('../../../../src/configuration/twilioConfiguration', () => ({
  getTwilioClient: jest.fn(),
}));

const MOCK_CHANNEL_TYPE = 'instagram';
const MOCK_SENDER_CHANNEL_SID = `${MOCK_CHANNEL_TYPE}:sender_id`;
const MOCK_OTHER_CHANNEL_SID = `${MOCK_CHANNEL_TYPE}:other_id`;
const MOCK_ERROR_CHANNEL_SID = `${MOCK_CHANNEL_TYPE}:throw error`;

const newConversation = (sid: string, messages: any[] = []) => ({
  attributes: '{}',
  sid,
  messages: {
    create: jest.fn().mockResolvedValue(`Message sent in channel ${sid}.`),
    list: async () => messages,
  },
  webhooks: {
    create: async () => {},
  },
  update: async () => {},
});

const mockOneMessage = {
  sid: 'message_1',
  attributes: JSON.stringify({ messageExternalId: 'test_message_mid' }),
  update: jest.fn(),
};

const conversations: { [x: string]: any } = {
  [MOCK_SENDER_CHANNEL_SID]: newConversation(MOCK_SENDER_CHANNEL_SID, [mockOneMessage]),
  [MOCK_OTHER_CHANNEL_SID]: newConversation(MOCK_OTHER_CHANNEL_SID),
};

let documents: any = {
  [MOCK_SENDER_CHANNEL_SID]: { data: { activeChannelSid: MOCK_SENDER_CHANNEL_SID } },
};

function documentsMock(doc: string) {
  return {
    fetch: async () => {
      if (doc === MOCK_ERROR_CHANNEL_SID) {
        throw new Error('Error fetching document'); // Error other than key not found
      }
      if (!documents[doc]) {
        const err = new Error('Document does not exists');
        (err as any).code = 20404; // Twilio not found code
        throw err;
      }

      return documents[doc];
    },
  };
}

documentsMock.create = async ({
  data,
  uniqueName,
}: {
  data: any;
  uniqueName: string;
}) => {
  documents = { ...documents, [uniqueName]: { data } };
  return documents[uniqueName];
};
const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
let mockTwilioClient: any;

const ACCOUNT_SID: AccountSID = 'ACxx';
const FACEBOOK_APP_SECRET = 'test secret';

const defaultBodyAsString = 'fake body';
const expectedSignature = crypto
  .createHmac('sha1', FACEBOOK_APP_SECRET)
  .update(defaultBodyAsString)
  .digest('hex');

const validEventBody = ({
  senderId = 'sender_id',
  recipientId = 'recipient_id',
  isDeleted = false,
  attachments = undefined,
}: {
  senderId?: string;
  recipientId?: string;
  isDeleted?: boolean;
  attachments?: any[];
} = {}): Body => ({
  object: 'instagram',
  bodyAsString: defaultBodyAsString,
  xHubSignature: `sha1=${expectedSignature}`,
  entry: [
    {
      time: 100,
      id: 'test_instagram_message',
      messaging: [
        {
          sender: {
            id: senderId,
          },
          recipient: {
            id: recipientId,
          },
          timestamp: 100,
          message: {
            mid: 'test_message_mid',
            text: 'test message text',
            is_deleted: isDeleted,
            attachments,
          },
        },
      ],
    },
  ],
});

describe('InstagramToFlex', () => {
  beforeEach(() => {
    mockTwilioClient = {
      conversations: {
        v1: {
          conversations: {
            get: (conversationSid: string) => {
              if (!conversations[conversationSid])
                throw new Error('Channel does not exists.');

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

    Object.entries(conversations).forEach(([, c]) => c.messages.create.mockClear());
    mockOneMessage.update.mockClear();
    mockGetTwilioClient.mockResolvedValue(mockTwilioClient);
  });
  // Test suite was never adapted to conversations, the commented out tests can be added back once this is done
  each([
    {
      conditionDescription: 'the event contains no signature',
      event: { ...validEventBody(), xHubSignature: undefined },
      expectedStatus: 403,
      expectedMessage: 'Forbidden',
    },
    {
      conditionDescription: 'the event contains malformed signature',
      event: { ...validEventBody(), xHubSignature: expectedSignature },
      expectedStatus: 403,
      expectedMessage: 'Forbidden',
    },
    {
      conditionDescription: 'the event contains an incorrect signature',
      event: {
        ...validEventBody(),
        xHubSignature: crypto
          .createHmac('sha1', FACEBOOK_APP_SECRET)
          .update('BEEP BOOP')
          .digest('hex'),
      },
      expectedStatus: 403,
      expectedMessage: 'Forbidden',
    },
    {
      conditionDescription: 'the event contains no entry',
      event: { ...validEventBody(), entry: [] },
      expectedStatus: 500,
    },
    {
      conditionDescription: 'the event has an entry with empty messaging',
      event: {
        ...validEventBody(),
        entry: [{ ...validEventBody().entry[0], messaging: [] }],
      },
      expectedStatus: 500,
    },
    {
      conditionDescription: 'the event has no sender',
      event: {
        ...validEventBody(),
        entry: [
          {
            ...validEventBody().entry[0],
            messaging: [{ ...validEventBody().entry[0].messaging[0], sender: undefined }],
          },
        ],
      },
      expectedStatus: 500,
    },
    {
      conditionDescription: 'the event has no message',
      event: {
        ...validEventBody(),
        entry: [
          {
            ...validEventBody().entry[0],
            messaging: [
              { ...validEventBody().entry[0].messaging[0], message: undefined },
            ],
          },
        ],
      },
      expectedStatus: 500,
    },
    /*{
      conditionDescription: 'the entry id and the message sender id are the same',
      event: {
        ...validEventBody(),
        entry: [{ ...validEventBody().entry[0], id: 'sender_id' }],
      },
      expectedStatus: 200,
      expectedMessage: 'Ignored event',
    },
    {
      conditionDescription: 'sending to existing channel',
      event: validEventBody({}),
      expectedStatus: 200,
      expectedMessage: `Message sent in channel ${MOCK_SENDER_CHANNEL_SID}.`,
      expectedToBeSentOnChannel: MOCK_SENDER_CHANNEL_SID,
    },
    {
      conditionDescription: 'creating a new channel',
      event: validEventBody({ senderId: 'other_id' }),
      expectedStatus: 200,
      expectedMessage: `Message sent in channel ${MOCK_OTHER_CHANNEL_SID}.`,
      expectedToBeSentOnChannel: MOCK_OTHER_CHANNEL_SID,
    },*/
    {
      conditionDescription: 'sync service throwing errors',
      event: validEventBody({ senderId: 'throw error' }),
      expectedStatus: 500,
      expectedMessage: 'Error fetching document',
    },
    {
      conditionDescription: 'deleting a message from an inactive conversation',
      event: validEventBody({ senderId: 'no_active_chat', isDeleted: true }),
      expectedStatus: 200,
      expectedMessage:
        'Message unsent with external id test_message_mid is not part of an active conversation.',
      expectedToBeSentOnChannel: undefined,
    },
    /*{
      conditionDescription: 'deleting a message from an active conversation',
      event: validEventBody({ senderId: 'sender_id', isDeleted: true }),
      expectedStatus: 200,
      expectedMessage: 'Message with external id test_message_mid unsent.',
      expectedToBeSentOnChannel: undefined,
      expectedToDeleteMessage: true,
    },*/
    {
      conditionDescription: 'story tagging from an inactive conversation',
      event: validEventBody({
        senderId: 'no_active_chat',
        attachments: [{ type: 'story_mention', payload: { url: 'some fake url' } }],
      }),
      expectedStatus: 200,
      expectedMessage:
        'Story mention with external id test_message_mid is not part of an active conversation.',
      expectedToBeSentOnChannel: undefined,
    },
    {
      conditionDescription: 'story reply',
      event: {
        ...validEventBody(),
        entry: [
          {
            ...validEventBody().entry[0],
            messaging: [
              {
                ...validEventBody().entry[0].messaging[0],
                message: {
                  ...validEventBody().entry[0].messaging[0].message,
                  reply_to: { story: { url: '', id: '' } },
                },
              },
            ],
          },
        ],
      },
      expectedStatus: 200,
      expectedMessage: 'Ignored story reply.',
    },
    /*{
      conditionDescription: 'inline reply',
      event: {
        ...validEventBody(),
        entry: [
          {
            ...validEventBody().entry[0],
            messaging: [
              {
                ...validEventBody().entry[0].messaging[0],
                message: {
                  ...validEventBody().entry[0].messaging[0].message,
                  reply_to: { mid: '' },
                },
              },
            ],
          },
        ],
      },
      expectedStatus: 200,
      expectedMessage: `Message sent in channel ${MOCK_SENDER_CHANNEL_SID}.`,
      expectedToBeSentOnChannel: MOCK_SENDER_CHANNEL_SID,
    },
    {
      conditionDescription: 'story tagging from an inactive conversation',
      event: validEventBody({
        senderId: 'sender_id',
        attachments: [{ type: 'story_mention', payload: { url: 'some fake url' } }],
      }),
      expectedStatus: 200,
      expectedMessage: `Message sent in channel ${MOCK_SENDER_CHANNEL_SID}.`,
      expectedToBeSentOnChannel: MOCK_SENDER_CHANNEL_SID,
      expectedMessageText: 'Story mention: some fake url',
    },*/
  ]).test(
    "Should return $expectedStatus '$expectedMessage' when $conditionDescription",
    async ({
      event,
      expectedStatus,
      expectedMessage,
      expectedToBeSentOnChannel,
      expectedToDeleteMessage = false,
      expectedMessageText = undefined,
    }) => {
      if (expectedStatus === 500) {
        await expect(
          instagramToFlexHandler({ body: event } as HttpRequest, ACCOUNT_SID),
        ).rejects.toThrow();
        return;
      }
      const result = await instagramToFlexHandler(
        { body: event } as HttpRequest,
        ACCOUNT_SID,
      );

      expect(result).toBeDefined();
      if (isOk(result)) {
        expect(expectedStatus).toBe(200);
        expect(result.data).toMatchObject({
          message: expect.stringContaining(expectedMessage),
        });
      } else {
        expect(result.error.statusCode).toBe(expectedStatus);
        expect(result.message).toContain(expectedMessage);
      }
      if (expectedToBeSentOnChannel) {
        expect(conversations[expectedToBeSentOnChannel].messages.create).toBeCalledWith(
          expect.objectContaining({
            body: expectedMessageText || 'test message text',
            from: expectedToBeSentOnChannel,
            xTwilioWebhookEnabled: 'true',
            attributes: JSON.stringify({ messageExternalId: 'test_message_mid' }),
          }),
        );
      } else {
        Object.values(conversations).forEach(channel => {
          expect(channel.messages.create).not.toHaveBeenCalled();
        });
      }
      if (expectedToDeleteMessage) expect(mockOneMessage.update).toHaveBeenCalled();
    },
  );
});
