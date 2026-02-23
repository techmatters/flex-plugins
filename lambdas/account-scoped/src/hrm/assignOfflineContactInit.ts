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

import { FlexValidatedHandler } from '../validation/flexToken';
import type { AccountSID } from '@tech-matters/twilio-types';
import {
  getConversationsTransferWorkflow,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';
import { newErr, newOk } from '../Result';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';

export type Body = {
  targetSid?: string;
  taskAttributes?: string;
};

type AssignmentResult =
  | {
      type: 'error';
      payload: {
        status: number;
        message: string;
        taskRemoved: boolean;
        attributes?: string;
      };
    }
  | { type: 'success'; newTask: TaskInstance };

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const cleanUpTask = async (task: TaskInstance, message: string) => {
  const { attributes } = task;
  console.info(`Cleaning up task ${task.sid}: ${message}`);
  const taskRemoved = await task.remove();
  console.info(`Task ${task.sid} removed: ${taskRemoved}`);

  return {
    type: 'error',
    payload: {
      status: 500,
      message,
      taskRemoved,
      attributes,
    },
  } as const;
};

const assignToAvailableWorker = async (
  targetSid: string,
  newTask: TaskInstance,
  retry: number = 0,
): Promise<AssignmentResult> => {
  const reservations = await newTask.reservations().list();
  const reservation = reservations.find(r => r.workerSid === targetSid);

  if (!reservation) {
    if (retry < 8) {
      await wait(200);
      return assignToAvailableWorker(targetSid, newTask, retry + 1);
    }

    console.error(
      `No reservation found for task ${newTask.sid} and worker ${targetSid} after ${retry} retries`,
    );
    return cleanUpTask(newTask, 'Error: reservation for task not created.');
  }

  const accepted = await reservation.update({ reservationStatus: 'accepted' });

  if (accepted.reservationStatus !== 'accepted') {
    console.error(
      `Reservation ${reservation.sid} for task ${newTask.sid} and worker ${targetSid} could not be accepted, status: ${accepted.reservationStatus}`,
    );
    return cleanUpTask(newTask, 'Error: reservation for task not accepted.');
  }

  if (retry)
    console.warn(
      `Needed ${retry} retries to get reservation for task ${newTask.sid} and worker ${targetSid}`,
    );
  console.info(`Task ${newTask.sid} successfully assigned to worker ${targetSid}`);

  return { type: 'success', newTask } as const;
};

const assignToOfflineWorker = async (
  accountSid: AccountSID,
  targetSid: string,
  targetWorker: WorkerInstance,
  newTask: TaskInstance,
) => {
  const previousActivity = targetWorker.activitySid;
  const previousAttributes = JSON.parse(targetWorker.attributes);

  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  const availableActivity = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .activities.list({ available: 'true' });

  if (availableActivity.length > 1) {
    console.warn(
      `There are ${availableActivity.length} available worker activities for workspace ${workspaceSid}, but there should only be one.`,
    );
  }

  console.info(
    `Setting offline worker ${targetSid} to available activity ${availableActivity[0].sid} to accept task ${newTask.sid}`,
  );
  await targetWorker.update({
    activitySid: availableActivity[0].sid,
    attributes: JSON.stringify({ ...previousAttributes, waitingOfflineContact: true }), // waitingOfflineContact is used to avoid other tasks to be assigned during this window of time (workflow rules)
  });

  const result = await assignToAvailableWorker(targetSid, newTask);

  console.info(
    `Restoring worker ${targetSid} to previous activity ${previousActivity} after offline contact assignment`,
  );
  await targetWorker.update({
    activitySid: previousActivity,
    attributes: JSON.stringify(previousAttributes),
    rejectPendingReservations: true,
  });

  return result;
};

const assignOfflineContact = async (
  accountSid: AccountSID,
  body: Required<Body>,
): Promise<AssignmentResult> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  const chatTransferWorkflowSid = await getConversationsTransferWorkflow(accountSid);
  const { targetSid, taskAttributes } = body;

  const targetWorker = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .workers(targetSid)
    .fetch();

  const targetWorkerAttributes = JSON.parse(targetWorker.attributes);

  if (targetWorkerAttributes.helpline === undefined) {
    console.error(
      `Worker ${targetSid} does not have helpline attribute set in workspace ${workspaceSid}`,
    );
    return {
      type: 'error',
      payload: {
        status: 500,
        message:
          'Error: the worker does not have helpline attribute set, check the worker configuration.',
        taskRemoved: false,
      },
    };
  }

  if (targetWorkerAttributes.waitingOfflineContact) {
    console.error(`Worker ${targetSid} is already waiting for an offline contact`);
    return {
      type: 'error',
      payload: {
        status: 500,
        message: 'Error: the worker is already waiting for an offline contact.',
        taskRemoved: false,
      },
    };
  }

  const queueRequiredTaskAttributes = {
    helpline: targetWorkerAttributes.helpline,
    channelType: 'default',
    isContactlessTask: true,
    isInMyBehalf: true,
  };

  // create New task
  const newTask = await client.taskrouter.v1.workspaces(workspaceSid).tasks.create({
    workflowSid: chatTransferWorkflowSid,
    taskChannel: 'default',
    attributes: JSON.stringify(queueRequiredTaskAttributes),
    priority: 100,
    timeout: 120, // 2 minutes should be more than enough.
  });
  console.info(
    `Created offline contact task ${newTask.sid} for worker ${targetSid} in workspace ${workspaceSid}`,
  );

  const newTaskAttributes = JSON.parse(newTask.attributes);
  const parsedFinalAttributes = JSON.parse(taskAttributes);
  const routingAttributes = {
    targetSid,
    transferTargetType: 'worker',
    helpline: targetWorkerAttributes.helpline,
    channelType: 'default',
    isContactlessTask: true,
    isInMyBehalf: true,
  };

  const mergedAttributes = {
    ...newTaskAttributes,
    ...parsedFinalAttributes,
    ...routingAttributes,
    customers: {
      ...parsedFinalAttributes.customers,
      external_id: newTask.sid,
    },
  };

  const updatedTask = await newTask.update({
    attributes: JSON.stringify(mergedAttributes),
  });

  if (targetWorker.available) {
    // assign the task and accept it
    return assignToAvailableWorker(targetSid, updatedTask);
  }
  // Set the worker available, assign the task, accept it and set worker to previous state
  return assignToOfflineWorker(accountSid, targetSid, targetWorker, updatedTask);
};

export const assignOfflineContactInitHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { targetSid, taskAttributes } = event as Body;

  if (targetSid === undefined) {
    return newMissingParameterResult('targetSid');
  }
  if (taskAttributes === undefined) {
    return newMissingParameterResult('taskAttributes');
  }

  console.info(
    `assignOfflineContactInit: assigning offline contact to worker ${targetSid} for account ${accountSid}`,
  );

  const assignmentResult = await assignOfflineContact(accountSid, {
    targetSid,
    taskAttributes,
  });

  if (assignmentResult.type === 'error') {
    const { payload } = assignmentResult;
    return newErr({
      message: payload.message,
      error: { statusCode: payload.status },
    });
  }

  return newOk(assignmentResult.newTask);
};
