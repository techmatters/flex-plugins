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

import twilio from 'twilio';
import { handleEvent } from '../../../src/conversation/janitorTaskRouterListener';
import { chatChannelJanitor } from '../../../src/conversation/chatChannelJanitor';
import { hasTaskControl } from '../../../src/transfer/hasTaskControl';
import { isChatCaptureControlTask } from '../../../src/channelCapture/channelCaptureHandlers';
import { isAseloCustomChannel } from '../../../src/customChannels/aseloCustomChannels';
import { EventFields } from '../../../src/taskrouter';
import {
  TEST_ACCOUNT_SID,
  TEST_TASK_SID,
  TEST_CHANNEL_SID,
  TEST_CONVERSATION_SID,
} from '../../testTwilioValues';
import { newMockTwilioClientWithConfigurationAttributes } from '../mockServiceConfiguration';
import {
  TASK_CANCELED,
  TASK_COMPLETED,
  TASK_DELETED,
  TASK_WRAPUP,
} from '../../../src/taskrouter/eventTypes';

jest.mock('../../../src/conversation/chatChannelJanitor', () => ({
  chatChannelJanitor: jest.fn(),
}));
const mockChatChannelJanitor = chatChannelJanitor as jest.MockedFunction<
  typeof chatChannelJanitor
>;

jest.mock('../../../src/transfer/hasTaskControl', () => ({
  hasTaskControl: jest.fn(),
}));
const mockHasTaskControl = hasTaskControl as jest.MockedFunction<typeof hasTaskControl>;

jest.mock('../../../src/channelCapture/channelCaptureHandlers', () => ({
  isChatCaptureControlTask: jest.fn(),
}));
const mockIsChatCaptureControlTask = isChatCaptureControlTask as jest.MockedFunction<
  typeof isChatCaptureControlTask
>;

jest.mock('../../../src/customChannels/aseloCustomChannels', () => ({
  isAseloCustomChannel: jest.fn(),
}));
const mockIsAseloCustomChannel = isAseloCustomChannel as jest.MockedFunction<
  typeof isAseloCustomChannel
>;

jest.mock('@tech-matters/twilio-configuration', () => ({
  getWorkspaceSid: jest.fn().mockResolvedValue('WSut'),
}));

const newEventFields = (
  taskChannelUniqueName: string,
  eventType = TASK_CANCELED,
  taskAttributes: Record<string, unknown> = {},
): EventFields =>
  ({
    EventType: eventType,
    TaskSid: TEST_TASK_SID,
    TaskChannelUniqueName: taskChannelUniqueName,
    TaskAttributes: JSON.stringify({
      channelSid: TEST_CHANNEL_SID,
      conversationSid: TEST_CONVERSATION_SID,
      ...taskAttributes,
    }),
  }) as EventFields;

