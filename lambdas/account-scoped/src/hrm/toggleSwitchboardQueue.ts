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
import {
  getMasterWorkflowSid,
  getSyncServiceSid,
  getTwilioClient,
  getTwilioWorkspaceSid,
} from '../configuration/twilioConfiguration';
import { Twilio } from 'twilio';
import {
  SWITCHBOARD_QUEUE_NAME,
  SwitchboardSyncState,
  SWITCHBOARD_DOCUMENT_NAME,
  SWITCHBOARD_WORKFLOW_FILTER_PREFIX,
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
async function fetchSwitchboardResources(
  client: Twilio,
  accountSid: AccountSID,
  originalQueueSid?: string,
) {
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
    queue => queue.friendlyName === SWITCHBOARD_QUEUE_NAME,
  );
  if (!switchboardQueue) {
    throw new Error('Switchboard Queue not found');
  }

  const originalQueue = queues.find(queue => queue.sid === originalQueueSid);
  if (!originalQueue) {
    throw new Error('Original Queue not found');
  }

  const masterWorkflowSid = await getMasterWorkflowSid(accountSid);

  if (!masterWorkflowSid) {
    throw new Error('Master Workflow not found');
  }

  return {
    syncServiceSid,
    taskRouterClient,
    switchboardQueue,
    originalQueue,
    masterWorkflowSid,
  };
}

/**
 * Delete switchboarding state document
 */
async function deleteSwitchboardState(
  client: Twilio,
  syncServiceSid: string,
): Promise<any> {
  console.log(
    `Deleting switchboard state document: ${JSON.stringify({ syncServiceSid }, null, 2)}`,
  );

  try {
    // Try to delete the document if it exists
    const deletedDocument = await client.sync.v1
      .services(syncServiceSid)
      .documents(SWITCHBOARD_DOCUMENT_NAME)
      .remove();
    console.log('Successfully deleted switchboard state document');
    return deletedDocument;
  } catch (error: any) {
    // If document doesn't exist, that's fine
    if (error.status === 404 || error.code === 20404) {
      console.log('Document may not exist, proceeding anyway:', error.message);
      return { status: 'deleted_or_not_found' };
    }

    console.error(`Error in deleteSwitchboardState:`, {
      message: error.message,
    });
    throw error;
  }
}

/**
 * Create or update the switchboard document in Twilio Sync
 */
async function createSwitchboardStateDocument(
  client: Twilio,
  syncServiceSid: string,
  state: SwitchboardSyncState,
): Promise<any> {
  try {
    // First attempt to create the document
    return await client.sync.v1.services(syncServiceSid).documents.create({
      uniqueName: SWITCHBOARD_DOCUMENT_NAME,
      data: state,
      ttl: 48 * 60 * 60, // 48 hours
    });
  } catch (error: any) {
    if (error.message.includes('Unique name already exists')) {
      await deleteSwitchboardState(client, syncServiceSid);
      return await client.sync.v1.services(syncServiceSid).documents.create({
        uniqueName: SWITCHBOARD_DOCUMENT_NAME,
        data: state,
        ttl: 48 * 60 * 60, // 48 hours
      });
    } else {
      throw error;
    }
  }
}

// https://www.twilio.com/docs/taskrouter/workflow-configuration#workflow-configuration-document-structure
type WorkflowFilter = {
  filter_friendly_name: string;
  expression: string;
  targets: {
    queue: string;
    priority: number;
    expression: string;
    timeout: number;
  }[];
};
type WorkflowConfig = {
  task_routing: {
    filters: WorkflowFilter[];
    default_filter: {
      queue: string;
    };
  };
};

/**
 * Adds a filter to the workflow configuration to redirect calls from originalQueue to switchboardQueue to the top of the master workflow
 */
