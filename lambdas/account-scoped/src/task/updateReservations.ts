/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { newErr, newOk, Result } from '../Result';
import { ReservationInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';

type UpdateReservationStatusesResult = Result<
  { cause: Error },
  {
    updatedReservationSids: string[];
    updateReservationErrors: Error[];
  }
>;

export const updateReservationStatuses = async (
  reservations: ReservationInstance[],
  targetStatus: ReservationInstance['reservationStatus'],
): Promise<UpdateReservationStatusesResult> => {
  try {
    const results = await Promise.allSettled(
      reservations
        .filter(r => r.reservationStatus !== targetStatus)
        .map(async r => {
          console.debug(
            `Attempting to set reservation ${r.sid} to '${targetStatus}' status on task ${r.taskSid} for worker ${r.workerSid}, status: ${r.reservationStatus}`,
          );
          await r.update({
            reservationStatus: targetStatus,
          });
          console.debug(
            `Successfully set reservation ${r.sid} to '${targetStatus}' status on task ${r.taskSid} for worker ${r.workerSid}, status: ${r.reservationStatus}`,
          );
          return r.sid;
        }),
    );
    return newOk({
      updatedReservationSids: results
        .map(r => (r.status === 'fulfilled' ? r.value : undefined))
        .filter(Boolean) as string[],
      updateReservationErrors: results
        .map(r => (r.status === 'rejected' ? r.reason : undefined))
        .filter(Boolean) as Error[],
    });
  } catch (err) {
    const error = err as Error;
    return newErr({
      message: error.message,
      error: {
        cause: error,
      },
    });
  }
};
