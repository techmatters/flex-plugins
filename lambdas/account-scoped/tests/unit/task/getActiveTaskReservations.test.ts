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

import type { Twilio } from 'twilio';
import { getActiveTaskReservations } from '../../../src/task/getActiveTaskReservations';
import { TEST_TASK_SID, TEST_WORKSPACE_SID } from '../../testTwilioValues';

describe('getActiveTaskReservations', () => {
  const mockListReservations = jest.fn();
  const client = {
    taskrouter: {
      v1: {
        workspaces: {
          get: jest.fn(() => ({
            tasks: {
              get: jest.fn(() => ({
                reservations: { list: mockListReservations },
              })),
            },
          })),
        },
      },
    },
  } as unknown as Twilio;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(['pending', 'accepted'])(
    'returns %s reservations as active',
    async reservationStatus => {
      const reservation = { reservationStatus };
      mockListReservations.mockResolvedValue([reservation]);

      await expect(
        getActiveTaskReservations({
          client,
          taskSid: TEST_TASK_SID,
          workspaceSid: TEST_WORKSPACE_SID,
        }),
      ).resolves.toEqual([reservation]);
    },
  );

  test('excludes reservations that no longer have an active worker', async () => {
    const rejectedReservation = { reservationStatus: 'rejected' };
    mockListReservations.mockResolvedValue([
      rejectedReservation,
      { reservationStatus: 'completed' },
    ]);

    await expect(
      getActiveTaskReservations({
        client,
        taskSid: TEST_TASK_SID,
        workspaceSid: TEST_WORKSPACE_SID,
      }),
    ).resolves.toEqual([]);
  });
});
