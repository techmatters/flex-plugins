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

import { AccountScopedHandler, HttpError } from '../httpTypes';
import { isErr, newErr, newOk, Result } from '../Result';
import {
  getMasterWorkflowSid,
  getSwitchboardQueueSid,
  getSyncServiceSid,
  getTwilioClient,
  getTwilioWorkspaceSid,
} from '../configuration/twilioConfiguration';
import { Twilio } from 'twilio';
import {
  SwitchboardSyncState,
  SWITCHBOARD_STATE_DOCUMENT,
  SWITCHBOARD_NOTIFY_DOCUMENT,
  SWITCHBOARD_WORKFLOW_FILTER_PREFIX,
} from '@tech-matters/hrm-types';
import { AccountSID } from '../twilioTypes';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';

export type OperationType = 'enable' | 'disable';

export type SwitchboardRequest = {
  originalQueueSid: string;
  operation: OperationType;
  supervisorWorkerSid: string;
  Token: string;
};

export type TokenResponse = { identity: string; roles?: string[]; worker_sid?: string };

/**
 * Create the switchboard document in Twilio Sync
 */
async function createSwitchboardStateDocument({
  client,
  state,
  syncServiceSid,
}: {
  client: Twilio;
  syncServiceSid: string;
  state: SwitchboardSyncState;
}) {
  try {
    // create SWITCHBOARD_STATE_DOCUMENT document
    await client.sync.v1.services(syncServiceSid).documents.create({
      uniqueName: SWITCHBOARD_STATE_DOCUMENT,
      data: state,
    });

    // update or create the notify document to emit a notification
    try {
      await client.sync.v1
        .services(syncServiceSid)
        .documents.get(SWITCHBOARD_NOTIFY_DOCUMENT)
        .update({
          data: { updatedAt: new Date().getTime() },
        });
    } catch (err) {
      await client.sync.v1.services(syncServiceSid).documents.create({
        uniqueName: SWITCHBOARD_NOTIFY_DOCUMENT,
        data: { updatedAt: new Date().getTime() },
      });
    }

    return newOk(null);
  } catch (error) {
    const message = `Error creating switchboard document: ${error instanceof Error ? error.message : String(error)}`;
    return newErr({
      error: error instanceof Error ? error : new Error(String(error)),
      message,
    });
  }
}

/**
 * TODO
 */
