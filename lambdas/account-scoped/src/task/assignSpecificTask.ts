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
import { AccountSID, WorkerSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { isErr } from '@tech-matters/result-type';
import { patchWorker } from '../worker/patchWorker';

type ReservableTask = Pick<TaskInstance, 'reservations' | 'sid'>;

type WaitingForSpecificTaskInfoBase = {
  taskSid?: string;
};

type WaitingForOfflineContactInfo = WaitingForSpecificTaskInfoBase & {
  reason: 'offline-contact';
};

type WaitingForTakeoverInfo = WaitingForSpecificTaskInfoBase & {
  reason: 'takeover';
  // The original task being taken over
  originalTaskSid: string;
};

export type WaitingForSpecificTaskInfo =
  | WaitingForOfflineContactInfo
  | WaitingForTakeoverInfo;

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
      let accepted;
      try {
        // eslint-disable-next-line no-await-in-loop
        accepted = await reservation.update({ reservationStatus: 'accepted' });
      } catch (error) {
        // The Flex client may have accepted the reservation concurrently.
        // eslint-disable-next-line no-await-in-loop
        const current = await reservation.fetch();
        if (current.workerSid === targetSid && current.reservationStatus === 'accepted') {
          return;
        }
        throw error;
      }
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
 * Temporarily puts worker into an available activity and marks it as only able to receive tasks
 * targeted to it (via waitingForSpecificTask), runs
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
  const workerSid = worker.sid as WorkerSID;
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

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
  const availableActivitySid = availableActivities[0].sid;

  const temporaryAttributes = {
    waitingForSpecificTask: true,
    waitingForSpecificTaskInfo: info,
    // Deprecated: remove once all deployed workflows route only on waitingForSpecificTask.
    ...(info.reason === 'offline-contact' ? { waitingOfflineContact: true } : {}),
  };

  console.info(
    `Setting worker ${workerSid} to available activity ${availableActivitySid} for ${JSON.stringify(info)}`,
  );

  // patchWorker gives us the same ETag based optimistic concurrency protection as
  // patchTaskAttributes, but for the worker's activitySid as well as its attributes - this
  // guards against racing with another process that is also trying to change this worker's
  // activity / waiting-for-task state at the same time.
  const makeAvailableResult = await patchWorker(
    accountSid,
    workerSid,
    ({ attributes }) => {
      if (isWaitingForTask(attributes)) {
        throw new Error(
          `Worker ${workerSid} is already waiting for a specific task, so cannot also wait for ${JSON.stringify(info)}.`,
        );
      }
      return {
        activitySid: availableActivitySid,
        attributes: { ...attributes, ...temporaryAttributes },
      };
    },
    { requireEtag: true },
  );
  if (isErr(makeAvailableResult)) {
    throw new Error(makeAvailableResult.message);
  }
  const { previousActivitySid, previousAttributes } = makeAvailableResult.data;

  try {
    return await assign();
  } finally {
    console.info(
      `Restoring worker ${workerSid} to previous activity ${previousActivitySid} after specific task assignment`,
    );
    // Refetch (inside patchWorker) so unrelated attribute changes made during assign() are retained.
    const restoreResult = await patchWorker(
      accountSid,
      workerSid,
      ({ attributes: latestAttributes }) => {
        const attributesToRestore = { ...latestAttributes };
        for (const key of Object.keys(temporaryAttributes)) {
          if (Object.prototype.hasOwnProperty.call(previousAttributes, key)) {
            attributesToRestore[key] = previousAttributes[key];
          } else {
            delete attributesToRestore[key];
          }
        }
        return {
          activitySid: previousActivitySid,
          attributes: attributesToRestore,
          rejectPendingReservations: true,
        };
      },
      { requireEtag: true },
    );
    if (isErr(restoreResult)) {
      throw new Error(
        `Unable to restore worker ${workerSid} to previous activity ${previousActivitySid}: ${restoreResult.message}`,
      );
    }
  }
};
