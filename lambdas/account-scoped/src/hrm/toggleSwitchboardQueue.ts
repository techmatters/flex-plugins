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

export type OperationType = 'enable' | 'disable' | 'status';

export type SwitchboardRequest = {
  originalQueueSid?: string;
  operation: OperationType;
  Token: string;
  supervisorWorkerSid?: string;
};

type SwitchboardingState = {
  isSwitchboardingActive: boolean;
  queueSid?: string;
  queueName?: string;
  supervisorWorkerSid?: string;
  startTime?: string;
};

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
 * Get or create the switchboard document in Twilio Sync
 */
async function getSwitchboardStateDocument(
  client: any,
  syncServiceSid: string,
): Promise<any> {
  console.log(`Fetching switchboard state document. SyncServiceSid: ${syncServiceSid}`);
  try {
    console.log(`Attempting to fetch document: ${SWITCHBOARD_DOCUMENT_NAME}`);
    return client.sync
      .services(syncServiceSid)
      .documents(SWITCHBOARD_DOCUMENT_NAME)
      .fetch();
  } catch (error: any) {
    console.log(`Error fetching document: ${SWITCHBOARD_DOCUMENT_NAME}`, {
      status: error.status,
      message: error.message,
      code: error.code,
    });

    if (error.status === 404) {
      console.log(
        `Document not found, attempting to create: ${SWITCHBOARD_DOCUMENT_NAME}`,
      );
      try {
        const newDocument = await client.sync.services(syncServiceSid).documents.create({
          uniqueName: SWITCHBOARD_DOCUMENT_NAME,
          data: DEFAULT_SWITCHBOARD_STATE,
          ttl: 48 * 60 * 60, // 48 hours
        });
        console.log(`Successfully created document: ${SWITCHBOARD_DOCUMENT_NAME}`, {
          documentSid: newDocument.sid,
        });
        return newDocument;
      } catch (createError: any) {
        console.error(`Failed to create document: ${SWITCHBOARD_DOCUMENT_NAME}`, {
          status: createError.status,
          message: createError.message,
          code: createError.code,
        });
        throw createError;
      }
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
  taskRouterClient: any,
  originalQueue: any,
  switchboardQueue: any,
  masterWorkflow: any,
  supervisorWorkerSid?: string,
): Promise<SwitchboardingState> {
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
  console.log(
    `Preparing to update switchboard state for queue ${originalQueue.friendlyName}`,
  );

  try {
    console.log(`Verifying switchboard document exists in service ${syncServiceSid}`);
    let document;
    try {
      document = await client.sync
        .services(syncServiceSid)
        .documents(SWITCHBOARD_DOCUMENT_NAME)
        .fetch();
      console.log(`Found existing switchboard document with SID: ${document.sid}`);
    } catch (docError: any) {
      if (docError.status === 404) {
        console.log(`Document not found, creating new switchboard document...`);
        document = await client.sync.services(syncServiceSid).documents.create({
          uniqueName: SWITCHBOARD_DOCUMENT_NAME,
          data: DEFAULT_SWITCHBOARD_STATE,
          ttl: 48 * 60 * 60,
        });
        console.log(
          `Successfully created new switchboard document with SID: ${document.sid}`,
        );
      } else {
        throw docError;
      }
    }
  } catch (error: any) {
    console.error(`Failed to verify switchboard document:`, {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    throw error;
  }

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

    const client = await getTwilioClient(accountSid);

    const syncServices = await client.sync.services.list();
    console.log(
      'Available sync services:',
      syncServices.map(s => ({ sid: s.sid, name: s.friendlyName })),
    );
    const syncService = syncServices[0]; // Using the first sync service or implement proper lookup
    if (!syncService) {
      return newErr({
        message: 'Sync service not configured',
        error: { statusCode: 500 },
      });
    }
    console.log(
      'Using Sync service:',
      syncService.sid,
      syncService.friendlyName || 'unnamed',
    );

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
          cause: new Error(
            'Original Queue SID is required for enable/disable operations',
          ),
        },
      });
    }

    // Get queues and find switchboard queue
    const queues = await taskRouterClient.taskQueues.list();
    const switchboardQueue = queues.find(
      (queue: any) => queue.friendlyName === 'Switchboard Queue',
    );

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
    const masterWorkflow = workflows.find(
      (workflow: any) => workflow.friendlyName === 'Master Workflow',
    );

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
        taskRouterClient,
        originalQueue,
        switchboardQueue,
        masterWorkflow,
        supervisorWorkerSid,
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
};
