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

import { retrieveServiceConfigurationAttributes } from '../../../src/configuration/aseloConfiguration';
import {
  DEFAULT_CONFIGURATION_ATTRIBUTES,
  TEST_ACCOUNT_SID,
  TEST_AUTH_TOKEN,
} from '../../testTwilioValues';
import { getFromInternalHrmEndpoint } from '../../../src/hrm/internalHrmRequest';
import {
  handleGetProfileFlagsForIdentifier,
  Event,
} from '../../../src/hrm/getProfileFlagsForIdentifier';
import { getAccountAuthToken } from '../../../src/configuration/twilioConfiguration';
import { isErr, isOk, newErr, newOk } from '../../../src/Result';
import { HttpRequest } from '../../../src/httpTypes';
import { AssertionError } from 'node:assert';
import each from 'jest-each';

jest.mock('twilio', () => () => ({}));

jest.mock('../../../src/configuration/twilioConfiguration', () => ({
  getAccountAuthToken: jest.fn(),
}));

const mockGetAccountAuthToken = getAccountAuthToken as jest.MockedFunction<
  typeof getAccountAuthToken
>;

jest.mock('../../../src/configuration/aseloConfiguration', () => ({
  retrieveServiceConfigurationAttributes: jest.fn(),
}));

const mockRetrieveServiceConfigurationAttributes =
  retrieveServiceConfigurationAttributes as jest.MockedFunction<
    typeof retrieveServiceConfigurationAttributes
  >;
jest.mock('../../../src/hrm/internalHrmRequest', () => ({
  getFromInternalHrmEndpoint: jest.fn(),
}));

const mockGetFromInternalHrmEndpoint = getFromInternalHrmEndpoint as jest.MockedFunction<
  typeof getFromInternalHrmEndpoint
>;

const newCallEvent = (from: string): Event => ({
  trigger: { call: { From: from, Caller: 'Lorna' } },
  channelType: 'voice',
  request: { cookies: {}, headers: {} },
});

const newWebchatEvent = (from: string): Event => ({
  trigger: {
    message: {
      ChannelAttributes: {
        from: 'not this!',
        channel_type: 'web',
        pre_engagement_data: { contactIdentifier: from },
      },
    },
  },
  channelType: 'web',
  request: { cookies: {}, headers: {} },
});

const newConversationEvent = (channelType: string, from: string): Event => ({
  trigger: {
    conversation: {
      Author: from,
    },
  },
  channelType,
  request: { cookies: {}, headers: {} },
});

