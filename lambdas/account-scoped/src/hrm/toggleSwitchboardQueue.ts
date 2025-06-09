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

import { AccountScopedHandler, HttpError, HttpRequest } from '../httpTypes';
import { newErr, newOk, Result } from '../Result';
import { getSyncServiceSid, getTwilioClient, getTwilioWorkspaceSid } from '../configuration/twilioConfiguration';
import { Twilio } from 'twilio';
import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import {
  SWITCHBOARD_QUEUE_NAME,
  SwitchboardSyncState,
  SWITCHBOARD_DOCUMENT_NAME,
  DEFAULT_SWITCHBOARD_STATE,
} from '@tech-matters/hrm-types';
import { AccountSID } from '../twilioTypes';

export type OperationType = 'enable' | 'disable';

export type SwitchboardRequest = {
  originalQueueSid: string;
  operation: OperationType;
  supervisorWorkerSid: string;
  Token: string;
};

export type TokenResponse = { identity: string; roles?: string[]; worker_sid?: string };

/**
 * Fetches required Twilio resources for switchboard operations
 */
async function fetchSwitchboardResources(client: Twilio, accountSid: AccountSID, originalQueueSid?: string) {
  // Get Sync Service
  const syncServiceSid = await getSyncServiceSid(accountSid);
  if (!syncServiceSid) {
    throw new Error('Sync service not configured');
  }

  // Get TaskRouter workspace
  const workspaceSid = await getTwilioWorkspaceSid(accountSid);
  if (!workspaceSid) {
    throw new Error('TaskRouter workspace not found');
  }

  const taskRouterClient = client.taskrouter.v1.workspaces(workspaceSid);

  const queues = await taskRouterClient.taskQueues.list();

  const switchboardQueue = queues.find(
    (queue: any) => queue.friendlyName === SWITCHBOARD_QUEUE_NAME,
  );
  if (!switchboardQueue) {
    throw new Error('Switchboard Queue not found');
  }

  const originalQueue = queues.find((queue: any) => queue.sid === originalQueueSid);
  if (!originalQueue) {
    throw new Error('Original Queue not found');
  }

  // Find Master Workflow
  const workflows = await taskRouterClient.workflows.list();
  const masterWorkflow = workflows.find(
    (workflow: any) => workflow.friendlyName === 'Master Workflow',
  );
  if (!masterWorkflow) {
    throw new Error('Master Workflow not found');
  }

  return {
    syncServiceSid,
    workspaceSid,
    taskRouterClient,
    switchboardQueue,
    originalQueue,
    masterWorkflow,
  };
}

/**
 * Get or create the switchboard document in Twilio Sync
 */
async function getSwitchboardStateDocument(
  client: Twilio,
  syncServiceSid: string,
): Promise<any> {
  try {
    return await client.sync.v1
      .services(syncServiceSid)
      .documents(SWITCHBOARD_DOCUMENT_NAME)
      .fetch();
  } catch (error: any) {
    // If document doesn't exist, create it
    if (error.status === 404) {
      return client.sync.v1.services(syncServiceSid).documents.create({
        uniqueName: SWITCHBOARD_DOCUMENT_NAME,
        data: DEFAULT_SWITCHBOARD_STATE,
        ttl: 48 * 60 * 60, // 48 hours
      });
    }
    throw error;
  }
}

/**
 * Update switchboarding state
 */
