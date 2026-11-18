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
import { AccountSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';

type ReservableTask = Pick<TaskInstance, 'reservations' | 'sid'>;

export type WaitingForSpecificTaskInfo = {
  // The sid of the task the worker should receive a reservation for - this should also be set as
  // the waitingForSpecificTaskSid attribute on that task, so TaskRouter workflow expressions can match the two up.
  taskSid: string;
  reason: 'offline-contact' | 'takeover';
  // The original task being taken over, only present for takeovers
  originalTaskSid?: string;
};

/**
 * `waitingOfflineContact` is deprecated in favour of the generic `waitingForSpecificTask` attribute below.
 * Keep checking it here (and setting it alongside `waitingForSpecificTask` for offline contact assignment)
 * until all deployed TaskRouter workflows have been updated to use `waitingForSpecificTask`, at which point
 * it and this check can be removed.
 */
export const isWaitingForTask = (attributes: Record<string, unknown>) =>
  Boolean(attributes.waitingForSpecificTask || attributes.waitingOfflineContact);

const waitForReservation = (): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, 200);
  });

/**
 * Polls the reservations on a task for one addressed to targetSid, and accepts it once found.
 * beforeAccept, if provided, is invoked with the reservation sid before it is accepted (or once
 * discovered already accepted) so callers can record it (e.g. to update transfer metadata).
 */
export const acceptSpecificTask = async (
  targetSid: string,
  task: ReservableTask,
  beforeAccept?: (reservationSid: string, alreadyAccepted: boolean) => Promise<void>,
): Promise<void> => {
  for (let retry = 0; retry <= 8; retry++) {
    // eslint-disable-next-line no-await-in-loop
    const reservations = await task.reservations().list();
    const reservation = reservations.find(r => r.workerSid === targetSid);
    if (reservation) {
      const alreadyAccepted = reservation.reservationStatus === 'accepted';
      // eslint-disable-next-line no-await-in-loop
      await beforeAccept?.(reservation.sid, alreadyAccepted);
      if (alreadyAccepted) return;
      // eslint-disable-next-line no-await-in-loop
      const accepted = await reservation.update({ reservationStatus: 'accepted' });
      if (accepted.reservationStatus !== 'accepted') {
        throw new Error(
          `Error: reservation ${reservation.sid} for task ${task.sid} and worker ${targetSid} not accepted, status: ${accepted.reservationStatus}`,
        );
      }
      return;
    }
    if (retry < 8) {
      // eslint-disable-next-line no-await-in-loop
      await waitForReservation();
    }
  }
  throw new Error(
    `Error: no reservation found for task ${task.sid} and worker ${targetSid} after 8 retries`,
  );
};

/**
 * Temporarily puts worker into an available activity and marks it as only able to accept a
 * specific task (via the waitingForSpecificTask / waitingForSpecificTaskInfo attributes), runs
 * assign, then restores the worker's previous activity and attributes (keeping any unrelated
 * attribute changes made elsewhere while assign() was running).
 *
 * Throws if the worker is already waiting for a specific task, to avoid two concurrent callers
 * fighting over the same worker's temporary availability.
 */
export const withAvailableWorkerForTask = async <T>(
  accountSid: AccountSID,
  worker: Pick<WorkerInstance, 'sid'>,
  info: WaitingForSpecificTaskInfo,
  assign: () => Promise<T>,
): Promise<T> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  const workerContext = client.taskrouter.v1.workspaces(workspaceSid).workers(worker.sid);
  const currentWorker = await workerContext.fetch();
  const previousActivitySid = currentWorker.activitySid;
  const previousAttributes = JSON.parse(currentWorker.attributes);
  if (isWaitingForTask(previousAttributes)) {
    throw new Error(`Worker ${worker.sid} is already waiting for a specific task.`);
  }

  const availableActivities = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .activities.list({ available: 'true' });
  if (!availableActivities.length) {
    throw new Error(
      `No available worker activity configured for workspace ${workspaceSid}.`,
    );
  }
  if (availableActivities.length > 1) {
    console.warn(
      `There are ${availableActivities.length} available worker activities for workspace ${workspaceSid}, but there should only be one.`,
    );
  }

  const temporaryAttributes = {
    waitingForSpecificTask: true,
    waitingForSpecificTaskInfo: info,
    // Deprecated: remove once all deployed workflows route only on waitingForSpecificTask.
    ...(info.reason === 'offline-contact' ? { waitingOfflineContact: true } : {}),
  };

  console.info(
    `Setting worker ${worker.sid} to available activity ${availableActivities[0].sid} to accept task ${info.taskSid} (reason: ${info.reason})`,
  );
  await workerContext.update({
    activitySid: availableActivities[0].sid,
    attributes: JSON.stringify({ ...previousAttributes, ...temporaryAttributes }),
  });

  try {
    return await assign();
  } finally {
    console.info(
      `Restoring worker ${worker.sid} to previous activity ${previousActivitySid} after specific task assignment`,
    );
    let attributesToRestore = previousAttributes;
    try {
      // Refetch so unrelated attribute changes made during assign() are retained.
      const latestWorker = await workerContext.fetch();
      const latestAttributes = JSON.parse(latestWorker.attributes);
      attributesToRestore = { ...latestAttributes };
      for (const key of Object.keys(temporaryAttributes)) {
        if (Object.prototype.hasOwnProperty.call(previousAttributes, key)) {
          attributesToRestore[key] = previousAttributes[key];
        } else {
          delete attributesToRestore[key];
        }
      }
    } catch (error) {
      console.error(
        `Unable to refetch worker ${worker.sid} attributes for restoration; falling back to previous attributes`,
        error,
      );
    }
    await workerContext.update({
      activitySid: previousActivitySid,
      attributes: JSON.stringify(attributesToRestore),
      rejectPendingReservations: true,
    });
  }
};
