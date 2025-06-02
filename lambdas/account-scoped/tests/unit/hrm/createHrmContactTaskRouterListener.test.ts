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
import { WorkspaceContext } from 'twilio/lib/rest/taskrouter/v1/workspace';
import { BLANK_CONTACT } from './testContacts';
import { EventFields } from '../../../src/taskrouter';
import { getSsmParameter } from '../../../src/ssmCache';
import { handleEvent } from '../../../src/hrm/createHrmContactTaskRouterListener';
import { populateHrmContactFormFromTaskByKeys } from '../../../src/hrm/populateHrmContactFormFromTaskByKeys';
import {
  TEST_ACCOUNT_SID,
  TEST_CONTACT_ID,
  TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
  TEST_TASK_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';
import { setConfigurationAttributes } from '../mockServiceConfiguration';
import { newOk } from '../../../src/Result';

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn();
global.fetch = mockFetch;

jest.mock('../../../src/ssmCache', () => ({
  getSsmParameter: jest.fn(),
}));
const mockGetSsmParameter = getSsmParameter as jest.MockedFunction<
  typeof getSsmParameter
>;

jest.mock('../../../src/hrm/populateHrmContactFormFromTaskByKeys', () => ({
  populateHrmContactFormFromTaskByKeys: jest.fn(),
}));
const mockPopulateHrmContactFormFromTask =
  populateHrmContactFormFromTaskByKeys as jest.MockedFunction<
    typeof populateHrmContactFormFromTaskByKeys
  >;

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
      taskrouter: {
        v1: {
          workspaces: {
            get: (workspaceSid: string) => {
              if (workspaceSid === TEST_WORKSPACE_SID) {
                return {
                  tasks: {
                    get: (taskSid: string) => {
                      if (taskSid === TEST_TASK_SID) {
                        return {
                          update: mockUpdateTask as TaskContext['update'],
                          fetch: mockFetchTask as TaskContext['fetch'],
                          reservations: {
                            list: async () => {
                              return [
                                {
                                  sid: TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
                                  reservationStatus: 'pending',
                                  workerName: 'workerName',
                                  workerSid: TEST_WORKER_SID,
                                },
                              ];
                            },
                          },
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
        return Promise.resolve(TEST_WORKSPACE_SID);
      }
      throw new Error(`Unexpected SSM parameter path: ${path}`);
    });
    twilioClient = setConfigurationAttributes(twilioClient, {});
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ...BLANK_CONTACT,
        id: TEST_CONTACT_ID,
      }),
    } as Response);
    mockPopulateHrmContactFormFromTask.mockResolvedValue(
      newOk({
        ...BLANK_CONTACT,
        id: TEST_CONTACT_ID,
      }),
    );
  });

  test('offline contact task - does nothing', async () => {
    const eventFields = newEventFields({ isContactlessTask: true });
    setTaskReturnedByFetch(eventFields);
    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  test('transfer task - sets sidWithTaskControl to reservation sid for worker', async () => {
    const eventFields = newEventFields({ transferTargetType: 'queue' });
    setTaskReturnedByFetch(eventFields);
    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);
    const originalAttributes = JSON.parse(eventFields.TaskAttributes);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpdateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: JSON.stringify({
          ...originalAttributes,
          transferMeta: {
            ...originalAttributes.transferMeta,
            sidWithTaskControl: TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
          },
        }),
      }),
    );
  });

  test('enable_backend_hrm_contact_creation not set - does nothing', async () => {
    twilioClient = setConfigurationAttributes(twilioClient, {
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
