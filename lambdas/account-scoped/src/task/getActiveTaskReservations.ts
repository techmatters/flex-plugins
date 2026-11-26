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

import type { TaskSID, WorkspaceSID } from '@tech-matters/twilio-types';
import type { ReservationInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';
import type { Twilio } from 'twilio';
import type { ReservationStatus } from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';

const ACTIVE_TASK_RESERVATION_STATUSES: ReservationStatus[] = ['pending', 'accepted'];

export const getActiveTaskReservations = async ({
  client,
  taskSid,
  workspaceSid,
}: {
  client: Twilio;
  taskSid: TaskSID;
  workspaceSid: WorkspaceSID;
}): Promise<ReservationInstance[]> => {
  const reservations = await client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks.get(taskSid)
    .reservations.list();

  return reservations.filter(reservation =>
    ACTIVE_TASK_RESERVATION_STATUSES.includes(reservation.reservationStatus),
  );
};