describe('janitorTaskRouterListener', () => {
  let client: twilio.Twilio;

  beforeEach(() => {
    jest.clearAllMocks();

    client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_janitor: true },
    });

    mockChatChannelJanitor.mockResolvedValue({
      message: 'done',
      result: { message: 'done' } as any,
    });
    mockHasTaskControl.mockResolvedValue(true);
    mockIsChatCaptureControlTask.mockReturnValue(false);
    mockIsAseloCustomChannel.mockReturnValue(false);
  });

  test('use_twilio_lambda_janitor flag not set - skips without calling chatChannelJanitor', async () => {
    client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_janitor: false },
    });

    await handleEvent(newEventFields('chat'), TEST_ACCOUNT_SID, client);

    expect(mockChatChannelJanitor).not.toHaveBeenCalled();
  });

  test('non-chat/non-survey task channel - skips without calling chatChannelJanitor', async () => {
    await handleEvent(newEventFields('voice'), TEST_ACCOUNT_SID, client);

    expect(mockChatChannelJanitor).not.toHaveBeenCalled();
  });

  test('survey task with non-TASK_CANCELED event - skips without calling chatChannelJanitor', async () => {
    await handleEvent(newEventFields('survey', TASK_COMPLETED), TEST_ACCOUNT_SID, client);

    expect(mockChatChannelJanitor).not.toHaveBeenCalled();
  });

  test('bot capture task (isChatCaptureControl) on TASK_CANCELED - calls chatChannelJanitor after delay', async () => {
    mockIsChatCaptureControlTask.mockReturnValue(true);
    jest.spyOn(global, 'setTimeout').mockImplementation(fn => {
      fn();
      return 0 as any;
    });

    await handleEvent(
      newEventFields('chat', TASK_CANCELED, { isChatCaptureControl: true }),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockChatChannelJanitor).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      channelSid: TEST_CHANNEL_SID,
      conversationSid: TEST_CONVERSATION_SID,
    });

    jest.restoreAllMocks();
  });

  test('custom channel task on TASK_DELETED - calls chatChannelJanitor for channelSid', async () => {
    mockIsChatCaptureControlTask.mockReturnValue(false);
    mockHasTaskControl.mockResolvedValue(true);
    mockIsAseloCustomChannel.mockReturnValue(true);

    await handleEvent(
      newEventFields('chat', TASK_DELETED, { channelType: 'instagram' }),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockChatChannelJanitor).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      channelSid: TEST_CHANNEL_SID,
    });
  });

  test('custom channel task but not in task control - skips chatChannelJanitor', async () => {
    mockIsChatCaptureControlTask.mockReturnValue(false);
    mockHasTaskControl.mockResolvedValue(false);
    mockIsAseloCustomChannel.mockReturnValue(true);

    await handleEvent(
      newEventFields('chat', TASK_DELETED, { channelType: 'instagram' }),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockChatChannelJanitor).not.toHaveBeenCalled();
  });

  test('deactivate conversation orchestration on TASK_WRAPUP with enable_post_survey=false - calls chatChannelJanitor', async () => {
    client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_janitor: true, enable_post_survey: false },
    });
    mockIsChatCaptureControlTask.mockReturnValue(false);
    mockHasTaskControl.mockResolvedValue(true);
    mockIsAseloCustomChannel.mockReturnValue(false);

    await handleEvent(newEventFields('chat', TASK_WRAPUP), TEST_ACCOUNT_SID, client);

    expect(mockChatChannelJanitor).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      channelSid: TEST_CHANNEL_SID,
      conversationSid: TEST_CONVERSATION_SID,
    });
  });

  test('deactivate conversation orchestration on TASK_WRAPUP with enable_post_survey=true - skips chatChannelJanitor', async () => {
    client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_janitor: true, enable_post_survey: true },
    });
    mockIsChatCaptureControlTask.mockReturnValue(false);
    mockHasTaskControl.mockResolvedValue(true);
    mockIsAseloCustomChannel.mockReturnValue(false);

    await handleEvent(newEventFields('chat', TASK_WRAPUP), TEST_ACCOUNT_SID, client);

    expect(mockChatChannelJanitor).not.toHaveBeenCalled();
  });

  test('TASK_WRAPUP but not in task control - skips chatChannelJanitor', async () => {
    client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_janitor: true, enable_post_survey: false },
    });
    mockIsChatCaptureControlTask.mockReturnValue(false);
    mockHasTaskControl.mockResolvedValue(false);

    await handleEvent(newEventFields('chat', TASK_WRAPUP), TEST_ACCOUNT_SID, client);

    expect(mockChatChannelJanitor).not.toHaveBeenCalled();
  });

  test('chatChannelJanitor throws - error is re-thrown', async () => {
    client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_janitor: true, enable_post_survey: false },
    });
    mockIsChatCaptureControlTask.mockReturnValue(false);
    mockHasTaskControl.mockResolvedValue(true);
    const error = new Error('Janitor failed');
    mockChatChannelJanitor.mockRejectedValue(error);

    await expect(
      handleEvent(newEventFields('chat', TASK_WRAPUP), TEST_ACCOUNT_SID, client),
    ).rejects.toThrow('Janitor failed');
  });
});
