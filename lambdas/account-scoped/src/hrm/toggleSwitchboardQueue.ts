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
import { newErr, newOk, Result, isErr } from '../Result';
import twilio from 'twilio';
import { getAccountAuthToken } from '../configuration/twilioConfiguration';

export type OperationType = 'enable' | 'disable' | 'status';

export type SwitchboardRequest = {
  originalQueueSid?: string;
  operation: OperationType;
  Token: string;
};

type SwitchboardingState = {
  isSwitchboardingActive: boolean;
  queueSid?: string;
  queueName?: string;
  supervisorWorkerSid?: string;
  startTime?: string;
};

// Token response structure expected from the request body
export type TokenResponse = { identity: string; roles?: string[]; worker_sid?: string };

const SWITCHBOARD_DOCUMENT_NAME = 'switchboard-state';
const DEFAULT_SWITCHBOARD_STATE: SwitchboardingState = {
  isSwitchboardingActive: false,
  queueSid: undefined,
  queueName: undefined,
  startTime: undefined,
  supervisorWorkerSid: undefined,
};

/**
 * Check if the user has supervisor permissions
 */
const isSupervisor = (tokenResult: TokenResponse): boolean =>
  Array.isArray(tokenResult.roles) && tokenResult.roles.includes('supervisor');

/**
 * Get or create the switchboard document in Twilio Sync
 */
