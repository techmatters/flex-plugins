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
import { flexToInstagramHandler } from '../../../../src/customChannels/instagram/flexToInstagram';
import { AccountSID } from '../../../../src/twilioTypes';
import { getTwilioClient } from '../../../../src/configuration/twilioConfiguration';
import { HttpRequest } from '../../../../src/httpTypes';
import { isErr, isOk } from '../../../../src/Result';
import { AssertionError } from 'node:assert';

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('../../../../src/configuration/twilioConfiguration', () => ({
  getTwilioClient: jest.fn(),
}));

jest.mock('../../../../src/customChannels/configuration', () => ({
  getFacebookPageAccessToken: jest.fn().mockResolvedValue('test token'),
}));

const conversations: { [x: string]: any } = {
  CONVERSATION_SID: {
    sid: 'CONVERSATION_SID',
    attributes: JSON.stringify({ from: 'channel-from' }),
    participants: {
      list: () => Promise.resolve([{ dateCreated: 0, sid: 'first convo participant' }]),
    },
  },
};
const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;

let mockTwilioClient: any;

const ACCOUNT_SID: AccountSID = 'ACxx';
const FACEBOOK_PAGE_ACCESS_TOKEN = 'test token';

const validEvent = ({ Author = 'senderId', Source = 'API' } = {}) => ({
  Source,
  Body: 'the message text',
  EventType: 'onMessageAdded',
  ConversationSid: 'CONVERSATION_SID',
  Author,
});

describe('FlexToInstagram', () => {
  beforeEach(() => {
    mockTwilioClient = {
      conversations: {
        v1: {
          conversations: {
            get: (channelSid: string) => {
              if (!conversations[channelSid])
                throw new Error('Conversation does not exists.');

              return {
                fetch: async () => conversations[channelSid],
                ...conversations[channelSid],
              };
            },
          },
        },
      },
    };
    mockGetTwilioClient.mockResolvedValue(mockTwilioClient);
  });

  each([
    {
      conditionDescription: 'the recipientId parameter not provided',
      event: validEvent(),
      expectedStatus: 400,
      expectedMessage: 'recipientId missing',
      recipientId: null,
    },
    {
      conditionDescription: 'the Body parameter not provided',
      event: {
        ...validEvent(),
        Body: undefined,
      },
      expectedStatus: 400,
      expectedMessage: 'Body missing',
    },
    {
      conditionDescription: 'the ConversationSid parameter not provided',
      event: {
        ...validEvent(),
        ConversationSid: undefined,
      },
      expectedStatus: 400,
      expectedMessage: 'ConversationSid missing',
    },
    {
      conditionDescription: 'the Facebook endpoint returns a 500 error',
      event: validEvent(),
      endpointImpl: () => {
        throw new Error('BOOM');
      },
      expectedStatus: 500,
      expectedMessage: 'BOOM',
    },
  ]).test(
    "Should return $expectedStatus '$expectedMessage' error when $conditionDescription.",
    async ({
      event,
      endpointImpl = async () => ({ status: 200, data: 'OK' }),
      expectedStatus,
      expectedMessage,
      recipientId = 'recipientId',
    }) => {
      mockFetch.mockImplementation(endpointImpl);
      const request = {
        body: event,
        query: { ...(recipientId ? { recipientId } : {}) },
      } as HttpRequest;
      if (expectedStatus === 500) {
        await expect(flexToInstagramHandler(request, ACCOUNT_SID)).rejects.toThrow(
          new Error('BOOM'),
        );
        return;
      }

      const result = await flexToInstagramHandler(request, ACCOUNT_SID);

      if (isErr(result)) {
        // Matching like this reports the message and the status in the fail message, rather than just one or the other, which you get with 2 separate checks
        expect({
          status: result.error.statusCode,
          message: result.message,
        }).toMatchObject({
          status: expectedStatus,
          message: expect.stringContaining(expectedMessage),
        });
      } else {
        expect({
          status: 200,
          message: result.data.message,
        }).toMatchObject({
          status: expectedStatus,
          message: expect.stringContaining(expectedMessage),
        });
      }
    },
  );

  each([
    {
      conditionDescription: 'the event source is not supported',
      event: validEvent({ Source: 'not supported' }),
      shouldBeIgnored: true,
    },
    {
      conditionDescription:
        "event 'Author' property matches first conversation participants sid",
      event: validEvent({ Author: 'first convo participant' }),
      shouldBeIgnored: true,
    },
    {
      conditionDescription: "event 'Source' property is set to 'API'",
      event: validEvent(),
      shouldBeIgnored: false,
    },
    {
      conditionDescription: "event 'Source' property is set to 'SDK'",
      event: validEvent({ Source: 'SDK' }),
      shouldBeIgnored: false,
    },
  ]).test(
    'Should return status 200 success (ignored: $shouldBeIgnored) when $conditionDescription.',
    async ({ event, shouldBeIgnored }) => {
      mockFetch.mockClear();

      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => Promise.resolve({}),
        headers: {
          some: 'header',
        } as any,
      } as Response);
      const result = await flexToInstagramHandler(
        {
          body: event,
          query: { recipientId: 'recipientId' } as Record<string, string>,
        } as HttpRequest,
        ACCOUNT_SID,
      );

      if (shouldBeIgnored) {
        expect(mockFetch).not.toHaveBeenCalled();
      } else {
        expect(mockFetch).toBeCalledWith(
          `https://graph.facebook.com/v19.0/me/messages?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`,
          expect.objectContaining({
            method: 'post',
            body: JSON.stringify({
              recipient: {
                id: 'recipientId',
              },
              message: {
                text: event.Body,
              },
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        );
      }

      if (isOk(result)) {
        if (shouldBeIgnored) {
          expect(result.data.message).toContain('Ignored event');
        } else {
          expect(result.data).toMatchObject({
            ok: true,
            meta: {
              some: 'header',
            },
            resultCode: 200,
            body: {},
          });
        }
      } else
        throw new AssertionError({
          message: `Expected flexToInstagramHandler to return an OK result, but returned this error: ${JSON.stringify(result)}`,
          expected: 'OK',
          actual: result,
        });
    },
  );
});