const newProfileFlagsForIdentifierRequest = (event: Event): HttpRequest => ({
  body: event,
  method: 'GET',
  headers: {},
  path: '',
  query: {},
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('handleGetProfileFlagsForIdentifier', () => {
  beforeEach(() => {
    mockRetrieveServiceConfigurationAttributes.mockResolvedValue(
      DEFAULT_CONFIGURATION_ATTRIBUTES,
    );
    mockGetAccountAuthToken.mockResolvedValue(TEST_AUTH_TOKEN);
  });
  test('should return 500 if the auth token lookup fails', async () => {
    // Arrange
    mockGetAccountAuthToken.mockRejectedValue(new Error('boom'));

    // Act
    const result = await handleGetProfileFlagsForIdentifier(
      newProfileFlagsForIdentifierRequest(newCallEvent('1234')),
      TEST_ACCOUNT_SID,
    );

    // Assert
    if (isOk(result)) {
      // throwing an assertion error directly narrows the type of the result to an error for the subsequent expect
      // An expect call would not.
      throw new AssertionError({ message: 'Expected an error response' });
    }
    expect(result.error.statusCode).toEqual(500);
  });
  test('should return 500 if the request fails', async () => {
    // Assert
    mockGetFromInternalHrmEndpoint.mockResolvedValue(
      newErr({ message: 'boom', error: new Error('boom') }),
    );

    // Act
    const result = await handleGetProfileFlagsForIdentifier(
      newProfileFlagsForIdentifierRequest(newCallEvent('1234')),
      TEST_ACCOUNT_SID,
    );

    // Assert
    if (isOk(result)) {
      // throwing an assertion error directly narrows the type of the result to an error for the subsequent expect
      // An expect call would not.
      throw new AssertionError({ message: 'Expected an error response' });
    }
    expect(result.error.statusCode).toEqual(500);
  });
  describe('Valid request and successful response returns a 200 response with the flag names from HRM', () => {
    type TestCaseParameters = {
      description: string;
      inputEvent: Event;
      expectedIdentifier: string;
    };

    const testCases: TestCaseParameters[] = [
      {
        description: "Pure numeric phone number '123'",
        inputEvent: newCallEvent('123'),
        expectedIdentifier: '123',
      },
      {
        description: "Numeric phone number with spaces and dashes '123-456 789'",
        inputEvent: newCallEvent('123-456 789'),
        expectedIdentifier: '123456789',
      },
      {
        description: "Numeric phone number with other characters '123A456*78 9'",
        inputEvent: newCallEvent('123A456*78 9'),
        expectedIdentifier: '123A456*789',
      },
      {
        description: "Aselo connector style pure numeric phone number 'sip:123@1.2.3.4'",
        inputEvent: newCallEvent('sip:123@1.2.3.4'),
        expectedIdentifier: '123',
      },
      {
        description:
          "Aselo connector style numeric phone number with leading + 'sip:+123@1.2.3.4'",
        inputEvent: newCallEvent('sip:+123@1.2.3.4'),
        expectedIdentifier: '+123',
      },
      {
        description:
          "Aselo connector style numeric phone number with leading + and dashes and spaces 'sip:+123 456-789@1.2.3.4'",
        inputEvent: newCallEvent('sip:+123 456-789@1.2.3.4'),
        expectedIdentifier: '+123456789',
      },
      {
        description: "Pure numeric sms number '123'",
        inputEvent: newConversationEvent('sms', '123'),
        expectedIdentifier: '123',
      },
      {
        description: "Numeric sms number with spaces and dashes '123-456 789'",
        inputEvent: newConversationEvent('sms', '123-456 789'),
        expectedIdentifier: '123456789',
      },
      {
        description: "Numeric sms number with other characters '123A456*78 9'",
        inputEvent: newConversationEvent('sms', '123A456*78 9'),
        expectedIdentifier: '123A456*789',
      },
      {
        description: "Webchat with IP in pre-engagement data '1.2.3.4'",
        inputEvent: newWebchatEvent('1.2.3.4'),
        expectedIdentifier: '1.2.3.4',
      },
      {
        description:
          "Webchat with something else in pre-engagement data 'perhaps/an/../unauthorised/path'",
        inputEvent: newWebchatEvent('perhaps/an/../unauthorised/path'),
        expectedIdentifier: 'perhaps/an/../unauthorised/path',
      },
      {
        description: 'Webchat with no pre-engagement data',
        inputEvent: {
          trigger: {
            message: {
              ChannelAttributes: {
                from: 'not this!',
                channel_type: 'web',
              },
            },
          },
          channelType: 'web',
          request: { cookies: {}, headers: {} },
        },
        expectedIdentifier: '',
      },

      {
        description: 'Webchat with pre-engagement data but no channel identifier',
        inputEvent: {
          trigger: {
            message: {
              ChannelAttributes: {
                from: 'not this!',
                channel_type: 'web',
                pre_engagement_data: {} as any,
              },
            },
          },
          channelType: 'web',
          request: { cookies: {}, headers: {} },
        },
        expectedIdentifier: 'undefined',
      },
      ...['telegram', 'instagram', 'messenger'].flatMap(channelType => [
        {
          description: `Conversation with ${channelType} prefixed channel identifier '${channelType}:lornas-address'`,
          inputEvent: newConversationEvent(channelType, `${channelType}:lornas-address`),
          expectedIdentifier: `lornas-address`,
        },
        {
          description: `Conversation with ${channelType} non prefixed channel identifier 'lornas-address'`,
          inputEvent: newConversationEvent(channelType, `lornas-address`),
          expectedIdentifier: `lornas-address`,
        },
      ]),
      ...['whatsapp', 'modica'].flatMap(channelType => [
        {
          description: `Conversation with ${channelType} prefixed channel identifier '${channelType}:123456789'`,
          inputEvent: newConversationEvent(channelType, `${channelType}:123456789`),
          expectedIdentifier: `123456789`,
        },
        {
          description: `Conversation with ${channelType} non prefixed channel identifier '123456789'`,
          inputEvent: newConversationEvent(channelType, `123456789`),
          expectedIdentifier: `123456789`,
        },
        {
          description: `Conversation with ${channelType} prefixed channel identifier with spaces and dashes '${channelType}:+123 456-789'`,
          inputEvent: newConversationEvent(channelType, `${channelType}:+123456789`),
          expectedIdentifier: `+123456789`,
        },
      ]),
      ...['line', 'web'].flatMap(channelType => [
        {
          description: `Conversation with ${channelType} prefixed channel identifier '${channelType}:lornas-address'`,
          inputEvent: newConversationEvent(channelType, `${channelType}:lornas-address`),
          expectedIdentifier: `${channelType}:lornas-address`,
        },
        {
          description: `Conversation with ${channelType} non prefixed channel identifier 'lornas-address'`,
          inputEvent: newConversationEvent(channelType, `lornas-address`),
          expectedIdentifier: `lornas-address`,
        },
        {
          description: `Conversation with ${channelType} prefixed channel identifier with spaces '${channelType}:+123 456-789'`,
          inputEvent: newConversationEvent(channelType, `${channelType}:+123 456-789`),
          expectedIdentifier: `${channelType}:+123 456-789`,
        },
      ]),
    ];

    each(testCases).test(
      "$description calls HRM with identifier: '$expectedIdentifier'",
      async ({ expectedIdentifier, inputEvent }: TestCaseParameters) => {
        // Act
        mockGetFromInternalHrmEndpoint.mockResolvedValue(
          newOk([{ name: 'fish in microwave' }, { name: 'too cheerful' }]),
        );
        // Assert
        const result = await handleGetProfileFlagsForIdentifier(
          newProfileFlagsForIdentifierRequest(inputEvent),
          TEST_ACCOUNT_SID,
        );
        if (isErr(result)) {
          throw new AssertionError({
            message: 'Expected a successful response',
            actual: result,
          });
        }
        expect(result.data).toEqual({ flags: ['fish in microwave', 'too cheerful'] });
        expect(mockGetFromInternalHrmEndpoint).toHaveBeenCalledWith(
          TEST_ACCOUNT_SID,
          'v1',
          `profiles/identifier/${expectedIdentifier}/flags`,
        );
      },
    );
    test('Unrecognised conversations channel returns 400 error result', async () => {
      // Act
      const result = await handleGetProfileFlagsForIdentifier(
        newProfileFlagsForIdentifierRequest(
          newConversationEvent('carrier pigeon', 'speedy geraldine'),
        ),
        TEST_ACCOUNT_SID,
      );
      // Assert
      if (isOk(result)) {
        throw new AssertionError({
          message: 'Expected an error response',
          actual: result,
        });
      }
      expect(result.error.statusCode).toEqual(400);
      expect(mockGetFromInternalHrmEndpoint).not.toBeCalled();
    });
    test('Invalid trigger returns 400 error result', async () => {
      // Act
      const result = await handleGetProfileFlagsForIdentifier(
        newProfileFlagsForIdentifierRequest({
          trigger: { some: 'crap' } as any,
          channelType: 'voice',
          request: { cookies: {}, headers: {} },
        }),
        TEST_ACCOUNT_SID,
      );
      // Assert
      if (isOk(result)) {
        throw new AssertionError({
          message: 'Expected an error response',
          actual: result,
        });
      }
      expect(result.error.statusCode).toEqual(400);
      expect(mockGetFromInternalHrmEndpoint).not.toBeCalled();
    });
  });
});
