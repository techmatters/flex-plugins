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
import { mockHrmContacts } from '../sandbox/mockHrm';

afterAll(async () => {
  await mockingProxy.stop();
});

beforeAll(async () => {
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
  beforeEach(async () => {
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
    await mockHrmContacts(await mockttpServer());
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
        },
      },
    );

    expect(response.status).toBe(403);
  });
  test('should return 200 if valid twilio signature header is provided', async () => {
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
        signatureAuthToken: TEST_AUTH_TOKEN,
      },
    );

    expect(response.status).toBe(200);
  });
});