async function deleteSwitchboardStateDocument({
  client,
  syncServiceSid,
}: {
  client: Twilio;
  syncServiceSid: string;
}) {
  console.log(
    `Deleting switchboard state document: ${JSON.stringify({ syncServiceSid }, null, 2)}`,
  );

  try {
    // delete SWITCHBOARD_STATE_DOCUMENT document
    const deleted = await client.sync.v1
      .services(syncServiceSid)
      .documents(SWITCHBOARD_STATE_DOCUMENT)
      .remove();

    // update or create the notify document to emit a notification
    try {
      await client.sync.v1
        .services(syncServiceSid)
        .documents.get(SWITCHBOARD_NOTIFY_DOCUMENT)
        .update({
          data: { updatedAt: new Date().getTime() },
        });
    } catch (err) {
      await client.sync.v1.services(syncServiceSid).documents.create({
        uniqueName: SWITCHBOARD_NOTIFY_DOCUMENT,
        data: { updatedAt: new Date().getTime() },
      });
    }

    return newOk(deleted);
  } catch (error: any) {
    // If document doesn't exist, that's fine
    if (error.status === 404 || error.code === 20404) {
      const message = `Document may not exist, proceeding anyway: ${error instanceof Error ? error.message : String(error)}`;
      console.log(message);
      return newOk(false);
    }

    const message = `Error creating switchboard document: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`Error in deleteSwitchboardState:`, message);
    return newErr({
      error: error instanceof Error ? error : new Error(String(error)),
      message,
    });
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
function removeSwitchboardingFilter({ config }: { config: WorkflowConfig }) {
  const updatedConfig = config;

  updatedConfig.task_routing.filters = updatedConfig.task_routing.filters.filter(
    filter => !filter.filter_friendly_name.startsWith(SWITCHBOARD_WORKFLOW_FILTER_PREFIX),
  );

  return updatedConfig;
}

/**
 * Handles the 'enable' operation - turns on switchboarding for a queue
 */
async function handleEnableOperation({
  accountSid,
  client,
  originalQueueSid,
  supervisorWorkerSid,
}: {
  accountSid: AccountSID;
  client: Twilio;
  originalQueueSid: string;
  supervisorWorkerSid: string;
}) {
  try {
    const workspaceSid = await getTwilioWorkspaceSid(accountSid);
    if (!workspaceSid) {
      const message = 'TaskRouter workspace not found';
      const error = new Error(message);
      return newErr({ error, message });
    }
    const masterWorkflowSid = await getMasterWorkflowSid(accountSid);
    if (!masterWorkflowSid) {
      const message = 'Master Workflow not found';
      const error = new Error(message);
      return newErr({ error, message });
    }
    const syncServiceSid = await getSyncServiceSid(accountSid);
    if (!syncServiceSid) {
      const message = 'Sync service not configured';
      const error = new Error(message);
      return newErr({ error, message });
    }
    const switchboardQueueSid = await getSwitchboardQueueSid(accountSid);
    if (!switchboardQueueSid) {
      const message = 'Switchboard queue not configured';
      const error = new Error(message);
      return newErr({ error, message });
    }

    const configResp = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workflows(masterWorkflowSid)
      .fetch();
    const currentConfig = JSON.parse(configResp.configuration) as WorkflowConfig;

    const queues = await client.taskrouter.v1.workspaces(workspaceSid).taskQueues.list();

    const originalQueue = queues.find(queue => queue.sid === originalQueueSid);
    if (!originalQueue) {
      const message = 'Original Queue not found';
      const error = new Error(message);
      return newErr({ error, message });
    }

    const syncState: SwitchboardSyncState = {
      isSwitchboardingActive: true,
      queueSid: originalQueue.sid,
      queueName: originalQueue.friendlyName,
      startTime: new Date().toISOString(),
      supervisorWorkerSid,
    };

    // create switchboard-state document to keep track of what's being switchboarded
    const createResult = await createSwitchboardStateDocument({
      client,
      syncServiceSid,
      state: syncState,
    });

    if (isErr(createResult)) {
      return createResult;
    }

    try {
      // try to update taskrouter settings to actually switchboard
      const updatedConfig = addSwitchboardingFilters({
        config: currentConfig,
        originalQueueSid: originalQueue.sid,
        switchboardQueueSid: switchboardQueueSid,
      });

      const {
        feature_flags: {
          enable_switchboarding_move_tasks: enableSwitchboardingMoveTasks,
        },
      } = await retrieveServiceConfigurationAttributes(client);

      await client.taskrouter.v1
        .workspaces(workspaceSid)
        .workflows(masterWorkflowSid)
        .update({
          configuration: JSON.stringify(updatedConfig),
          reEvaluateTasks: enableSwitchboardingMoveTasks ? 'true' : undefined,
        });

      return newOk({});
    } catch (error) {
      // remove switchboard-state document as switchboarding failed
      await deleteSwitchboardStateDocument({ client, syncServiceSid });
      const message = `Error enabling switchboard document: ${error instanceof Error ? error.message : String(error)}`;
      return newErr({
        error: error instanceof Error ? error : new Error(String(error)),
        message,
      });
    }
  } catch (error) {
    const message = `Error enabling switchboard document: ${error instanceof Error ? error.message : String(error)}`;
    return newErr({
      error: error instanceof Error ? error : new Error(String(error)),
      message,
    });
  }
}

/**
 * Handles the 'disable' operation - turns off switchboarding
 */
async function handleDisableOperation({
  accountSid,
  client,
}: {
  accountSid: AccountSID;
  client: Twilio;
}) {
  try {
    const workspaceSid = await getTwilioWorkspaceSid(accountSid);
    if (!workspaceSid) {
      const message = 'TaskRouter workspace not found';
      const error = new Error(message);
      return newErr({ error, message });
    }
    const masterWorkflowSid = await getMasterWorkflowSid(accountSid);
    if (!masterWorkflowSid) {
      const message = 'Master Workflow not found';
      const error = new Error(message);
      return newErr({ error, message });
    }
    const syncServiceSid = await getSyncServiceSid(accountSid);
    if (!syncServiceSid) {
      const message = 'Sync service not configured';
      const error = new Error(message);
      return newErr({ error, message });
    }

    const configResp = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workflows(masterWorkflowSid)
      .fetch();

    const currentConfig = JSON.parse(configResp.configuration) as WorkflowConfig;

    const updatedConfig = removeSwitchboardingFilter({ config: currentConfig });

    // try to update taskrouter settings to stop switchboard
    await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workflows(masterWorkflowSid)
      .update({
        configuration: JSON.stringify(updatedConfig),
      });

    // remove switchboard-state document once the taskrouter config is back to normal
    const deleteResult = await deleteSwitchboardStateDocument({ client, syncServiceSid });
    return deleteResult;
  } catch (error) {
    const message = `Error disabling switchboard document: ${error instanceof Error ? error.message : String(error)}`;
    return newErr({
      error: error instanceof Error ? error : new Error(String(error)),
      message,
    });
  }
}

export const handleToggleSwitchboardQueue: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, any>> => {
  try {
    const { originalQueueSid, operation, supervisorWorkerSid } =
      request.body as SwitchboardRequest;

    const client: Twilio = await getTwilioClient(accountSid);

    if (operation === 'enable') {
      const enableResult = await handleEnableOperation({
        accountSid,
        client,
        originalQueueSid,
        supervisorWorkerSid,
      });
      if (isErr(enableResult)) {
        return newErr({
          message: enableResult.message,
          error: { statusCode: 500, cause: enableResult.error },
        });
      }
      return enableResult;
    }

    if (operation === 'disable') {
      const disableResult = await handleDisableOperation({
        accountSid,
        client,
      });
      if (isErr(disableResult)) {
        return newErr({
          message: disableResult.message,
          error: { statusCode: 500, cause: disableResult.error },
        });
      }
      return disableResult;
    }

    // Return error for unsupported operations
    return newErr({
      message: `Unsupported operation: ${operation}`,
      error: { statusCode: 400 },
    });
  } catch (err: any) {
    console.error('Error in switchboarding handler:', err);
    return newErr({
      message: err.message || 'Internal server error',
      error: { statusCode: 500, cause: err },
    });
  }
};
