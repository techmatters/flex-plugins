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

import { isOk } from '@tech-matters/result-type';
import { handleChannelRelease } from '../../../src/channelCapture/channelCaptureHandlers';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

describe('handleChannelRelease', () => {
  const mockTaskUpdate = jest.fn();
  const twilioClient = {
    taskrouter: {
      v1: {
        workspaces: () => ({
          tasks: () => ({
            fetch: jest.fn().mockResolvedValue({ attributes: '{}' }),
            update: mockTaskUpdate,
          }),
        }),
      },
    },
  } as any;

  test('post survey complete - cancels the control task, the answers having been recorded already', async () => {
    const result = await handleChannelRelease({
      accountSid: TEST_ACCOUNT_SID,
      twilioClient,
      twilioWorkspaceSid: 'WSut',
      channelOrConversation: {} as any,
      capturedChannelAttributes: {
        releaseType: 'postSurveyComplete',
        controlTaskSid: 'WTcontrol',
      } as any,
    });

    expect(isOk(result)).toBe(true);
    expect(mockTaskUpdate).toHaveBeenCalledTimes(1);
    expect(mockTaskUpdate).toHaveBeenCalledWith({ assignmentStatus: 'canceled' });
  });
});
