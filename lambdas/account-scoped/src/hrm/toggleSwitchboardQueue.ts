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
import { getTwilioClient } from '../configuration/twilioConfiguration';
import { Twilio } from 'twilio';
import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';

export type OperationType = 'enable' | 'disable' | 'status';

export type SwitchboardRequest = {
  originalQueueSid: string;
  operation: OperationType;
  supervisorWorkerSid: string;
  Token: string;
};

type SwitchboardingSyncState = {
  isSwitchboardingActive: boolean;
  queueSid?: string;
  queueName?: string;
  supervisorWorkerSid?: string;
  startTime?: string;
};

export type TokenResponse = { identity: string; roles?: string[]; worker_sid?: string };

/**
 * Helper function to create error responses
 */
function createError(
  message: string,
  statusCode: number,
  cause?: Error,
): Result<HttpError, any> {
  return newErr({
    message,
    error: { statusCode, cause: cause || new Error(message) },
  });
}

/**
 * Fetches required Twilio resources for switchboard operations
 */
async function fetchSwitchboardResources(client: any, originalQueueSid?: string) {
  // Get Sync Service
  const syncServices = await client.sync.v1.services.list();
  const syncService = syncServices[0];
  if (!syncService) {
    throw new Error('Sync service not configured');
  }

  // Get TaskRouter workspace
  const workspaces = await client.taskrouter.workspaces.list();
  const workspace = workspaces[0];
  if (!workspace) {
    throw new Error('TaskRouter workspace not found');
  }

  const taskRouterClient = client.taskrouter.workspaces(workspace.sid);

  // For status operations, we don't need queues or workflows
  if (!originalQueueSid) {
    return { syncService, workspace, taskRouterClient };
  }

  // Get queues
  const queues = await taskRouterClient.taskQueues.list();

  // Find switchboard queue
  const switchboardQueue = queues.find(
    (queue: any) => queue.friendlyName === 'Switchboard Queue',
  );
  if (!switchboardQueue) {
    throw new Error('Switchboard Queue not found');
  }

  // Find original queue
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
    syncService,
    workspace,
    taskRouterClient,
    switchboardQueue,
    originalQueue,
    masterWorkflow,
  };
}

const SWITCHBOARD_DOCUMENT_NAME = 'switchboard-state';
const DEFAULT_SWITCHBOARD_STATE: SwitchboardingSyncState = {
  isSwitchboardingActive: false,
  queueSid: undefined,
  queueName: undefined,
  startTime: undefined,
  supervisorWorkerSid: undefined,
};

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
      return client.sync.services(syncServiceSid).documents.create({
        uniqueName: SWITCHBOARD_DOCUMENT_NAME,
        data: DEFAULT_SWITCHBOARD_STATE,
        ttl: 48 * 60 * 60, // 48 hours
      });
    }
    throw error;
  }
}

/**
 * Get current switchboarding state
 */
async function getSwitchboardState(
  client: Twilio,
  syncServiceSid: string,
): Promise<SwitchboardingSyncState> {
  const document = await getSwitchboardStateDocument(client, syncServiceSid);

  const state = document.data || {};

  return {
    isSwitchboardingActive:
      state.isSwitchboardingActive === undefined ? false : state.isSwitchboardingActive,
    queueSid: state.queueSid,
    queueName: state.queueName,
    startTime: state.startTime,
    supervisorWorkerSid: state.supervisorWorkerSid,
  };
}

/**
 * Update switchboarding state
 */
