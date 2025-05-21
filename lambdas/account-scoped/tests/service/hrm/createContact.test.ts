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
import * as mockingProxy from '../sandbox/mockingProxy';
import '../expectToParseAsDate';
import {
  initialiseMockServiceConfigurationApi,
  mockServiceConfiguration,
} from '../sandbox/mockServiceConfiguration';
import {
  DEFAULT_CONFIGURATION_ATTRIBUTES,
  EMPTY_TASK,
  TEST_ACCOUNT_SID,
  TEST_AUTH_TOKEN,
  TEST_TASK_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';
import { mockTaskApi } from '../sandbox/mockTaskRouter';
import { mockSsmParameters } from '../sandbox/mockSsm';
import { mockttpServer } from '../sandbox/mockingProxy';
import { lambdaAlbFetch } from '../lambdaAlbFetch';
import { EventFields } from '../../../src/taskrouter';
import { RESERVATION_ACCEPTED } from '../../../src/taskrouter/eventTypes';
import { mockFormDefinitions } from '../sandbox/mockFormDefinitions';
import { BASE_FORM_DEFINITION } from '../../testHrmValues';

import { mockHrmContacts, verifyCreateContactRequest } from '../sandbox/mockHrm';
import { MockedEndpoint } from 'mockttp';
import { BLANK_CONTACT } from '../../unit/hrm/testContacts';
import { TaskSID } from '../../../src/twilioTypes';
import { callTypes, HrmContact } from '../../../src/hrm/populateHrmContactFormFromTask';

const BLANK_POPULATED_PERSON_INFORMATION = {
  age: '',
  firstName: '',
  gender: 'Unknown',
  otherGender: '',
};

afterEach(async () => {
  await mockingProxy.stop();
});

beforeEach(async () => {
  await mockingProxy.start();
  await initialiseMockServiceConfigurationApi();
  await mockServiceConfiguration({
    account_sid: TEST_ACCOUNT_SID,
    attributes: {
      ...DEFAULT_CONFIGURATION_ATTRIBUTES,
      feature_flags: {
        enable_backend_hrm_contact_creation: true,
      },
    },
  });
});

describe('Create HRM Contact on Reservation Accepted event', () => {
  let createHrmContactEndpoint: MockedEndpoint;

  beforeEach(async () => {
    createHrmContactEndpoint = await mockHrmContacts(await mockttpServer());
    await mockFormDefinitions(
      await mockttpServer(),
      DEFAULT_CONFIGURATION_ATTRIBUTES.helpline_code,
      BASE_FORM_DEFINITION,
    );
    await mockSsmParameters(await mockttpServer(), [
      {
        name: `/${process.env.NODE_ENV}/twilio/${TEST_ACCOUNT_SID}/auth_token`,
        valueGenerator: () => TEST_AUTH_TOKEN,
      },
      {
        name: `/${process.env.NODE_ENV}/twilio/${TEST_ACCOUNT_SID}/workspace_sid`,
        valueGenerator: () => TEST_WORKSPACE_SID,
      },
      {
        name: `/${process.env.NODE_ENV}/twilio/${TEST_ACCOUNT_SID}/static_key`,
        valueGenerator: () => 'static_key',
      },
    ]);
    await mockTaskApi(EMPTY_TASK);
  });
  test('should return 400 if no twilio signature header is provided', async () => {
    // Arrange
    await mockTaskApi(EMPTY_TASK);

    const event: Partial<EventFields> = {
      AccountSid: TEST_ACCOUNT_SID,
      TaskAttributes: JSON.stringify({}),
      TaskSid: TEST_TASK_SID,
      WorkerSid: TEST_WORKER_SID,
      WorkspaceSid: TEST_WORKSPACE_SID,
      EventType: RESERVATION_ACCEPTED,
    };

    const response = await lambdaAlbFetch(
      `/lambda/twilio/account-scoped/${TEST_ACCOUNT_SID}/webhooks/taskrouterCallback`,
      {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    expect(response.status).toBe(400);
  });
  test('should return 403 if invalid twilio signature header is provided', async () => {
    // Arrange
    await mockTaskApi(EMPTY_TASK);

    const event: Partial<EventFields> = {
      AccountSid: TEST_ACCOUNT_SID,
      TaskAttributes: JSON.stringify({}),
      TaskSid: TEST_TASK_SID,
      WorkerSid: TEST_WORKER_SID,
      WorkspaceSid: TEST_WORKSPACE_SID,
      EventType: RESERVATION_ACCEPTED,
    };

    const response = await lambdaAlbFetch(
      `/lambda/twilio/account-scoped/${TEST_ACCOUNT_SID}/webhooks/taskrouterCallback`,
      {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'X-Twilio-Signature': 'invalid_signature',
          'Content-Type': 'application/json',
        },
      },
    );

    expect(response.status).toBe(403);
  });

  each([
    {
      channelType: 'default',
      extraTaskAttributes: { memory: {} },
      expectedIdentifier: '',
    },
    {
      channelType: 'web',
      extraTaskAttributes: {
        name: 'not this!',
        preEngagementData: {
          contactIdentifier: '1.2.3.4',
        },
      },
      expectedIdentifier: '1.2.3.4',
    },
    {
      channelType: 'voice',
      extraTaskAttributes: {
        name: '+123-456-789',
        memory: {},
      },
      expectedIdentifier: '+123456789',
    },
    {
      channelType: 'sms',
      extraTaskAttributes: {
        name: '+123-456-789',
        memory: {},
      },
      expectedIdentifier: '+123456789',
    },
    {
      channelType: 'whatsapp',
      extraTaskAttributes: {
        name: 'whatsapp:+123-456-789',
        memory: {},
      },
      expectedIdentifier: '+123456789',
    },
    {
      channelType: 'modica',
      extraTaskAttributes: {
        name: 'modica:+123-456-789',
        memory: {},
      },
      expectedIdentifier: '+123456789',
    },
    {
      channelType: 'messenger',
      extraTaskAttributes: {
        name: 'messenger:123456789',
        memory: {},
      },
      expectedIdentifier: '123456789',
    },
    {
      channelType: 'instagram',
      extraTaskAttributes: {
        name: 'instagram:123456789',
        memory: {},
      },
      expectedIdentifier: '123456789',
    },
    {
      channelType: 'line',
      extraTaskAttributes: {
        name: 'line:123456789',
        memory: {},
      },
      expectedIdentifier: 'line:123456789',
    },
    {
      channelType: 'telegram',
      extraTaskAttributes: {
        name: 'telegram:123456789',
        memory: {},
      },
      expectedIdentifier: '123456789',
    },
  ]).test.only(
    // 'should return 200 if valid twilio signature header is provided', async () => {
    "should return 200 if valid twilio signature header is provided with channel: '$channelType' and identifier: '$expectedIdentifier'",
    async ({
      channelType,
      expectedIdentifier,
      extraTaskAttributes,
    }: {
      channelType: string;
      expectedIdentifier: string;
      extraTaskAttributes: { [k: string]: any };
    }) => {
      const taskAttributes = {
        ...extraTaskAttributes,
        channelType,
        customChannelType: channelType,
      };

      // Arrange
      await mockTaskApi({
        ...EMPTY_TASK,
        attributes: JSON.stringify(taskAttributes),
      });

      const event: Partial<EventFields> = {
        AccountSid: TEST_ACCOUNT_SID,
        TaskAttributes: JSON.stringify(taskAttributes),
        TaskSid: TEST_TASK_SID,
        WorkerSid: TEST_WORKER_SID,
        WorkspaceSid: TEST_WORKSPACE_SID,
        EventType: RESERVATION_ACCEPTED,
      };

      const response = await lambdaAlbFetch(
        `/lambda/twilio/account-scoped/${TEST_ACCOUNT_SID}/webhooks/taskrouterCallback`,
        {
          method: 'POST',
          body: JSON.stringify(event),
          signatureAuthToken: TEST_AUTH_TOKEN,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      await verifyCreateContactRequest(createHrmContactEndpoint, {
        ...BLANK_CONTACT,
        definitionVersion: 'ut-v1',
        rawJson: {
          ...BLANK_CONTACT.rawJson,
          callType: callTypes.child,
          callerInformation: BLANK_POPULATED_PERSON_INFORMATION,
          childInformation: BLANK_POPULATED_PERSON_INFORMATION,
          definitionVersion: 'ut-v1', // for backwards compatibility
        },
        twilioWorkerId: TEST_WORKER_SID,
        taskId: TEST_TASK_SID as TaskSID,
        channelSid: '',
        serviceSid: '',
        // We set createdBy to the workerSid because the contact is 'created' by the worker who accepts the task
        createdBy: TEST_WORKER_SID as HrmContact['createdBy'],
        timeOfContact: expect.toParseAsDate(),
        number: expectedIdentifier,
        channel: channelType as HrmContact['channel'],
      });
    },
  );
});
