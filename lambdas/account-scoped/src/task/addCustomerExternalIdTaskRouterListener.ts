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

// eslint-disable-next-line prettier/prettier
import {registerTaskRouterEventHandler, TaskRouterEventHandler} from '../taskrouter/taskrouterEventHandler';
import { AccountSID, TaskSID, WorkspaceSID } from '../twilioTypes';
import { Twilio } from 'twilio';
import { TASK_CREATED, TASK_UPDATED } from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveFeatureFlags } from '../configuration/aseloConfiguration';
import { getWorkspaceSid } from '../configuration/twilioConfiguration';

type EnvVars = {
  TWILIO_WORKSPACE_SID: WorkspaceSID;
};

const logError = (
  taskSid: TaskSID,
  workspaceSid: EnvVars['TWILIO_WORKSPACE_SID'],
  step: 'fetch' | 'update',
  errorInstance: Error,
): void => {
  const errorMessage = `Error at addCustomerExternalId: task with sid ${taskSid} does not exists in workspace ${workspaceSid} when trying to ${step} it.`;
  console.error(errorMessage, errorInstance);
};

const isTaskRequiringExternalId = async (
  client: Twilio,
  taskSid: TaskSID,
  {
    isContactlessTask,
    customers,
  }: {
    isContactlessTask?: boolean;
    customers?: { external_id?: string };
  },
): Promise<boolean> => {
  if (isContactlessTask || customers?.external_id) {
    console.debug(
      `Task ${taskSid} is not requiring external_id, customers.external_id: ${customers?.external_id}, isContactlessTask: ${isContactlessTask}`,
    );
    return false;
  }

  const { lambda_task_created_handler: lambdaTaskCreatedHandler } =
    await retrieveFeatureFlags(client);
  if (!lambdaTaskCreatedHandler) {
    console.debug(
      `Feature flag lambda_task_created_handler is enabled. Skipping addCustomerExternalId for ${taskSid}, it will be handled in Twilio Serverless.`,
    );
    return false;
  }
  return true;
};

const addCustomerExternalId: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  const { TaskSid, TaskAttributes } = event;
  const taskSid = TaskSid as TaskSID;
  const eventTaskAttributes = JSON.parse(TaskAttributes);
  if (!(await isTaskRequiringExternalId(client, taskSid, eventTaskAttributes))) {
    return;
  }

  const workspaceSid: WorkspaceSID = await getWorkspaceSid(accountSid);
  console.info('Adding external_id to task', taskSid);

  if (!taskSid) throw new Error('TaskSid missing in event object');

  let task;

  try {
    task = await client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).fetch();
  } catch (err) {
    logError(taskSid, workspaceSid, 'fetch', err as Error);
    return;
  }

  const taskAttributes = JSON.parse(task.attributes);

  const newAttributes = {
    ...taskAttributes,
    customers: {
      ...taskAttributes.customers,
      external_id: taskSid,
    },
  };

  try {
    await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .update({ attributes: JSON.stringify(newAttributes) });
  } catch (err) {
    logError(taskSid, workspaceSid, 'update', err as Error);
  }
};

registerTaskRouterEventHandler([TASK_CREATED, TASK_UPDATED], addCustomerExternalId);
