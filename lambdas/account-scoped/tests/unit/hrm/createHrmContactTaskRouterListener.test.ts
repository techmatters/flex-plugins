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

import { RecursivePartial } from '../RecursivePartial';
import twilio from 'twilio';
import { TaskContext, TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import {
  ConfigurationContext,
  ConfigurationInstance,
} from 'twilio/lib/rest/flexApi/v1/configuration';
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

import { WorkspaceContext } from 'twilio/lib/rest/taskrouter/v1/workspace';
import { BLANK_CONTACT } from './testContacts';
import { EventFields } from '../../../src/taskrouter';
import { getSsmParameter } from '../../../src/ssmCache';
import { handleEvent } from '../../../src/hrm/createHrmContactTaskRouterListener';
import { populateHrmContactFormFromTask } from '../../../src/hrm/populateHrmContactFormFromTask';
import {
  TEST_ACCOUNT_SID,
  TEST_CONTACT_ID,
  TEST_TASK_SID,
  TEST_WORKER_SID,
} from '../testTwilioValues';

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn();
global.fetch = mockFetch;

jest.mock('../../../src/ssmCache', () => ({
  getSsmParameter: jest.fn(),
}));
const mockGetSsmParameter = getSsmParameter as jest.MockedFunction<
  typeof getSsmParameter
>;

jest.mock('../../../src/hrm/populateHrmContactFormFromTask', () => ({
  populateHrmContactFormFromTask: jest.fn(),
}));
const mockPopulateHrmContactFormFromTask =
  populateHrmContactFormFromTask as jest.MockedFunction<
    typeof populateHrmContactFormFromTask
  >;

const mockServiceConfigurationFetch: jest.MockedFunction<ConfigurationContext['fetch']> =
  jest.fn();
const CONFIG_FIELDS = [
  'definitionVersion',
  'hrm_api_version',
  'form_definitions_version_url',
  'assets_bucket_url',
  'helpline_code',
] as const;

type AseloServiceConfigurationAttributes = Record<
  (typeof CONFIG_FIELDS)[number],
  string
> & {
  feature_flags: Record<string, boolean | undefined>;
};

const DEFAULT_CONFIGURATION: AseloServiceConfigurationAttributes = {
  definitionVersion: 'ut-v1',
  hrm_api_version: 'v1',
  form_definitions_version_url: 'http://example.com/form-definitions',
  assets_bucket_url: 'http://example.com/assets',
  helpline_code: 'ut',
  feature_flags: {
    enable_backend_hrm_contact_creation: true,
  },
};

const setConfigurationAttributes = (
  attributes: RecursivePartial<AseloServiceConfigurationAttributes>,
) => {
  const updatedConfiguration: AseloServiceConfigurationAttributes = {
    ...DEFAULT_CONFIGURATION,
    ...attributes,
    feature_flags: {
      ...DEFAULT_CONFIGURATION.feature_flags,
      ...attributes.feature_flags,
    },
  };
  mockServiceConfigurationFetch.mockClear();
  mockServiceConfigurationFetch.mockResolvedValue({
    attributes: updatedConfiguration,
  } as ConfigurationInstance);
};

const newEventFields = (
  attributes: Record<string, string | boolean | number> = {},
): EventFields =>
  ({
    TaskAttributes: JSON.stringify({
      channelSid: 'CHut',
      channelType: 'web',
      customChannelType: 'web',
      ...attributes,
    }),
    TaskSid: TEST_TASK_SID,
    WorkerSid: TEST_WORKER_SID,
  }) as EventFields;

const mockFetchTask: jest.MockedFunction<TaskContext['fetch']> = jest.fn();
const mockUpdateTask: jest.MockedFunction<TaskContext['update']> = jest.fn();

const setTaskReturnedByFetch = ({ TaskAttributes, TaskSid }: EventFields) => {
  mockFetchTask.mockClear();
  mockFetchTask.mockResolvedValue({
    attributes: TaskAttributes,
    sid: TaskSid,
  } as TaskInstance);
};

describe('handleEvent', () => {
  let twilioClient: twilio.Twilio;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockTwilioClient: RecursivePartial<twilio.Twilio> = {
      flexApi: {
        v1: {
          configuration: {
            get: () => ({
              fetch: mockServiceConfigurationFetch as ConfigurationContext['fetch'],
            }),
          },
        },
      },
      taskrouter: {
        v1: {
          workspaces: {
            get: (workspaceSid: string) => {
              if (workspaceSid === 'WSut') {
                return {
                  tasks: {
                    get: (taskSid: string) => {
                      if (taskSid === TEST_TASK_SID) {
                        return {
                          update: mockUpdateTask as TaskContext['update'],
                          fetch: mockFetchTask as TaskContext['fetch'],
                        } as TaskContext;
                      } else throw new Error(`Unexpected task SID: ${taskSid}`);
                    },
                  },
                } as WorkspaceContext;
              } else throw new Error(`Unexpected workspace SID: ${workspaceSid}`);
            },
          },
        },
      },
    };

    twilioClient = mockTwilioClient as twilio.Twilio;

    mockGetSsmParameter.mockImplementation((path: string) => {
      if (path.endsWith('/static_key')) {
        return Promise.resolve('unit_test_static_key');
      } else if (path.endsWith('/workspace_sid')) {
        return Promise.resolve('WSut');
      }
      throw new Error(`Unexpected SSM parameter path: ${path}`);
    });
    setConfigurationAttributes({});
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ...BLANK_CONTACT,
        id: TEST_CONTACT_ID,
      }),
    } as Response);
    mockPopulateHrmContactFormFromTask.mockResolvedValue({
      ...BLANK_CONTACT,
      id: TEST_CONTACT_ID,
    });
  });

  test('offline contact task - does nothing', async () => {
    const eventFields = newEventFields({ isContactlessTask: true });
    setTaskReturnedByFetch(eventFields);
    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  test('transfer task - does nothing', async () => {
    const eventFields = newEventFields({ transferTargetType: 'queue' });
    setTaskReturnedByFetch(eventFields);
    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  test('enable_backend_hrm_contact_creation not set - does nothing', async () => {
    setConfigurationAttributes({
      feature_flags: {
        enable_backend_hrm_contact_creation: false,
      },
    });
    const eventFields = newEventFields({});
    setTaskReturnedByFetch(eventFields);
    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  test('enable_backend_hrm_contact_creation set, not a transfer or offline contact - creates contact and updates task attributes with contact ID', async () => {
    const eventFields = newEventFields({});
    setTaskReturnedByFetch(eventFields);
    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).toHaveBeenCalled();
    expect(mockUpdateTask).toHaveBeenCalled();
  });
});