async function getSwitchboardStateDocument(
  client: any,
  syncServiceSid: string,
): Promise<any> {
  try {
    return client.sync
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
  client: any,
  syncServiceSid: string,
): Promise<SwitchboardingState> {
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
  client: any,
  syncServiceSid: string,
  state: Partial<SwitchboardingState>,
): Promise<SwitchboardingState> {
  const document = await getSwitchboardStateDocument(client, syncServiceSid);
  const currentState = document.data;
  const updatedState = { ...currentState, ...state };

  await client.sync.services(syncServiceSid).documents(SWITCHBOARD_DOCUMENT_NAME).update({
    data: updatedState,
  });

  return updatedState;
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
  client: any,
  workspaceSid: string,
  queueSid: string,
  assignmentStatus: string = 'pending',
): Promise<any[]> {
  try {
    const tasks = await client.taskrouter.workspaces(workspaceSid).tasks.list({
      assignmentStatus,
      taskQueueSid: queueSid,
    });

    return tasks;
  } catch (err) {
    console.error(`>>> Error finding ${assignmentStatus} tasks in queue:`, err);
    throw err;
  }
}

/**
 * Moves a task from one queue to another
 */
async function moveTaskToQueue(
  client: any,
  workspaceSid: string,
  taskSid: string,
  targetQueueSid: string,
  additionalAttributes: Record<string, any> = {},
): Promise<void> {
  try {
    const task = await client.taskrouter.workspaces(workspaceSid).tasks(taskSid).fetch();
    const currentAttributes = JSON.parse(task.attributes);
    const switchboardingAttributes = {
      ...currentAttributes,
      switchboardingHandled: true,
      switchboardingTimestamp: new Date().toISOString(),
      ...additionalAttributes,
    };

    await client.taskrouter
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .update({
      attributes: JSON.stringify(switchboardingAttributes),
      taskQueueSid: targetQueueSid,
    });
  } catch (err) {
    console.error(`>>> Error moving task ${taskSid} to queue ${targetQueueSid}:`, err);
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
    console.error('>>> Error moving waiting tasks:', err);
    throw err;
  }
}

/**
 * Handles the 'status' operation - returns current switchboarding state
 */
async function handleStatusOperation(
  client: any,
  syncServiceSid: string,
): Promise<SwitchboardingState> {
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
  workspaceSid: string,
  taskRouterClient: any,
  originalQueue: any,
  switchboardQueue: any,
  masterWorkflow: any,
  tokenResult: TokenResponse,
): Promise<SwitchboardingState> {
  console.log('Handling enable operation');
  
  // Get current workflow configuration
  const configResp = await taskRouterClient.workflows(masterWorkflow.sid).fetch();
  const currentConfig = JSON.parse(configResp.configuration);
  
  // Add the switchboarding filter to route tasks to the switchboard queue
  const updatedConfig = addSwitchboardingFilter(
    currentConfig,
    originalQueue.sid,
    switchboardQueue.sid,
  );
  
  // Update the workflow with the new configuration
  await taskRouterClient.workflows(masterWorkflow.sid).update({
    configuration: JSON.stringify(updatedConfig),
  });
  
  // Update the switchboard state to reflect that switchboarding is active
  const state = await updateSwitchboardState(client, syncServiceSid, {
    isSwitchboardingActive: true,
    queueSid: originalQueue.sid,
    queueName: originalQueue.friendlyName,
    supervisorWorkerSid: tokenResult.worker_sid,
    startTime: new Date().toISOString(),
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
): Promise<SwitchboardingState> {
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
        { switchboardingActive: false }
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

/**
 * Validates the request payload for the switchboard toggle operation
 */
const validateSwitchboardRequest = (
  request: SwitchboardRequest,
): Result<HttpError, TokenResponse> => {
  const { Token: tokenData, operation } = request;
  
  if (!tokenData) {
    console.error('Token is missing in the request');
    return newErr({
      message: 'Token is required',
      error: { statusCode: 400, cause: new Error('Token is required') },
    });
  }
  
  if (!operation || !['enable', 'disable', 'status'].includes(operation)) {
    console.error(`Invalid operation: ${operation}`);
    return newErr({
      message: `Invalid operation: ${operation}`,
      error: { statusCode: 400, cause: new Error(`Invalid operation: ${operation}`) },
    });
  }
  
  try {
    const tokenResult = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
    
    if (!tokenResult || !tokenResult.roles) {
      return newErr({
        message: 'Invalid token structure',
        error: { statusCode: 401, cause: new Error('Invalid token structure') },
      });
    }

    if (!isSupervisor(tokenResult)) {
      console.error('Unauthorized access attempt by non-supervisor');
      return newErr({
        message: 'Unauthorized: endpoint not open to non supervisors',
        error: {
          statusCode: 403,
          cause: new Error('Unauthorized: endpoint not open to non supervisors'),
        },
      });
    }

    return newOk(tokenResult);
  } catch (tokenError: any) {
    console.error('Token validation error:', tokenError);
    return newErr({
      message: 'Invalid token format',
      error: { statusCode: 400, cause: tokenError },
    });
  }
};

export const handleToggleSwitchboardQueue: AccountScopedHandler = async (
  request: HttpRequest,
  accountSid,
): Promise<Result<HttpError, any>> => {
  try {
    const { originalQueueSid, operation } = request.body as SwitchboardRequest;

    const tokenResult = validateSwitchboardRequest(request.body as SwitchboardRequest);
    if (isErr(tokenResult)) {
      return tokenResult;
    }

    const validatedToken = tokenResult.unwrap();

    const authToken = await getAccountAuthToken(accountSid);
    const client = twilio(accountSid, authToken);

    const syncServices = await client.sync.services.list();
    const syncService = syncServices[0]; // Using the first sync service or implement proper lookup
    if (!syncService) {
      return newErr({
        message: 'Sync service not configured',
        error: { statusCode: 500 },
      });
    }

    // Get TaskRouter workspace
    const workspaces = await client.taskrouter.workspaces.list();
    const workspace = workspaces[0]; // Using the first workspace or implement proper lookup
    if (!workspace) {
      return newErr({
        message: 'TaskRouter workspace not found',
        error: { statusCode: 500 },
      });
    }

    const taskRouterClient = client.taskrouter.workspaces(workspace.sid);

    // Status operation doesn't require a queue SID
    if (operation === 'status') {
      const state = await handleStatusOperation(client, syncService.sid);
      return newOk(state);
    }

    // For enable/disable operations, queue SID is required
    if (!originalQueueSid) {
      return newErr({
        message: 'Original Queue SID is required for enable/disable operations',
        error: {
          statusCode: 400,
          cause: new Error('Original Queue SID is required for enable/disable operations'),
        },
      });
    }

    // Get queues and find switchboard queue
    const queues = await taskRouterClient.taskQueues.list();
    const switchboardQueue = queues.find((queue: any) => queue.friendlyName === 'Switchboard Queue');

    if (!switchboardQueue) {
      return newErr({
        message: 'Switchboard Queue not found',
        error: { statusCode: 400, cause: new Error('Switchboard Queue not found') },
      });
    }

    // Find original queue
    const originalQueue = queues.find((queue: any) => queue.sid === originalQueueSid);
    if (!originalQueue) {
      return newErr({
        message: 'Original Queue not found',
        error: { statusCode: 400, cause: new Error('Original Queue not found') },
      });
    }

    // Find Master Workflow
    const workflows = await taskRouterClient.workflows.list();
    const masterWorkflow = workflows.find((workflow: any) => workflow.friendlyName === 'Master Workflow');

    if (!masterWorkflow) {
      return newErr({
        message: 'Master Workflow not found',
        error: { statusCode: 400, cause: new Error('Master Workflow not found') },
      });
    }

    if (operation === 'enable') {
      const state = await handleEnableOperation(
        client,
        syncService.sid,
        workspace.sid,
        taskRouterClient,
        originalQueue,
        switchboardQueue,
        masterWorkflow,
        validatedToken,
      );
      return newOk(state);
    }

    if (operation === 'disable') {
      const state = await handleDisableOperation(
        client,
        syncService.sid,
        workspace.sid,
        taskRouterClient,
        switchboardQueue,
        masterWorkflow,
      );
      return newOk(state);
    }

    return newErr({
      message: `Unknown operation: ${operation}`,
      error: { statusCode: 400, cause: new Error(`Unknown operation: ${operation}`) },
    });
  } catch (err: any) {
    console.error('Error in switchboarding handler:', err);
    return newErr({
      message: err.message || 'Internal server error',
      error: { statusCode: 500, cause: err },
    });
  }
}