async function updateSwitchboardState(
  client: Twilio,
  syncServiceSid: string,
  state: Partial<SwitchboardingSyncState>,
): Promise<SwitchboardingSyncState> {
  console.log(`Updating switchboard state. SyncServiceSid: ${syncServiceSid}`);
  console.log(`Input state update:`, JSON.stringify(state, null, 2));

  try {
    console.log(`Attempting to get switchboard document...`);
    const document = await getSwitchboardStateDocument(client, syncServiceSid);

    console.log(`Successfully retrieved document:`, {
      uniqueName: document.uniqueName,
      sid: document.sid,
      documentData: JSON.stringify(document.data, null, 2),
    });

    const currentState = document.data;
    const updatedState = { ...currentState, ...state };
    console.log(`Merged state to update:`, JSON.stringify(updatedState, null, 2));

    console.log(
      `Attempting to update document ${SWITCHBOARD_DOCUMENT_NAME} in service ${syncServiceSid}...`,
    );
    await client.sync
      .services(syncServiceSid)
      .documents(SWITCHBOARD_DOCUMENT_NAME)
      .update({
        data: updatedState,
      });
    console.log(`Successfully updated switchboard document.`);

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
 * Adds a filter to the workflow configuration to redirect calls from originalQueue to switchboardQueue
 * except for calls that have been transferred (to avoid bouncing)
 */
function addSwitchboardingFilter(
  config: any,
  originalQueueSid: string,
  switchboardQueueSid: string,
): any {
  const updatedConfig = JSON.parse(JSON.stringify(config));

  const filterName = `Switchboard Workflow - ${originalQueueSid}`;
  console.log(`Adding switchboarding filter: ${filterName}`);

  const switchboardingFilter = {
    filter_friendly_name: filterName,
    expression:
      'task.transferMeta == null AND task.switchboardingHandled == null AND task.switchboardingTransferExempt == null',
    targets: [
      {
        queue: switchboardQueueSid,
        expression: '1==1',
        priority: 100,
        target_expression: `DEFAULT_TARGET_QUEUE_SID == '${originalQueueSid}'`,
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

  // Filter out any switchboarding filters
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
    // First, fetch the current task data
    const task = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .fetch();

    // Update the attributes to include our switchboarding metadata
    const currentAttributes = JSON.parse(task.attributes);
    const switchboardingAttributes = {
      ...currentAttributes,
      switchboardingHandled: true,
      switchboardingTimestamp: new Date().toISOString(),
      targetQueueSid, // Store target queue in attributes for reference
      ...additionalAttributes,
    };

    // We need to create a new task in the target queue with the updated attributes
    // First, update the task with our switchboarding metadata
    await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .update({
        attributes: JSON.stringify(switchboardingAttributes),
      });

    // Then use a workflow redirect to move the task to the new queue
    // Get available workflows
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
        transferTargetTaskSid: taskSid, // Track relationship for reporting
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
  client: any,
  workspaceSid: string,
  sourceQueueSid: string,
  targetQueueSid: string,
  additionalAttributes: Record<string, any> = {},
): Promise<number> {
  try {
    // Find all pending tasks in the queue
    const tasks = await findTasksInQueue(client, workspaceSid, sourceQueueSid);
    console.log(`Found ${tasks.length} pending tasks to move`);

    // Move each task to the target queue
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
 * Handles the 'status' operation - returns current switchboarding state
 */
async function handleStatusOperation(
  client: any,
  syncServiceSid: string,
): Promise<SwitchboardingSyncState> {
  console.log('Handling status operation');
  const state = await getSwitchboardState(client, syncServiceSid);
  return state;
}

/**
 * Handles the 'enable' operation - turns on switchboarding for a queue
 */
async function handleEnableOperation(
  client: any,
  syncServiceSid: string,
  taskRouterClient: any,
  originalQueue: any,
  switchboardQueue: any,
  masterWorkflow: any,
  supervisorWorkerSid?: string,
): Promise<SwitchboardingSyncState> {
  console.log('Handling enable operation');

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

  // try {
  //   let document;
  //   try {
  //     document = await client.sync
  //       .services(syncServiceSid)
  //       .documents(SWITCHBOARD_DOCUMENT_NAME)
  //       .fetch();
  //   } catch (docError: any) {
  //     if (docError.status === 404) {
  //       document = await client.sync.services(syncServiceSid).documents.create({
  //         uniqueName: SWITCHBOARD_DOCUMENT_NAME,
  //         data: DEFAULT_SWITCHBOARD_STATE,
  //         ttl: 48 * 60 * 60,
  //       });
  //     } else {
  //       throw docError;
  //     }
  //   }
  // } catch (error: any) {
  //   console.error(`Failed to verify switchboard document:`, {
  //     message: error.message,
  //     status: error.status,
  //     code: error.code,
  //   });
  //   throw error;
  // }

  if (supervisorWorkerSid) {
    console.log(`Using provided supervisor worker SID: ${supervisorWorkerSid}`);
  } else {
    console.warn('No supervisor worker SID provided');
  }

  const state = await updateSwitchboardState(client, syncServiceSid, {
    isSwitchboardingActive: true,
    queueSid: originalQueue.sid,
    queueName: originalQueue.friendlyName,
    startTime: new Date().toISOString(),
    supervisorWorkerSid,
  });

  console.log(`Switchboarding enabled for queue ${originalQueue.friendlyName}`);
  return state;
}

/**
 * Handles the 'disable' operation - turns off switchboarding
 */
async function handleDisableOperation(
  client: any,
  syncServiceSid: string,
  workspaceSid: string,
  taskRouterClient: any,
  switchboardQueue: any,
  masterWorkflow: any,
): Promise<SwitchboardingSyncState> {
  console.log('Handling disable operation');

  // Get the current switchboarding state to know which queue to restore tasks to
  const currentState = await getSwitchboardState(client, syncServiceSid);

  if (!currentState.isSwitchboardingActive) {
    console.log('Switchboarding is not active, nothing to disable');
    return currentState;
  }

  // Get the workflow configuration
  const configResp = await taskRouterClient.workflows(masterWorkflow.sid).fetch();
  const currentConfig = JSON.parse(configResp.configuration);

  // Remove the switchboarding filter from the workflow
  const updatedConfig = removeSwitchboardingFilter(currentConfig);

  // Update the workflow
  await taskRouterClient.workflows(masterWorkflow.sid).update({
    configuration: JSON.stringify(updatedConfig),
  });

  // Move any waiting tasks from the switchboard queue back to the original queue
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
      // Continue with disabling even if task movement fails
    }
  }

  // Update the state to reflect that switchboarding is disabled
  const state = await updateSwitchboardState(client, syncServiceSid, {
    isSwitchboardingActive: false,
    queueSid: undefined,
    queueName: undefined,
    supervisorWorkerSid: undefined,
  });

  console.log('Switchboarding disabled');
  return state;
}

export const handleToggleSwitchboardQueue: AccountScopedHandler = async (
  request: HttpRequest,
  accountSid,
): Promise<Result<HttpError, any>> => {
  try {
    const { originalQueueSid, operation, supervisorWorkerSid } =
      request.body as SwitchboardRequest;

    const client: Twilio = await getTwilioClient(accountSid);

    // Status operation doesn't require a queue SID
    if (operation === 'status') {
      const { syncService } = await fetchSwitchboardResources(client);
      const state = await handleStatusOperation(client, syncService.sid);
      return newOk(state);
    }

    // For enable/disable operations, queue SID is required
    if (!originalQueueSid) {
      return createError(
        'Original Queue SID is required for enable/disable operations',
        400,
      );
    }

    try {
      const {
        syncService,
        workspace,
        taskRouterClient,
        switchboardQueue,
        originalQueue,
        masterWorkflow,
      } = await fetchSwitchboardResources(client, originalQueueSid);

      // Handle the requested operation
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

      return createError(`Unknown operation: ${operation}`, 400);
    } catch (resourceError: any) {
      return createError(resourceError.message, 400);
    }
  } catch (err: any) {
    console.error('Error in switchboarding handler:', err);
    return createError(err.message || 'Internal server error', 500, err);
  }
};
