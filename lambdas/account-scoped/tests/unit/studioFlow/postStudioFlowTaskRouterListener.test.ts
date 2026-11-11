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
import { createPostSurveyControlTask } from '../../../src/postSurvey/postSurveyControlTask';
import { TEST_ACCOUNT_SID, TEST_TASK_SID } from '../../testTwilioValues';

const TASK_QUEUE_SID = 'WQut';
const STUDIO_FLOW_SID = 'FWut';
const CONFERENCE_SID = 'CFut';
const CALLER_CALL_SID = 'CAcaller';
const CONTROL_TASK_SID = 'WTcontrol';

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
          { callSid: CALLER_CALL_SID, status: 'connected', remove: jest.fn() },
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
jest.mock('../../../src/postSurvey/postSurveyControlTask', () => ({
  createPostSurveyControlTask: jest.fn(),
}));

const mockRetrieveServiceConfigurationAttributes =
  retrieveServiceConfigurationAttributes as jest.Mock;
const mockCreatePostSurveyControlTask = createPostSurveyControlTask as jest.Mock;

const configurePostStudioFlow = (configuration: Record<string, any>) =>
  mockRetrieveServiceConfigurationAttributes.mockResolvedValue({
    hrm_base_url: 'https://hrm.example',
    postStudioFlows: {
      [TASK_QUEUE_SID]: { studioFlowSid: STUDIO_FLOW_SID, ...configuration },
    },
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
    conference: { sid: CONFERENCE_SID },
    from: '+15550000001',
    to: '+15550000002',
  };
  mockCreatePostSurveyControlTask.mockResolvedValue({ sid: CONTROL_TASK_SID });
});

describe('inProgressCall post studio flow', () => {
  test('createSurveyControlTask not set - redirects the call without creating a control task', async () => {
    configurePostStudioFlow({ flowTrigger: 'inProgressCall' });

    await triggerPostStudioFlow();

    expect(mockCreatePostSurveyControlTask).not.toHaveBeenCalled();
    expect(redirectUrl()).toContain(`contactId=1234&amp;taskSid=${TEST_TASK_SID}<`);
  });

  test('createSurveyControlTask set - creates the control task and passes its SID to the flow', async () => {
    configurePostStudioFlow({
      flowTrigger: 'inProgressCall',
      createSurveyControlTask: true,
    });

    await triggerPostStudioFlow();

    expect(mockCreatePostSurveyControlTask).toHaveBeenCalledWith(
      mockClient,
      TEST_ACCOUNT_SID,
      {
        contactTaskSid: TEST_TASK_SID,
        contactId: '1234',
        language: 'en-US',
      },
    );
    expect(redirectUrl()).toContain(`&amp;controlTaskSid=${CONTROL_TASK_SID}`);
  });

  test('control task creation fails - still redirects the call to the flow', async () => {
    configurePostStudioFlow({
      flowTrigger: 'inProgressCall',
      createSurveyControlTask: true,
    });
    mockCreatePostSurveyControlTask.mockRejectedValue(new Error('boom'));

    await triggerPostStudioFlow();

    expect(redirectUrl()).not.toContain('controlTaskSid');
  });
});

describe('rest post studio flow', () => {
  test('createSurveyControlTask not set - starts the flow without a control task', async () => {
    configurePostStudioFlow({ flowTrigger: 'rest' });

    await triggerPostStudioFlow();

    expect(mockCreatePostSurveyControlTask).not.toHaveBeenCalled();
    expect(mockExecutionsCreate.mock.calls[0][0].parameters).not.toHaveProperty(
      'controlTaskSid',
    );
  });

  test('createSurveyControlTask set - passes the control task SID as a flow parameter', async () => {
    configurePostStudioFlow({ flowTrigger: 'rest', createSurveyControlTask: true });

    await triggerPostStudioFlow();

    expect(mockExecutionsCreate.mock.calls[0][0].parameters).toMatchObject({
      contactTaskSid: TEST_TASK_SID,
      controlTaskSid: CONTROL_TASK_SID,
    });
  });
});
