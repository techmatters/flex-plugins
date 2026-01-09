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
import { adjustChatCapacity } from '../conversation/adjustChatCapacity';
import { AccountScopedHandler, HttpRequest } from '../httpTypes';
import { AccountSID, TaskSID, WorkerSID } from '@tech-matters/twilio-types';
import {
  getConversationsTransferWorkflow,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';
import { isErr, newErr, newOk, Result } from '../Result';
import { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';

export type Body = {
  taskSid: TaskSID;
  targetSid: string;
  ignoreAgent: WorkerSID;
  mode: 'COLD' | 'WARM';
};

// Only used for direct transfers of conversations, not programmable chat channels
const DIRECT_TRANSFER_QUEUE_FRIENDLY_NAME = 'Everyone';

// Annoying having to get the legacy name, but we can remove it as soon as programmable chat is gone
export const getProgrammableChatTransferWorkflowSid = async (
  accountSid: AccountSID,
): Promise<string> => {
  const environment = process.env.NODE_ENV!;
  let shortEnv = 'DEV';
  switch (environment.toLowerCase()) {
    case 'production':
      shortEnv = 'PROD';
      break;
    case 'staging':
      shortEnv = 'STG';
      break;
  }
  const attributes = await retrieveServiceConfigurationAttributes(
    await getTwilioClient(accountSid),
  );

  return getSsmParameter(`${shortEnv}_TWILIO_${attributes.helpline_code.toUpperCase()}`);
};
async function setDummyChannelToTask(
  accountSid: AccountSID,
  sid: string,
  taskToCloseAttributes: any,
) {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  // set the channelSid to a dummy value. This keeps the session alive
  const attributesWithDummyChannel = {
    ...taskToCloseAttributes,
    channelSid: 'CH00000000000000000000000000000000',
  };

  return client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks(sid)
    .update({ attributes: JSON.stringify(attributesWithDummyChannel) });
}

async function setDummyChannel(
  accountSid: AccountSID,
  body: Required<Pick<Body, 'taskSid' | 'targetSid' | 'ignoreAgent' | 'mode'>>,
) {
  if (body.mode !== 'COLD') return null;

  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  // retrieve attributes of the task to close
  const taskToClose = await client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks.get(body.taskSid)
    .fetch();

  const taskToCloseAttributes = JSON.parse(taskToClose.attributes);

  return setDummyChannelToTask(accountSid, body.taskSid, taskToCloseAttributes);
}

type ValidationResult =
  | { type: 'worker'; worker: WorkerInstance; shouldIncrease: boolean }
  | { type: 'queue' };

// if transfer targets a worker, validates that it can be effectively transferred, and if the worker's chat capacity needs to increase
async function validateChannelIfWorker(
  accountSid: AccountSID,
  targetSid: string,
  transferTargetType: string,
  taskChannelUniqueName: string,
  channelType: string,
): Promise<Result<Error, ValidationResult>> {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  if (transferTargetType === 'queue') return newOk({ type: 'queue' });

  const [worker, workerChannel] = await Promise.all([
    client.taskrouter.v1.workspaces.get(workspaceSid).workers.get(targetSid).fetch(),
    client.taskrouter.v1.workspaces
      .get(workspaceSid)
      .workers.get(targetSid)
      .workerChannels.get(taskChannelUniqueName)
      .fetch(),
  ]);

  if (!worker.available) {
    return newErr({
      message: `Can't transfer to an offline counselor`,
      error: new Error("Can't transfer to an offline counselor"),
    });
  }

  const workerAttr = JSON.parse(worker.attributes);

  const unavailableVoice =
    channelType === 'voice' && !workerChannel.availableCapacityPercentage;
  // if maxMessageCapacity is not set, just use configuredCapacity without adjustChatCapacity
  const unavailableChat = workerAttr.maxMessageCapacity
    ? channelType !== 'voice' &&
      !workerChannel.availableCapacityPercentage &&
      workerChannel.configuredCapacity >= workerAttr.maxMessageCapacity
    : channelType !== 'voice' && !workerChannel.availableCapacityPercentage;

  if (unavailableVoice || unavailableChat) {
    return newErr({
      message: `Counselor has no available capacity: ${unavailableVoice ? 'voice' : 'chat'} capacity full`,
      error: new Error('Counselor has no available capacity'),
    });
  }

  const shouldIncrease =
    workerAttr.maxMessageCapacity &&
    channelType !== 'voice' &&
    !workerChannel.availableCapacityPercentage &&
    workerChannel.configuredCapacity < workerAttr.maxMessageCapacity;

  return newOk({ type: 'worker', worker, shouldIncrease });
}

async function increaseChatCapacity(
  accountSid: AccountSID,
  validationResult: ValidationResult,
) {
  // once created the task, increase worker chat capacity if needed
  if (validationResult.type === 'worker' && validationResult.shouldIncrease) {
    const { worker } = validationResult;

    await adjustChatCapacity(accountSid, {
      workerSid: worker?.sid as WorkerSID,
      adjustment: 'increaseUntilCapacityAvailable',
    });
  }
}

export const transferCallToQueue = async (
  accountSid: AccountSID,
  originalTask: TaskInstance,
  newAttributes: any,
): Promise<TaskSID> => {
  const client = await getTwilioClient(accountSid);
  const programmableChatTransferWorkflowSid =
    await getConversationsTransferWorkflow(accountSid);

  // create New task
  const newTask = await client.taskrouter.v1.workspaces
    .get(await getWorkspaceSid(accountSid))
    .tasks.create({
      workflowSid: programmableChatTransferWorkflowSid,
      taskChannel: originalTask.taskChannelUniqueName,
      attributes: JSON.stringify(newAttributes),
      priority: 100,
    });
  console.debug(`Transfer target task created with sid ${newTask.sid}`);
  return newTask.sid as TaskSID;
};

export const transferStartHandler: AccountScopedHandler = async (
  { body: event }: HttpRequest,
  accountSid: AccountSID,
) => {
  console.info('===== transferStart invocation =====');

  const { taskSid, targetSid, ignoreAgent, mode } = event;

  if (taskSid === undefined) {
    return newMissingParameterResult('taskSid');
  }
  if (targetSid === undefined) {
    return newMissingParameterResult('targetSid');
  }
  if (ignoreAgent === undefined) {
    return newMissingParameterResult('ignoreAgent');
  }
  if (mode === undefined) {
    return newMissingParameterResult('mode');
  }
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  // retrieve attributes of the original task
  const originalTask = await client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks.get(taskSid)
    .fetch();
  console.debug('Original task fetched', originalTask);
  const originalAttributes = JSON.parse(originalTask.attributes);

  const transferTargetType = targetSid.startsWith('WK') ? 'worker' : 'queue';

  const validationResult = await validateChannelIfWorker(
    accountSid,
    targetSid,
    transferTargetType,
    originalTask.taskChannelUniqueName,
    originalAttributes.channelType,
  );

  if (isErr(validationResult)) {
    return newErr({
      ...validationResult,
      error: { cause: validationResult.error, statusCode: 400 },
    });
  }

  /**
   * Conversations comes with attributes.conversations filled in.
   * The code below can be simplified after all channels are moved to conversations.
   */
  const originalConversations = originalAttributes.conversations;
  let conversations;

  if (originalConversations) {
    conversations = originalConversations;
  } else if (originalAttributes.conversation) {
    conversations = originalAttributes.conversation;
  } else {
    conversations = { conversation_id: taskSid };
  }

  const newAttributes = {
    ...originalAttributes,
    conversations, // set up attributes of the new task to link them to the original task in Flex Insights
    ignoreAgent, // update task attributes to ignore the agent who transferred the task
    targetSid, // update task attributes to include the required targetSid on the task (workerSid or a queueSid)
    transferTargetType,
  };

  if (originalTask.taskChannelUniqueName === 'voice') {
    const newTaskSid = transferCallToQueue(accountSid, originalTask, newAttributes);
    return newOk({ taskSid: newTaskSid });
  }

  /**
   * Check if is transferring a conversation.
   * It might be better to accept an `isConversation` parameter.
   * But for now, we can check if a conversation exists given a conversationId.
   */

  const { flexInteractionSid, flexInteractionChannelSid } = originalAttributes;

  let isConversation = Boolean(flexInteractionSid && flexInteractionChannelSid);
  if (flexInteractionSid) {
    try {
      const interactionChannelParticipants = await client.flexApi.v1.interaction
        .get(flexInteractionSid)
        .channels.get(flexInteractionChannelSid)
        .participants.list();

      newAttributes.originalParticipantSid = interactionChannelParticipants.find(
        p => p.type === 'agent',
      )?.sid;
    } catch (err) {
      isConversation = false;
    }
  }

  let newTaskSid;
  if (isConversation) {
    const conversationsTransferWorkflowSid =
      await getConversationsTransferWorkflow(accountSid);
    if (transferTargetType === 'worker') {
      console.debug(
        `Transferring conversations task ${taskSid} to worker ${targetSid} - looking up queues.`,
      );
      // Get task queue
      const taskQueues = await client.taskrouter.v1.workspaces
        .get(workspaceSid)
        .taskQueues.list({ workerSid: targetSid });

      const taskQueueSid =
        taskQueues.find(tq => tq.friendlyName === DIRECT_TRANSFER_QUEUE_FRIENDLY_NAME)
          ?.sid || taskQueues[0].sid;

      console.info(
        `Transferring conversations task ${taskSid} to worker ${targetSid} via queue ${taskQueueSid} and workflow ${conversationsTransferWorkflowSid} by creating interaction invite.`,
      );
      // Create invite to target worker
      const invite = await client.flexApi.v1.interaction
        .get(flexInteractionSid)
        .channels.get(flexInteractionChannelSid)
        .invites.create({
          routing: {
            properties: {
              queue_sid: taskQueueSid,
              worker_sid: targetSid,
              workflow_sid: conversationsTransferWorkflowSid,
              workspace_sid: workspaceSid,
              attributes: newAttributes,
              task_channel_unique_name: originalTask.taskChannelUniqueName,
            },
          },
        });

      newTaskSid = invite.routing.properties.sid;
      console.info(
        `Transferred conversations task ${taskSid} to worker ${targetSid} by creating interaction invite.`,
      );
    } else if (transferTargetType === 'queue') {
      console.info(
        `Transferring conversations task ${taskSid} to queue ${targetSid} by creating interaction invite.`,
      );
      Object.entries({
        flexInteractionSid,
        flexInteractionChannelSid,
        TWILIO_CONVERSATIONS_CHAT_TRANSFER_WORKFLOW_SID: conversationsTransferWorkflowSid,
        TWILIO_WORKSPACE_SID: workspaceSid,
        newAttributes,
        taskChannelUniqueName: originalTask.taskChannelUniqueName,
      }).forEach(([key, value]) => {
        console.debug(`${key}:`, value);
      });
      console.debug('newAttributes:');
      Object.entries(newAttributes).forEach(([key, value]) => {
        console.debug(`${key}:`, value);
      });
      const invite = await client.flexApi.v1.interaction
        .get(flexInteractionSid)
        .channels.get(flexInteractionChannelSid)
        .invites.create({
          routing: {
            properties: {
              workflow_sid: conversationsTransferWorkflowSid,
              workspace_sid: workspaceSid,
              attributes: newAttributes,
              task_channel_unique_name: originalTask.taskChannelUniqueName,
            },
          },
        });

      console.info(
        `Transferred conversations task ${taskSid} to queue ${targetSid} by creating interaction invite.`,
      );
      newTaskSid = invite.routing.properties.sid;
    } else {
      return newErr({
        message: `Unrecognised transfer type: ${transferTargetType}`,
        error: { statusCode: 400 },
      });
    }
  } else {
    const programmableChatTransferWorkflowSid =
      await getProgrammableChatTransferWorkflowSid(accountSid);
    // Edit channel attributes so that original task won't cause issues with the transferred one
    await setDummyChannel(accountSid, {
      mode,
      ignoreAgent,
      targetSid,
      taskSid,
    });

    // create New task
    const newTask = await client.taskrouter.v1.workspaces.get(workspaceSid).tasks.create({
      workflowSid: programmableChatTransferWorkflowSid,
      taskChannel: originalTask.taskChannelUniqueName,
      attributes: JSON.stringify(newAttributes),
      priority: 100,
    });

    newTaskSid = newTask.sid;

    // Increase the chat capacity for the target worker (if needed)
    await increaseChatCapacity(accountSid, validationResult.data);
  }

  return newOk({ taskSid: newTaskSid });
};
