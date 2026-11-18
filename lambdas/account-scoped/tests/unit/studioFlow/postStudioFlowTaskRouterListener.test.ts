/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { triggerPostStudioFlowHandler } from '../../../src/studioFlow/postStudioFlowTaskRouterListener';
import { retrieveServiceConfigurationAttributes } from '../../../src/configuration/aseloConfiguration';
import { TEST_ACCOUNT_SID, TEST_TASK_SID } from '../../testTwilioValues';

const TASK_QUEUE_SID = 'WQut';

const mockCallUpdate = jest.fn();
const mockExecutionsCreate = jest.fn();
let taskAttributes: Record<string, any>;

const mockClient = {
  taskrouter: {
    v1: {
      workspaces: {
        get: () => ({
          tasks: {
            get: () => ({
              fetch: async () => ({
                taskChannelUniqueName: 'voice',
                taskQueueSid: TASK_QUEUE_SID,
                attributes: JSON.stringify(taskAttributes),
              }),
            }),
          },
        }),
      },
    },
  },
  conferences: {
    get: () => ({
      participants: {
        list: async () => [
          { callSid: 'CAcaller', status: 'connected', remove: jest.fn() },
        ],
      },
    }),
  },
  calls: { get: () => ({ update: mockCallUpdate }) },
  studio: {
    v2: { flows: { get: () => ({ executions: { create: mockExecutionsCreate } }) } },
  },
};

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(async () => mockClient),
  getWorkspaceSid: jest.fn().mockResolvedValue('WSut'),
}));
jest.mock('../../../src/configuration/aseloConfiguration', () => ({
  retrieveServiceConfigurationAttributes: jest.fn(),
}));
jest.mock('../../../src/task/patchTaskAttributes', () => ({
  patchTaskAttributes: jest.fn(),
}));

const mockRetrieveServiceConfigurationAttributes =
  retrieveServiceConfigurationAttributes as jest.Mock;

const configurePostStudioFlow = (flowTrigger: 'inProgressCall' | 'rest') =>
  mockRetrieveServiceConfigurationAttributes.mockResolvedValue({
    hrm_base_url: 'https://hrm.example',
    helplineLanguage: 'fr-CA',
    postStudioFlows: { [TASK_QUEUE_SID]: { studioFlowSid: 'FWut', flowTrigger } },
  });

const triggerPostStudioFlow = () =>
  triggerPostStudioFlowHandler(
    { body: { taskSid: TEST_TASK_SID } } as any,
    TEST_ACCOUNT_SID,
  );

const redirectUrl = () => mockCallUpdate.mock.calls[0][0].twiml.toString();

beforeEach(() => {
  jest.clearAllMocks();
  taskAttributes = {
    contactId: '1234',
    language: 'en-US',
    conference: { sid: 'CFut' },
    from: '+15550000001',
    to: '+15550000002',
  };
});

describe('inProgressCall post studio flow', () => {
  test('passes the contact, task and task language to the flow', async () => {
    configurePostStudioFlow('inProgressCall');

    await triggerPostStudioFlow();

    expect(redirectUrl()).toContain(
      `contactId=1234&amp;taskSid=${TEST_TASK_SID}&amp;taskLanguage=en-US<`,
    );
  });

  test('task without a language - passes the helpline language', async () => {
    configurePostStudioFlow('inProgressCall');
    delete taskAttributes.language;

    await triggerPostStudioFlow();

    expect(redirectUrl()).toContain('taskLanguage=fr-CA<');
  });
});

describe('rest post studio flow', () => {
  test('passes the task language as a flow parameter', async () => {
    configurePostStudioFlow('rest');

    await triggerPostStudioFlow();

    expect(mockExecutionsCreate.mock.calls[0][0].parameters).toStrictEqual({
      contactId: '1234',
      contactTaskSid: TEST_TASK_SID,
      taskQueueSid: TASK_QUEUE_SID,
      taskLanguage: 'en-US',
    });
  });

  test('task without a language - passes the helpline language', async () => {
    configurePostStudioFlow('rest');
    delete taskAttributes.language;

    await triggerPostStudioFlow();

    expect(mockExecutionsCreate.mock.calls[0][0].parameters.taskLanguage).toBe('fr-CA');
  });
});