function addSwitchboardingFilters({
  config,
  originalQueueSid,
  switchboardQueueSid,
}: {
  config: WorkflowConfig;
  originalQueueSid: string;
  switchboardQueueSid: string;
}): WorkflowConfig {
  const originalQueueFilters = config.task_routing.filters.filter(filter =>
    filter.targets?.some(target => target.queue === originalQueueSid),
  );

  if (originalQueueFilters.length === 0) {
    return config;
  }

  const switchboardFilters = originalQueueFilters.map(filter => {
    const switchboardTargets = filter.targets
      .filter(target => target.queue === originalQueueSid)
      .map(target => ({
        ...target,
        queue: switchboardQueueSid,
        priority: 100,
      }));

    const filterName = `${SWITCHBOARD_WORKFLOW_FILTER_PREFIX} - ${filter.filter_friendly_name}`;
    const switchboardingFilter = {
      ...filter,
      filter_friendly_name: filterName,
      targets: switchboardTargets,
    };

    return switchboardingFilter;
  });

  const updatedConfig = {
    ...config,
    task_routing: {
      ...config.task_routing,
      filters: switchboardFilters.concat(config.task_routing.filters),
    },
  };

  return updatedConfig;
}

/**
 * Removes the switchboarding filter from the workflow configuration
 */
function removeSwitchboardingFilter(config: any): any {
  const updatedConfig = JSON.parse(JSON.stringify(config));

  updatedConfig.task_routing.filters = updatedConfig.task_routing.filters.filter(
    (filter: any) =>
      !filter.filter_friendly_name.startsWith(SWITCHBOARD_WORKFLOW_FILTER_PREFIX),
  );

  return updatedConfig;
}

/**
 * Finds all tasks in a queue that are in a specific status
 */
// async function findTasksInQueue(
//   client: Twilio,
//   workspaceSid: string,
//   queueSid: string,
//   assignmentStatus: string = 'pending',
// ): Promise<TaskInstance[]> {
//   try {
//     const tasks = await client.taskrouter.v1.workspaces(workspaceSid).tasks.list({
//       assignmentStatus: [assignmentStatus],
//       taskQueueSid: queueSid,
//     });

//     return tasks;
//   } catch (err) {
//     console.error(`Error finding ${assignmentStatus} tasks in queue:`, err);
//     throw err;
//   }
// }

/**
 * Moves a task from one queue to another
 */
// TODO from Review: this approach of "replace one task with another" approach only works for chat based tasks. I don't know if it does for voice tasks, that should be tested.
//
// async function moveTaskToQueue(
//   client: Twilio,
//   workspaceSid: string,
//   taskSid: string,
//   targetQueueSid: string,
//   additionalAttributes: Record<string, any> = {},
// ): Promise<void> {
//   try {
//     const task = await client.taskrouter.v1
//       .workspaces(workspaceSid)
//       .tasks(taskSid)
//       .fetch();
//     const currentAttributes = JSON.parse(task.attributes);
//     const switchboardingAttributes = {
//       ...currentAttributes,
//       switchboardingHandled: true,
//       switchboardingTimestamp: new Date().toISOString(),
//       targetQueueSid,
//       ...additionalAttributes,
//     };

//     await client.taskrouter.v1
//       .workspaces(workspaceSid)
//       .tasks(taskSid)
//       .update({
//         attributes: JSON.stringify(switchboardingAttributes),
//       });
// const masterWorkflow = getTwilioWorkspaceSid(accountSid)
//     if (!masterWorkflow) {
//       throw new Error('Master Workflow not found');
//     }

//     // Create a new task in the target queue that copies the current task's data
//     await client.taskrouter.v1.workspaces(workspaceSid).tasks.create({
//       attributes: JSON.stringify({
//         ...switchboardingAttributes,
//         transferTargetTaskSid: taskSid,
//       }),
//       workflowSid: masterWorkflow.sid,
//       taskChannel: task.taskChannelUniqueName,
//       priority: task.priority,
//     });

//     // Complete the original task as it's been replaced
//     await client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).update({
//       assignmentStatus: 'completed',
//       reason: 'Moved to another queue via Switchboard',
//     });
//   } catch (err) {
//     console.error(`Error moving task ${taskSid} to queue ${targetQueueSid}:`, err);
//     throw err;
//   }
// }

