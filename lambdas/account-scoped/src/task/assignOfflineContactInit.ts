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
  getMasterWorkflowSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';
import { newErr, newOk } from '@tech-matters/result-type';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import {
  acceptSpecificTask,
  isWaitingForTask,
  withAvailableWorkerForTask,
} from './assignSpecificTask';

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

const cleanUpTask = async (task: TaskInstance, message: string) => {
  const { attributes } = task;
  console.debug(`Cleaning up task ${task.sid}: ${message}`);
  const taskRemoved = await task.remove();
  console.debug(`Task ${task.sid} removed: ${taskRemoved}`);

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
): Promise<AssignmentResult> => {
  try {
    await acceptSpecificTask(targetSid, newTask);
    return { type: 'success', newTask };
  } catch (error) {
    return cleanUpTask(newTask, (error as Error).message);
  }
};

const assignOfflineContact = async (
  accountSid: AccountSID,
  body: Required<Body>,
): Promise<AssignmentResult> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  const chatTransferWorkflowSid = await getMasterWorkflowSid(accountSid);
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

  if (isWaitingForTask(targetWorkerAttributes)) {
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
    waitingForSpecificTaskSid: newTask.sid,
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
  let accepted = false;
  try {
    return await withAvailableWorkerForTask(
      accountSid,
      targetWorker,
      { taskSid: updatedTask.sid, reason: 'offline-contact' },
      async () => {
        await acceptSpecificTask(targetSid, updatedTask);
        accepted = true;
        return { type: 'success', newTask: updatedTask } as const;
      },
    );
  } catch (error) {
    if (accepted) throw error;
    return cleanUpTask(updatedTask, (error as Error).message);
  }
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
