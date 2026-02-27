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
import { flexToModicaHandler } from '../../../../src/customChannels/modica/flexToModica';
import { AccountSID } from '@tech-matters/twilio-types';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { HttpRequest } from '../../../../src/httpTypes';
import { isErr, isOk } from '../../../../src/Result';
import { AssertionError } from 'node:assert';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

jest.mock('../../../../src/customChannels/configuration', () => ({
  getModicaAppName: jest.fn().mockResolvedValue('test-app-name'),
  getModicaAppPassword: jest.fn().mockResolvedValue('test-app-password'),
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
const MODICA_APP_NAME = 'test-app-name';
const MODICA_APP_PASSWORD = 'test-app-password';
const MODICA_SEND_URL = 'https://api.modicagroup.com/rest/gateway/messages';

const validEvent = ({ Author = 'senderId', Source = 'API' } = {}) => ({
  Source,
  Body: 'the message text',
  EventType: 'onMessageAdded',
  ConversationSid: 'CONVERSATION_SID',
  Author,
});

describe('FlexToModica', () => {
  beforeEach(() => {
    mockTwilioClient = {
      conversations: {
        v1: {
          conversations: {
            get: (channelSid: string) => {
              if (!conversations[channelSid])
                throw new Error('Conversation does not exist.');
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
      conditionDescription: 'the recipientId parameter is not provided',
      event: validEvent(),
      expectedStatus: 400,
      expectedMessage: 'recipientId missing',
      recipientId: null,
    },
    {
      conditionDescription: 'the Body parameter is not provided',
      event: { ...validEvent(), Body: undefined },
      expectedStatus: 400,
      expectedMessage: 'Body missing',
    },
    {
      conditionDescription: 'the ConversationSid parameter is not provided',
      event: { ...validEvent(), ConversationSid: undefined },
      expectedStatus: 400,
      expectedMessage: 'ConversationSid missing',
    },
    {
      conditionDescription: 'the Modica endpoint throws an error',
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
        await expect(flexToModicaHandler(request, ACCOUNT_SID)).rejects.toThrow(
          new Error('BOOM'),
        );
        return;
      }

      const result = await flexToModicaHandler(request, ACCOUNT_SID);

      if (isErr(result)) {
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
        "event 'Author' property matches first conversation participant sid",
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
        text: async () => Promise.resolve(JSON.stringify({ success: true })),
        headers: { some: 'header' } as any,
      } as any);

      const result = await flexToModicaHandler(
        {
          body: event,
          query: { recipientId: '+64211234567' } as Record<string, string>,
        } as HttpRequest,
        ACCOUNT_SID,
      );

      const expectedBase64Credentials = Buffer.from(
        `${MODICA_APP_NAME}:${MODICA_APP_PASSWORD}`,
      ).toString('base64');

      if (shouldBeIgnored) {
        expect(mockFetch).not.toHaveBeenCalled();
      } else {
        expect(mockFetch).toBeCalledWith(
          MODICA_SEND_URL,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              destination: '+64211234567',
              content: event.Body,
            }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${expectedBase64Credentials}`,
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
            resultCode: 200,
          });
        }
      } else
        throw new AssertionError({
          message: `Expected flexToModicaHandler to return an OK result, but returned this error: ${JSON.stringify(result)}`,
          expected: 'OK',
          actual: result,
        });
    },
  );

  test('Should sanitize recipientId by adding + prefix when missing', async () => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => Promise.resolve(JSON.stringify({ success: true })),
      headers: {} as any,
    } as any);

    await flexToModicaHandler(
      {
        body: validEvent(),
        query: { recipientId: '64211234567' } as Record<string, string>,
      } as HttpRequest,
      ACCOUNT_SID,
    );

    expect(mockFetch).toBeCalledWith(
      MODICA_SEND_URL,
      expect.objectContaining({
        body: JSON.stringify({
          destination: '+64211234567',
          content: validEvent().Body,
        }),
      }),
    );
  });

  test('Should send to TEST_SEND_URL with testSessionId header when testSessionId is set in conversation attributes', async () => {
    const TEST_SESSION_ID = 'test-session-123';
    const TEST_SEND_URL = `${process.env.WEBHOOK_BASE_URL}/lambda/integrationTestRunner`;

    mockTwilioClient.conversations.v1.conversations.get = () => ({
      fetch: async () => ({
        ...conversations.CONVERSATION_SID,
        attributes: JSON.stringify({ testSessionId: TEST_SESSION_ID }),
      }),
      ...conversations.CONVERSATION_SID,
    });

    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => Promise.resolve(JSON.stringify({ success: true })),
      headers: {} as any,
    } as any);

    await flexToModicaHandler(
      {
        body: validEvent(),
        query: { recipientId: '+64211234567' } as Record<string, string>,
      } as HttpRequest,
      ACCOUNT_SID,
    );

    const expectedBase64Credentials = Buffer.from(
      `${MODICA_APP_NAME}:${MODICA_APP_PASSWORD}`,
    ).toString('base64');

    expect(mockFetch).toBeCalledWith(
      TEST_SEND_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          destination: '+64211234567',
          content: validEvent().Body,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${expectedBase64Credentials}`,
          'x-webhook-receiver-session-id': TEST_SESSION_ID,
        },
      }),
    );
  });
});