// /**
//  * Moves waiting tasks from source queue to target queue
//  */
// async function moveWaitingTasks(
//   client: Twilio,
//   workspaceSid: string,
//   sourceQueueSid: string,
//   targetQueueSid: string,
//   additionalAttributes: Record<string, any> = {},
// ): Promise<number> {
//   try {
//     const tasks = await findTasksInQueue(client, workspaceSid, sourceQueueSid);

//     const movePromises = tasks.map(async (task: any) => {
//       await moveTaskToQueue(
//         client,
//         workspaceSid,
//         task.sid,
//         targetQueueSid,
//         additionalAttributes,
//       );
//     });

//     await Promise.all(movePromises);
//     return tasks.length;
//   } catch (err) {
//     console.error('Error moving waiting tasks:', err);
//     throw err;
//   }
// }

/**
 * Handles the 'enable' operation - turns on switchboarding for a queue
 */
async function handleEnableOperation(
  client: Twilio,
  syncServiceSid: string,
  taskRouterClient: any,
  originalQueue: any,
  switchboardQueue: any,
  masterWorkflowSid: string,
  supervisorWorkerSid: string,
): Promise<SwitchboardSyncState> {
  const configResp = await taskRouterClient.workflows(masterWorkflowSid).fetch();
  const currentConfig = JSON.parse(configResp.configuration) as WorkflowConfig;

  const updatedConfig = addSwitchboardingFilters({
    config: currentConfig,
    originalQueueSid: originalQueue.sid,
    switchboardQueueSid: switchboardQueue.sid,
  });

  const syncState: SwitchboardSyncState = {
    isSwitchboardingActive: true,
    queueSid: originalQueue.sid,
    queueName: originalQueue.friendlyName,
    startTime: new Date().toISOString(),
    supervisorWorkerSid,
  };

  await createSwitchboardStateDocument(client, syncServiceSid, syncState);

  await taskRouterClient.workflows(masterWorkflowSid).update({
    configuration: JSON.stringify(updatedConfig),
  });

  return syncState;
}

/**
 * Handles the 'disable' operation - turns off switchboarding
 */
async function handleDisableOperation(
  client: Twilio,
  syncServiceSid: string,
  taskRouterClient: any,
  masterWorkflowSid: string,
): Promise<void> {
  const configResp = await taskRouterClient.workflows(masterWorkflowSid).fetch();
  const currentConfig = JSON.parse(configResp.configuration);

  const updatedConfig = removeSwitchboardingFilter(currentConfig);

  await deleteSwitchboardState(client, syncServiceSid);

  await taskRouterClient.workflows(masterWorkflowSid).update({
    configuration: JSON.stringify(updatedConfig),
  });

  await taskRouterClient.workflows(masterWorkflowSid).update({
    configuration: JSON.stringify(updatedConfig),
  });

  // TODO: Move any waiting tasks from the switchboard queue back to the original queue
  // if (currentState.queueSid) {
  //   try {
  //     await moveWaitingTasks(
  //       client,
  //       workspaceSid,
  //       switchboardQueue.sid,
  //       currentState.queueSid,
  //       { switchboardingActive: false },
  //     );
  //   } catch (err) {
  //     console.error('Error moving tasks back to the original queue:', err);
  //   }
  // }
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
        syncServiceSid,
        taskRouterClient,
        switchboardQueue,
        originalQueue,
        masterWorkflowSid,
      } = await fetchSwitchboardResources(client, accountSid, originalQueueSid);

      let state;
      if (operation === 'enable') {
        state = await handleEnableOperation(
          client,
          syncServiceSid,
          taskRouterClient,
          originalQueue,
          switchboardQueue,
          masterWorkflowSid,
          supervisorWorkerSid,
        );
        return newOk(state);
      }

      if (operation === 'disable') {
        state = await handleDisableOperation(
          client,
          syncServiceSid,
          taskRouterClient,
          masterWorkflowSid,
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
