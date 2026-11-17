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

export const isWaitingForTask = (attributes: Record<string, unknown>) =>
  Boolean(attributes.waitingForSpecificTask || attributes.waitingOfflineContact);

const waitForReservation = () =>
  new Promise(resolve => {
    setTimeout(resolve, 200);
  });

export const acceptSpecificTask = async (
  targetSid: string,
  task: ReservableTask,
  beforeAccept?: (reservationSid: string, alreadyAccepted: boolean) => Promise<void>,
): Promise<void> => {
  for (let retry = 0; retry <= 8; retry++) {
    const reservations = await task.reservations().list();
    const reservation = reservations.find(
      r =>
        r.workerSid === targetSid &&
        ['pending', 'accepted'].includes(r.reservationStatus),
    );
    if (reservation) {
      const alreadyAccepted = reservation.reservationStatus === 'accepted';
      await beforeAccept?.(reservation.sid, alreadyAccepted);
      if (alreadyAccepted) return;
      const accepted = await reservation.update({ reservationStatus: 'accepted' });
      if (accepted.reservationStatus !== 'accepted') {
        throw new Error('Error: reservation for task not accepted.');
      }
      return;
    }
    if (retry < 8) {
      await waitForReservation();
    }
  }
  throw new Error('Error: reservation for task not created.');
};

export const withAvailableWorkerForTask = async <T>(
  accountSid: AccountSID,
  worker: WorkerInstance,
  info: {
    taskSid: string;
    reason: 'offline-contact' | 'takeover';
    originalTaskSid?: string;
  },
  assign: () => Promise<T>,
): Promise<T> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  const workerContext = client.taskrouter.v1.workspaces(workspaceSid).workers(worker.sid);
  const currentWorker = await workerContext.fetch();
  const previousAttributes = JSON.parse(currentWorker.attributes);
  if (isWaitingForTask(previousAttributes)) {
    throw new Error('Worker is already waiting for a specific task.');
  }

  const activities = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .activities.list({ available: 'true' });
  if (!activities.length) throw new Error('No available worker activity configured.');

  const temporaryAttributes = {
    waitingForSpecificTask: true,
    waitingForSpecificTaskInfo: info,
    // Deprecated: retain until all deployed workflows use waitingForSpecificTask.
    ...(info.reason === 'offline-contact' ? { waitingOfflineContact: true } : {}),
  };
  let assignmentError: unknown;
  try {
    await workerContext.update({
      activitySid: activities[0].sid,
      attributes: JSON.stringify({ ...previousAttributes, ...temporaryAttributes }),
    });
    return await assign();
  } catch (error) {
    assignmentError = error;
    throw error;
  } finally {
    try {
      let attributes;
      try {
        // Refetch so unrelated attribute changes made during assignment are retained.
        const latestWorker = await workerContext.fetch();
        attributes = JSON.parse(latestWorker.attributes);
      } catch (error) {
        console.error(
          'Unable to refetch worker attributes for restoration; using original attributes',
          error,
        );
        attributes = { ...previousAttributes };
      }
      for (const key of Object.keys(temporaryAttributes)) {
        if (Object.prototype.hasOwnProperty.call(previousAttributes, key)) {
          attributes[key] = previousAttributes[key];
        } else {
          delete attributes[key];
        }
      }
      await workerContext.update({
        activitySid: currentWorker.activitySid,
        attributes: JSON.stringify(attributes),
        rejectPendingReservations: true,
      });
    } catch (error) {
      if (!assignmentError) throw error;
      console.error('Unable to restore worker after assignment failure', error);
    }
  }
};
