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
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { handleEvent } from '../../../src/hrm/createHrmContactTaskRouterListener';
import { populateHrmContactFormFromTaskByKeys } from '../../../src/hrm/populateHrmContactFormFromTaskByKeys';
import { patchTaskAttributes } from '../../../src/task/patchTaskAttributes';
import { getExternalRecordingS3Location } from '../../../src/conversation/getExternalRecordingS3Location';
import {
  TEST_ACCOUNT_SID,
  TEST_CONTACT_ID,
  TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
  TEST_TASK_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';
import { setConfigurationAttributes } from '../mockServiceConfiguration';
import { newErr, newOk } from '../../../src/Result';

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn();
global.fetch = mockFetch;

jest.mock('@tech-matters/ssm-cache', () => ({
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

jest.mock('../../../src/task/patchTaskAttributes', () => ({
  patchTaskAttributes: jest.fn(),
}));
const mockPatchTaskAttributes = patchTaskAttributes as jest.MockedFunction<
  typeof patchTaskAttributes
>;

jest.mock('../../../src/conversation/getExternalRecordingS3Location', () => ({
  getExternalRecordingS3Location: jest.fn(),
}));
const mockGetExternalRecordingS3Location =
  getExternalRecordingS3Location as jest.MockedFunction<
    typeof getExternalRecordingS3Location
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
      if (path.includes('/static_key')) {
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
    mockPatchTaskAttributes.mockResolvedValue(newOk(undefined));
    mockGetExternalRecordingS3Location.mockResolvedValue(
      newOk({ recordingSid: 'REtest', key: 'voice-recordings/ACut/REtest', bucket: 'test-bucket' }),
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

  test('not a transfer or offline contact - creates contact and updates task attributes with contact ID', async () => {
    const eventFields = newEventFields({});
    setTaskReturnedByFetch(eventFields);
    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).toHaveBeenCalled();
    expect(mockPatchTaskAttributes).toHaveBeenCalledWith(
      TEST_ACCOUNT_SID,
      TEST_TASK_SID,
      expect.any(Function),
    );
    const attributesGenerator = mockPatchTaskAttributes.mock.calls[0][2];
    const originalAttributes = JSON.parse(eventFields.TaskAttributes);
    const patchedAttributes = attributesGenerator(originalAttributes);
    expect(patchedAttributes).toMatchObject({
      ...originalAttributes,
      contactId: TEST_CONTACT_ID.toString(),
    });
  });

  test('voicemail task - creates contact and posts conversationMedia with S3 recording location', async () => {
    const eventFields: EventFields = {
      ...newEventFields({ channelType: 'voicemail', customChannelType: 'voicemail', callSid: 'CAtest456' }),
    } as EventFields;
    setTaskReturnedByFetch(eventFields);

    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);

    expect(mockGetExternalRecordingS3Location).toHaveBeenCalledWith({
      accountSid: TEST_ACCOUNT_SID,
      callSid: 'CAtest456',
    });

    // Should have called fetch twice: once for the contact creation, once for conversationMedia
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const conversationMediaCall = mockFetch.mock.calls[1];
    const conversationMediaBody = JSON.parse((conversationMediaCall[1] as RequestInit).body as string);
    expect(conversationMediaBody).toEqual([
      {
        storeType: 'S3',
        storeTypeSpecificData: {
          type: 'recording',
          location: {
            bucket: 'test-bucket',
            key: 'voice-recordings/ACut/REtest',
          },
        },
      },
    ]);
  });

  test('voicemail task - does not post conversationMedia when recording lookup fails', async () => {
    mockGetExternalRecordingS3Location.mockResolvedValue(
      newErr({ message: 'No recording found', error: { statusCode: 404 } }),
    );

    const eventFields: EventFields = {
      ...newEventFields({ channelType: 'voicemail', customChannelType: 'voicemail', callSid: 'CAtest456' }),
    } as EventFields;
    setTaskReturnedByFetch(eventFields);

    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);

    expect(mockGetExternalRecordingS3Location).toHaveBeenCalled();
    // Only 1 fetch call for contact creation, no conversationMedia call
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('non-voicemail task - does not look up recording or post conversationMedia', async () => {
    const eventFields = newEventFields({ channelType: 'voice', customChannelType: 'voice' });
    setTaskReturnedByFetch(eventFields);

    await handleEvent(eventFields, TEST_ACCOUNT_SID, twilioClient);

    expect(mockGetExternalRecordingS3Location).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
