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

import * as mockingProxy from '../sandbox/mockingProxy';
import {
  initialiseMockServiceConfigurationApi,
  mockServiceConfiguration,
} from '../sandbox/mockServiceConfiguration';
import {
  DEFAULT_CONFIGURATION_ATTRIBUTES,
  TEST_ACCOUNT_SID,
  TEST_AUTH_TOKEN,
} from '../../testTwilioValues';
import { HRM_AUTH_SSM_PARAMETERS, mockIdentifierFlags } from '../sandbox/mockHrm';
import { mockSsmParameters } from '../sandbox/mockSsm';
import { mockttpServer } from '../sandbox/mockingProxy';
import { lambdaAlbFetch } from '../lambdaAlbFetch';
import { Event } from '../../../src/hrm/getProfileFlagsForIdentifier';
import { MockedEndpoint } from 'mockttp';

afterEach(async () => {
  await mockingProxy.stop();
});

beforeEach(async () => {
  await mockingProxy.start();
  await initialiseMockServiceConfigurationApi();
  await mockServiceConfiguration({
    account_sid: TEST_ACCOUNT_SID,
    attributes: DEFAULT_CONFIGURATION_ATTRIBUTES,
  });
  await mockSsmParameters(await mockttpServer(), HRM_AUTH_SSM_PARAMETERS);
});

describe('getProfileFlagsForIdentifier endpoint', () => {
  const MOCK_IDENTIFIER = '123456789';

  const MOCK_VOICE_EVENT: Omit<Event, 'request'> = {
    channelType: '',
    trigger: {
      call: {
        From: '1234-56 789',
        Caller: 'bob',
      },
    },
  };

  const MOCK_WEBCHAT_EVENT: Omit<Event, 'request'> = {
    channelType: 'web',
    trigger: {
      message: {
        ChannelAttributes: {
          pre_engagement_data: {
            contactIdentifier: '1.2.3.4',
          },
          from: 'bob',
          channel_type: 'web',
        },
      },
    },
  };

  const MOCK_CONVERSATIONS_EVENT: Omit<Event, 'request'> = {
    channelType: 'telegram',
    trigger: {
      conversation: {
        Author: 'telegram:bobs-address',
      },
    },
  };

  const path = `/lambda/twilio/account-scoped/${TEST_ACCOUNT_SID}/getProfileFlagsForIdentifier`;
  test('should return 400 if no twilio signature header is provided', async () => {
    // Arrange
    await mockIdentifierFlags(await mockttpServer(), MOCK_IDENTIFIER, []);

    const response = await lambdaAlbFetch(
      path,
      {
        method: 'POST',
        body: JSON.stringify(MOCK_VOICE_EVENT),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      true,
    );

    expect(response.status).toBe(400);
  });
  test('should return 403 if invalid twilio signature header is provided', async () => {
    // Arrange
    await mockIdentifierFlags(await mockttpServer(), MOCK_IDENTIFIER, []);
    // Act
    const response = await lambdaAlbFetch(
      path,
      {
        method: 'POST',
        body: JSON.stringify(MOCK_VOICE_EVENT),
        headers: {
          'X-Twilio-Signature': 'invalid_signature',
          'Content-Type': 'application/json',
        },
      },
      true,
    );
    // Assert
    expect(response.status).toBe(403);
  });
  describe('with valid auth credentials', () => {
    test('with a voice payload - query HRM using the normalized phone number in the From field and return the result', async () => {
      // Arrange
      let mockedHrmEndpoint: MockedEndpoint = await mockIdentifierFlags(
        await mockttpServer(),
        MOCK_IDENTIFIER,
        [{ name: 'bad bob!' }, { name: 'naughty bob!' }],
      );
      // Act
      const response = await lambdaAlbFetch(
        path,
        {
          method: 'POST',
          body: JSON.stringify(MOCK_VOICE_EVENT),
          signatureAuthToken: TEST_AUTH_TOKEN,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        true,
      );
      // Assert
      expect(response.status).toBe(200);
      expect(await response.json()).toStrictEqual({
        flags: ['bad bob!', 'naughty bob!'],
      });
      expect(await mockedHrmEndpoint.getSeenRequests()).toHaveLength(1);
    });
    test('with a webchat payload - query HRM using the contact identifier in the pre-engagement data and return the result', async () => {
      // Arrange
      let mockedHrmEndpoint: MockedEndpoint = await mockIdentifierFlags(
        await mockttpServer(),
        '1.2.3.4',
        [{ name: 'bad bob!' }, { name: 'naughty bob!' }],
      );
      // Act
      const response = await lambdaAlbFetch(
        path,
        {
          method: 'POST',
          body: JSON.stringify(MOCK_WEBCHAT_EVENT),
          signatureAuthToken: TEST_AUTH_TOKEN,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        true,
      );
      // Assert
      expect(response.status).toBe(200);
      expect(await response.json()).toStrictEqual({
        flags: ['bad bob!', 'naughty bob!'],
      });
      expect(await mockedHrmEndpoint.getSeenRequests()).toHaveLength(1);
    });
    test('with a conversations payload - query HRM using the normalized phone number in the From field and return the result', async () => {
      // Arrange
      let mockedHrmEndpoint: MockedEndpoint = await mockIdentifierFlags(
        await mockttpServer(),
        'bobs-address',
        [{ name: 'bad bob!' }, { name: 'naughty bob!' }],
      );
      // Act
      const response = await lambdaAlbFetch(
        path,
        {
          method: 'POST',
          body: JSON.stringify(MOCK_CONVERSATIONS_EVENT),
          signatureAuthToken: TEST_AUTH_TOKEN,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        true,
      );
      // Assert
      expect(response.status).toBe(200);
      expect(await response.json()).toStrictEqual({
        flags: ['bad bob!', 'naughty bob!'],
      });
      expect(await mockedHrmEndpoint.getSeenRequests()).toHaveLength(1);
    });
  });
});
