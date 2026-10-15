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
import { AccountSID, TaskSID, WorkerSID } from '@tech-matters/twilio-types';
import {
  getConversationsTransferWorkflow,
  getMasterWorkflowSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import { isErr, newErr, newOk, Result } from '@tech-matters/result-type';
import { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { FlexValidatedHandler, isSupervisor } from '../validation/flexToken';

export type Body = {
  taskSid: TaskSID;
  targetSid: string;
  ignoreAgent?: WorkerSID;
  mode: 'COLD' | 'WARM';
};

const DUMMY_RESERVATION_SID = 'WR00000000000000000000000000000000';

// Only used for direct transfers of conversations, not programmable chat channels
const DIRECT_TRANSFER_QUEUE_FRIENDLY_NAME = 'Everyone';

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
  body: Required<Pick<Body, 'taskSid' | 'mode'>>,
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

export const transferStartHandler: FlexValidatedHandler = async (
  { body: event, tokenResult },
  accountSid: AccountSID,
) => {
  console.info('===== transferStart invocation =====');

  const { taskSid, targetSid, mode } = event as Body;

  if (taskSid === undefined) {
    return newMissingParameterResult('taskSid');
  }
  if (targetSid === undefined) {
    return newMissingParameterResult('targetSid');
  }
  if (mode === undefined) {
    return newMissingParameterResult('mode');
  }
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  const workspace = client.taskrouter.v1.workspaces.get(workspaceSid);

  // retrieve attributes of the original task
  const originalTask = await workspace.tasks.get(taskSid).fetch();
  console.debug('Original task fetched', originalTask);
  const originalAttributes = JSON.parse(originalTask.attributes);

  // Look up the reservation currently assigned the task so the transfer can be started by a worker other than the one assigned the task (i.e. a supervisor taking the task over)
  const reservations = await workspace.tasks.get(taskSid).reservations.list();
  const acceptedReservation = reservations.find(
    reservation => reservation.reservationStatus === 'accepted',
  );

  if (
    !isSupervisor(tokenResult) &&
    acceptedReservation?.workerSid !== tokenResult.worker_sid
  ) {
    return newHttpErrorResult(
      'Unauthorized: only a supervisor or the worker currently assigned the task can start a transfer',
      403,
    );
  }

  // The agent the task is being transferred away from - derived server side so takeovers started by a supervisor don't ignore the supervisor
  const ignoreAgent = acceptedReservation?.workerSid ?? (event as Body).ignoreAgent;
  if (ignoreAgent === undefined) {
    return newMissingParameterResult('ignoreAgent');
  }

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
   * Replicates TransferHelpers.setTransferMeta from the Flex plugin.
   * Setting the transfer metadata server side (rather than via task.setAttributes in Flex)
   * allows a supervisor to start a transfer of a task assigned to another worker ('take over').
   * If the metadata was already set by an older client, it is left untouched.
   */
  let { transferMeta } = originalAttributes;
  let attributesWithTransferMeta = originalAttributes;
  let transferMetaSetHere = false;
  if (!transferMeta) {
    if (!acceptedReservation) {
      return newHttpErrorResult(
        `Cannot start a transfer for task ${taskSid}: no accepted reservation found`,
        400,
      );
    }
    const originalWorker = await workspace.workers
      .get(acceptedReservation.workerSid)
      .fetch();
    const originalWorkerAttributes = JSON.parse(originalWorker.attributes);
    transferMeta = {
      originalTask: taskSid,
      originalReservation: acceptedReservation.sid,
      originalCounselor: acceptedReservation.workerSid,
      originalCounselorName:
        originalWorkerAttributes.full_name ?? originalWorker.friendlyName,
      // save the original conversation sid, so we can cleanup the listeners if transferred successfully
      originalConversationSid:
        originalAttributes.conversationSid || originalAttributes.channelSid,
      // if cold, set control to dummy value so Task Janitor completes this one
      sidWithTaskControl: mode === 'WARM' ? '' : DUMMY_RESERVATION_SID,
      transferStatus: mode === 'WARM' ? 'transferring' : 'accepted',
      mode,
      targetType: transferTargetType,
    };
    attributesWithTransferMeta = {
      ...originalAttributes,
      transferStarted: true,
      transferMeta,
    };
    await workspace.tasks
      .get(taskSid)
      .update({ attributes: JSON.stringify(attributesWithTransferMeta) });
    transferMetaSetHere = true;
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
    ...attributesWithTransferMeta,
    conversations, // set up attributes of the new task to link them to the original task in Flex Insights
    ignoreAgent, // update task attributes to ignore the agent who transferred the task
    targetSid, // update task attributes to include the required targetSid on the task (workerSid or a queueSid)
    transferTargetType,
  };

  /**
   * Check if is transfering a conversation.
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
  try {
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
          TWILIO_CONVERSATIONS_CHAT_TRANSFER_WORKFLOW_SID:
            conversationsTransferWorkflowSid,
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
      const programmableChatTransferWorkflowSid = await getMasterWorkflowSid(accountSid);
      // Edit channel attributes so that original task won't cause issues with the transferred one
      await setDummyChannel(accountSid, {
        mode,
        taskSid,
      });

      // create New task
      const newTask = await client.taskrouter.v1.workspaces
        .get(workspaceSid)
        .tasks.create({
          workflowSid: programmableChatTransferWorkflowSid,
          taskChannel: originalTask.taskChannelUniqueName,
          attributes: JSON.stringify(newAttributes),
          priority: 100,
        });

      newTaskSid = newTask.sid;

      // Increase the chat capacity for the target worker (if needed)
      await increaseChatCapacity(accountSid, validationResult.data);
    }
  } catch (err) {
    if (transferMetaSetHere) {
      // Roll back the transfer metadata set on the original task above so it isn't left looking 'mid transfer'
      try {
        await workspace.tasks
          .get(taskSid)
          .update({ attributes: JSON.stringify(originalAttributes) });
      } catch (rollbackErr) {
        console.error(
          `Failed to roll back transfer metadata on task ${taskSid} after a failed transfer`,
          rollbackErr,
        );
      }
    }
    return newHttpErrorResult(err as Error, 500);
  }

  return newOk({ taskSid: newTaskSid });
};