async function updateSwitchboardState(
  client: Twilio,
  syncServiceSid: string,
  state: Partial<SwitchboardSyncState>,
): Promise<SwitchboardSyncState> {
  console.log(
    `Updating switchboard state: ${JSON.stringify({ syncServiceSid, stateUpdate: state }, null, 2)}`,
  );

  try {
    const document = await getSwitchboardStateDocument(client, syncServiceSid);
    const currentState = document.data;
    const updatedState = { ...currentState, ...state };

    await client.sync.v1
      .services(syncServiceSid)
      .documents(SWITCHBOARD_DOCUMENT_NAME)
      .update({
        data: updatedState,
      });

    return updatedState;
  } catch (error: any) {
    console.error(`Error in updateSwitchboardState:`, {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Adds a filter to the workflow configuration to redirect calls from originalQueue to switchboardQueue to the top of the master workflow
 */
function addSwitchboardingFilter(
  config: Twilio,
  originalQueueSid: string,
  switchboardQueueSid: string,
): any {
  const updatedConfig = JSON.parse(JSON.stringify(config));

  const filterName = `Switchboard Workflow - ${originalQueueSid}`;

  let filterExpression;
  let targetExpression;

  const originalQueueFilters = updatedConfig.task_routing.filters.filter((filter: any) =>
    filter.targets?.some(
      (target: any) =>
        target.queue === originalQueueSid
    ),
  );


  if (originalQueueFilters.length > 0) {
    if (originalQueueFilters.expression) {
      filterExpression = originalQueueFilters.expression;
    }

    const originalQueueTarget = originalQueueFilters.targets?.find(
      (target: any) =>
        target.queue === originalQueueSid,
    );
    if (originalQueueTarget?.expression) {
      targetExpression = originalQueueTarget.expression;
    }
  }

  const switchboardingFilter = {
    filter_friendly_name: filterName,
    expression: filterExpression,
    targets: [
      {
        queue: switchboardQueueSid,
        priority: 100,
        expression: targetExpression,
        task_attributes: {
          originalQueueSid,
          needsSwitchboarding: true,
          taskQueueSid: switchboardQueueSid,
          switchboardingActive: true,
        },
      },
    ],
  };

  updatedConfig.task_routing.filters.unshift(switchboardingFilter);

  return updatedConfig;
}

/**
 * Removes the switchboarding filter from the workflow configuration
 */
function removeSwitchboardingFilter(config: any): any {
  const updatedConfig = JSON.parse(JSON.stringify(config));

  updatedConfig.task_routing.filters = updatedConfig.task_routing.filters.filter(
    (filter: any) => !filter.filter_friendly_name.startsWith('Switchboard Workflow'),
  );

  return updatedConfig;
}

/**
 * Finds all tasks in a queue that are in a specific status
 */
async function findTasksInQueue(
  client: Twilio,
  workspaceSid: string,
  queueSid: string,
  assignmentStatus: string = 'pending',
): Promise<TaskInstance[]> {
  try {
    const tasks = await client.taskrouter.v1.workspaces(workspaceSid).tasks.list({
      assignmentStatus: [assignmentStatus],
      taskQueueSid: queueSid,
    });

    return tasks;
  } catch (err) {
    console.error(`Error finding ${assignmentStatus} tasks in queue:`, err);
    throw err;
  }
}

/**
 * Moves a task from one queue to another
 */
async function moveTaskToQueue(
  client: Twilio,
  workspaceSid: string,
  taskSid: string,
  targetQueueSid: string,
  additionalAttributes: Record<string, any> = {},
): Promise<void> {
  try {
    const task = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .fetch();
    const currentAttributes = JSON.parse(task.attributes);
    const switchboardingAttributes = {
      ...currentAttributes,
      switchboardingHandled: true,
      switchboardingTimestamp: new Date().toISOString(),
      targetQueueSid,
      ...additionalAttributes,
    };

    await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .update({
        attributes: JSON.stringify(switchboardingAttributes),
      });

    const workflows = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workflows.list();
    const masterWorkflow = workflows.find(
      workflow => workflow.friendlyName === 'Master Workflow',
    );

    if (!masterWorkflow) {
      throw new Error('Master Workflow not found');
    }

    // Create a new task in the target queue that copies the current task's data
    await client.taskrouter.v1.workspaces(workspaceSid).tasks.create({
      attributes: JSON.stringify({
        ...switchboardingAttributes,
        transferTargetTaskSid: taskSid,
      }),
      workflowSid: masterWorkflow.sid,
      taskChannel: task.taskChannelUniqueName,
      priority: task.priority,
    });

    // Complete the original task as it's been replaced
    await client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).update({
      assignmentStatus: 'completed',
      reason: 'Moved to another queue via Switchboard',
    });
  } catch (err) {
    console.error(`Error moving task ${taskSid} to queue ${targetQueueSid}:`, err);
    throw err;
  }
}

/**
 * Moves waiting tasks from source queue to target queue
 */
async function moveWaitingTasks(
  client: Twilio,
  workspaceSid: string,
  sourceQueueSid: string,
  targetQueueSid: string,
  additionalAttributes: Record<string, any> = {},
): Promise<number> {
  try {
    const tasks = await findTasksInQueue(client, workspaceSid, sourceQueueSid);

    const movePromises = tasks.map(async (task: any) => {
      await moveTaskToQueue(
        client,
        workspaceSid,
        task.sid,
        targetQueueSid,
        additionalAttributes,
      );
    });

    await Promise.all(movePromises);
    return tasks.length;
  } catch (err) {
    console.error('Error moving waiting tasks:', err);
    throw err;
  }
}

/**
 * Handles the 'enable' operation - turns on switchboarding for a queue
 */
async function handleEnableOperation(
  client: Twilio,
  syncServiceSid: string,
  taskRouterClient: any,
  originalQueue: any,
  switchboardQueue: any,
  masterWorkflow: any,
  supervisorWorkerSid: string,
): Promise<SwitchboardSyncState> {
  const configResp = await taskRouterClient.workflows(masterWorkflow.sid).fetch();
  const currentConfig = JSON.parse(configResp.configuration);

  const updatedConfig = addSwitchboardingFilter(
    currentConfig,
    originalQueue.sid,
    switchboardQueue.sid,
  );

  await taskRouterClient.workflows(masterWorkflow.sid).update({
    configuration: JSON.stringify(updatedConfig),
  });

  const updatedState = await updateSwitchboardState(client, syncServiceSid, {
    isSwitchboardingActive: true,
    queueSid: originalQueue.sid,
    queueName: originalQueue.friendlyName,
    startTime: new Date().toISOString(),
    supervisorWorkerSid,
  });

  return updatedState;
}

/**
 * Handles the 'disable' operation - turns off switchboarding
 */
async function handleDisableOperation(
  client: Twilio,
  syncServiceSid: string,
  workspaceSid: string,
  taskRouterClient: any,
  switchboardQueue: any,
  masterWorkflow: any,
): Promise<SwitchboardSyncState> {
  const currentState = await getSwitchboardStateDocument(client, syncServiceSid);

  if (!currentState.isSwitchboardingActive) {
    return currentState;
  }

  const configResp = await taskRouterClient.workflows(masterWorkflow.sid).fetch();
  const currentConfig = JSON.parse(configResp.configuration);

  const updatedConfig = removeSwitchboardingFilter(currentConfig);

  await taskRouterClient.workflows(masterWorkflow.sid).update({
    configuration: JSON.stringify(updatedConfig),
  });

  // TODO: Move any waiting tasks from the switchboard queue back to the original queue
  if (currentState.queueSid) {
    try {
      await moveWaitingTasks(
        client,
        workspaceSid,
        switchboardQueue.sid,
        currentState.queueSid,
        { switchboardingActive: false },
      );
    } catch (err) {
      console.error('Error moving tasks back to the original queue:', err);
    }
  }

  const updatedState = await updateSwitchboardState(client, syncServiceSid, {
    isSwitchboardingActive: false,
    queueSid: undefined,
    queueName: undefined,
    startTime: undefined,
    supervisorWorkerSid: undefined,
  });

  return updatedState;
}

export const handleToggleSwitchboardQueue: AccountScopedHandler = async (
  request: HttpRequest,
  accountSid,
): Promise<Result<HttpError, any>> => {
  try {
    const { originalQueueSid, operation, supervisorWorkerSid } =
      request.body as SwitchboardRequest;

    const client: Twilio = await getTwilioClient(accountSid);

    try {
      const {
        syncService,
        workspace,
        taskRouterClient,
        switchboardQueue,
        originalQueue,
        masterWorkflow,
      } = await fetchSwitchboardResources(client, accountSid, originalQueueSid);

      let state;
      if (operation === 'enable') {
        state = await handleEnableOperation(
          client,
          syncService.sid,
          taskRouterClient,
          originalQueue,
          switchboardQueue,
          masterWorkflow,
          supervisorWorkerSid,
        );
        return newOk(state);
      }

      if (operation === 'disable') {
        state = await handleDisableOperation(
          client,
          syncService.sid,
          workspace.sid,
          taskRouterClient,
          switchboardQueue,
          masterWorkflow,
        );
        return newOk(state);
      }

      // Return error for unsupported operations
      return newErr({
        message: `Unsupported operation: ${operation}`,
        error: { statusCode: 400 },
      });
    } catch (error: any) {
      return newErr({
        message: error.message,
        error: { statusCode: 400, cause: error },
      });
    }
  } catch (err: any) {
    console.error('Error in switchboarding handler:', err);
    return newErr({
      message: err.message || 'Internal server error',
      error: { statusCode: 500, cause: err },
    });
  }
};
