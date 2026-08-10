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

import twilio from 'twilio';
import { RecursivePartial } from '../RecursivePartial';
import { WorkspaceContext } from 'twilio/lib/rest/taskrouter/v1/workspace';
import { EventFields } from '../../../src/taskrouter';
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { handleEvent } from '../../../src/hrm/conversationMediaTaskRouterListener';
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

jest.mock('../../../src/conversation/getExternalRecordingS3Location', () => ({
  getExternalRecordingS3Location: jest.fn(),
}));
const mockGetExternalRecordingS3Location =
  getExternalRecordingS3Location as jest.MockedFunction<
    typeof getExternalRecordingS3Location
  >;

const newEventFields = (attributes: Record<string, any> = {}): EventFields =>
  ({
    TaskAttributes: JSON.stringify({
      channelSid: 'CHut',
      channelType: 'web',
      contactId: TEST_CONTACT_ID,
      ...attributes,
    }),
    TaskSid: TEST_TASK_SID,
    WorkerSid: TEST_WORKER_SID,
  }) as EventFields;

const postedConversationMedia = () =>
  mockFetch.mock.calls
    .filter(([url]) => url.toString().endsWith('conversationMedia'))
    .map(([, options]) => JSON.parse(options?.body as string));

describe('conversationMediaTaskRouterListener handleEvent', () => {
  let twilioClient: twilio.Twilio;

  const setUpClient = (
    attributes: Record<string, any> = {
      feature_flags: { use_twilio_lambda_for_conversation_media: true },
    },
  ) => {
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
                          reservations: {
                            list: async () => [
                              {
                                sid: TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
                                reservationStatus: 'wrapping',
                                workerSid: TEST_WORKER_SID,
                              },
                            ],
                          },
                        };
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
    twilioClient = setConfigurationAttributes(
      mockTwilioClient as twilio.Twilio,
      attributes,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSsmParameter.mockImplementation((path: string) => {
      if (path.includes('/static_key')) {
        return Promise.resolve('unit_test_static_key');
      } else if (path.endsWith('/workspace_sid')) {
        return Promise.resolve(TEST_WORKSPACE_SID);
      }
      throw new Error(`Unexpected SSM parameter path: ${path}`);
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
    mockGetExternalRecordingS3Location.mockResolvedValue(
      newOk({ recordingSid: 'REut', bucket: 'ut-bucket', key: 'ut-key' }),
    );
    setUpClient();
  });

  test('feature flag not set - does nothing', async () => {
    setUpClient({ feature_flags: { use_twilio_lambda_for_conversation_media: false } });
    await handleEvent(newEventFields(), TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('no contactId on task - does nothing', async () => {
    await handleEvent(
      newEventFields({ contactId: undefined }),
      TEST_ACCOUNT_SID,
      twilioClient,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('voicemail task - does nothing, media added on contact creation', async () => {
    await handleEvent(
      newEventFields({ channelType: 'voicemail' }),
      TEST_ACCOUNT_SID,
      twilioClient,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('chat task - adds pending transcript and twilio stored media', async () => {
    await handleEvent(newEventFields(), TEST_ACCOUNT_SID, twilioClient);
    expect(postedConversationMedia()).toEqual([
      [
        {
          storeType: 'S3',
          storeTypeSpecificData: { type: 'transcript' },
        },
        {
          storeType: 'twilio',
          storeTypeSpecificData: {
            reservationSid: TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
          },
        },
      ],
    ]);
  });

  test('chat task with zero transcript retention - adds no media', async () => {
    setUpClient({
      feature_flags: { use_twilio_lambda_for_conversation_media: true },
      enforceZeroTranscriptRetention: true,
    });
    await handleEvent(newEventFields(), TEST_ACCOUNT_SID, twilioClient);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('chat task uses reservation with task control if a transfer took place', async () => {
    await handleEvent(
      newEventFields({
        transferMeta: { sidWithTaskControl: 'WR-transferred-to' },
      }),
      TEST_ACCOUNT_SID,
      twilioClient,
    );
    expect(postedConversationMedia()[0]).toContainEqual({
      storeType: 'twilio',
      storeTypeSpecificData: { reservationSid: 'WR-transferred-to' },
    });
  });

  test('voice task with external recordings enabled - adds twilio media & looked up recording', async () => {
    setUpClient({
      feature_flags: { use_twilio_lambda_for_conversation_media: true },
      external_recordings_enabled: true,
    });
    await handleEvent(
      newEventFields({
        channelType: 'voice',
        conference: { participants: { worker: 'CAut' } },
      }),
      TEST_ACCOUNT_SID,
      twilioClient,
    );
    expect(mockGetExternalRecordingS3Location).toHaveBeenCalledWith({
      accountSid: TEST_ACCOUNT_SID,
      callSid: 'CAut',
    });
    expect(postedConversationMedia()).toEqual([
      [
        {
          storeType: 'twilio',
          storeTypeSpecificData: {
            reservationSid: TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
          },
        },
        {
          storeType: 'S3',
          storeTypeSpecificData: {
            type: 'recording',
            location: { bucket: 'ut-bucket', key: 'ut-key' },
          },
        },
      ],
    ]);
  });

  test('voice task with segment link - uses the location on the task rather than looking it up', async () => {
    setUpClient({
      feature_flags: { use_twilio_lambda_for_conversation_media: true },
      external_recordings_enabled: true,
    });
    mockGetSsmParameter.mockImplementation((path: string) => {
      if (path.includes('/static_key')) {
        return Promise.resolve('unit_test_static_key');
      } else if (path.endsWith('/workspace_sid')) {
        return Promise.resolve(TEST_WORKSPACE_SID);
      } else if (path.endsWith('/docs_bucket_name')) {
        return Promise.resolve('ut-docs-bucket');
      }
      throw new Error(`Unexpected SSM parameter path: ${path}`);
    });
    await handleEvent(
      newEventFields({
        channelType: 'voice',
        conversations: {
          segment_link: 'https://recordings.example.com/voice-recordings/ACut/REut',
        },
      }),
      TEST_ACCOUNT_SID,
      twilioClient,
    );
    expect(mockGetExternalRecordingS3Location).not.toHaveBeenCalled();
    expect(postedConversationMedia()[0]).toContainEqual({
      storeType: 'S3',
      storeTypeSpecificData: {
        type: 'recording',
        location: { bucket: 'ut-docs-bucket', key: 'voice-recordings/ACut/REut' },
      },
    });
  });

  test('voice task where recording cannot be found - only adds twilio stored media', async () => {
    setUpClient({
      feature_flags: { use_twilio_lambda_for_conversation_media: true },
      external_recordings_enabled: true,
    });
    mockGetExternalRecordingS3Location.mockResolvedValue(
      newErr({ message: 'No recording found', error: { statusCode: 404 } }),
    );
    await handleEvent(
      newEventFields({
        channelType: 'voice',
        conference: { participants: { worker: 'CAut' } },
      }),
      TEST_ACCOUNT_SID,
      twilioClient,
    );
    expect(postedConversationMedia()).toEqual([
      [
        {
          storeType: 'twilio',
          storeTypeSpecificData: {
            reservationSid: TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
          },
        },
      ],
    ]);
  });

  test('voice task with external recordings disabled - only adds twilio stored media', async () => {
    await handleEvent(
      newEventFields({
        channelType: 'voice',
        conference: { participants: { worker: 'CAut' } },
      }),
      TEST_ACCOUNT_SID,
      twilioClient,
    );
    expect(mockGetExternalRecordingS3Location).not.toHaveBeenCalled();
    expect(postedConversationMedia()).toEqual([
      [
        {
          storeType: 'twilio',
          storeTypeSpecificData: {
            reservationSid: TEST_RESERVATION_FOR_TEST_WORKER_ON_TEST_TASK_SID,
          },
        },
      ],
    ]);
  });
});
