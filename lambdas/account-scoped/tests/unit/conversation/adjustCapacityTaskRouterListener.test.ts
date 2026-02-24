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

import { handleEvent } from '../../../src/conversation/adjustCapacityTaskRouterListener';
import { adjustChatCapacity } from '../../../src/conversation/adjustChatCapacity';
import { EventFields } from '../../../src/taskrouter';
import { TEST_ACCOUNT_SID, TEST_TASK_SID, TEST_WORKER_SID } from '../../testTwilioValues';
import { newMockTwilioClientWithConfigurationAttributes } from '../mockServiceConfiguration';
import {
  RESERVATION_ACCEPTED,
  RESERVATION_REJECTED,
} from '../../../src/taskrouter/eventTypes';

jest.mock('../../../src/conversation/adjustChatCapacity', () => ({
  adjustChatCapacity: jest.fn(),
}));
const mockAdjustChatCapacity = adjustChatCapacity as jest.MockedFunction<
  typeof adjustChatCapacity
>;

const newEventFields = (
  taskChannelUniqueName: string,
  eventType = RESERVATION_ACCEPTED,
): EventFields =>
  ({
    EventType: eventType,
    TaskSid: TEST_TASK_SID,
    WorkerSid: TEST_WORKER_SID,
    TaskChannelUniqueName: taskChannelUniqueName,
    TaskAttributes: JSON.stringify({}),
  }) as EventFields;

describe('adjustCapacityTaskRouterListener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdjustChatCapacity.mockResolvedValue({ status: 200, message: 'OK' });
  });

  test('use_twilio_lambda_adjust_capacity flag not set - skips without calling adjustChatCapacity', async () => {
    const client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_adjust_capacity: false },
    });

    await handleEvent(newEventFields('chat'), TEST_ACCOUNT_SID, client);

    expect(mockAdjustChatCapacity).not.toHaveBeenCalled();
  });

  test('non-chat task channel - skips without calling adjustChatCapacity', async () => {
    const client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: {
        use_twilio_lambda_adjust_capacity: true,
        enable_manual_pulling: true,
      },
    });

    await handleEvent(newEventFields('voice'), TEST_ACCOUNT_SID, client);

    expect(mockAdjustChatCapacity).not.toHaveBeenCalled();
  });

  test('enable_manual_pulling flag not set - skips without calling adjustChatCapacity', async () => {
    const client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: {
        use_twilio_lambda_adjust_capacity: true,
        enable_manual_pulling: false,
      },
    });

    await handleEvent(newEventFields('chat'), TEST_ACCOUNT_SID, client);

    expect(mockAdjustChatCapacity).not.toHaveBeenCalled();
  });

  test('both flags enabled and chat channel - calls adjustChatCapacity with setTo1', async () => {
    const client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: {
        use_twilio_lambda_adjust_capacity: true,
        enable_manual_pulling: true,
      },
    });

    await handleEvent(
      newEventFields('chat', RESERVATION_ACCEPTED),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockAdjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'setTo1',
    });
  });

  test('both flags enabled, reservation rejected, chat channel - calls adjustChatCapacity with setTo1', async () => {
    const client = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: {
        use_twilio_lambda_adjust_capacity: true,
        enable_manual_pulling: true,
      },
    });

    await handleEvent(
      newEventFields('chat', RESERVATION_REJECTED),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockAdjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'setTo1',
    });
  });
});
