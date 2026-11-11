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
import { AccountSID, TaskSID, WorkerSID } from '@tech-matters/twilio-types';
import {
  getConversationsTransferWorkflow,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import { isErr, newErr, newOk, Result } from '@tech-matters/result-type';
import { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { FlexValidatedHandler, isSupervisor } from '../validation/flexToken';
import { patchTaskAttributes } from '../task/patchTaskAttributes';

export type Body = {
  taskSid: TaskSID;
  targetSid: string;
  // Sent by older clients - the lambda derives the agent to ignore from the task's accepted reservation instead
  ignoreAgent?: WorkerSID;
  mode: 'COLD' | 'WARM';
};

const DUMMY_RESERVATION_SID = 'WR00000000000000000000000000000000';

class ActiveTransferError extends Error {}

const DIRECT_TRANSFER_QUEUE_FRIENDLY_NAME = 'Everyone';

type ValidationResult = { type: 'worker'; worker: WorkerInstance } | { type: 'queue' };

// If the transfer targets a worker, validate that the worker is online and has capacity.
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

  return newOk({ type: 'worker', worker });
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
  const { flexInteractionSid, flexInteractionChannelSid } = originalAttributes;

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

  if (!acceptedReservation) {
    return newHttpErrorResult(
      `Cannot start a transfer for task ${taskSid}: no accepted reservation found`,
      400,
    );
  }

  if (!flexInteractionSid || !flexInteractionChannelSid) {
    return newHttpErrorResult(
      `Cannot transfer task ${taskSid}: only Conversations tasks are supported`,
      400,
    );
  }

  // The agent the task is being transferred away from - derived server side so takeovers started by a supervisor don't ignore the supervisor
  const ignoreAgent = acceptedReservation.workerSid;

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

  let originalParticipantSid: string | undefined;
  try {
    const interactionChannelParticipants = await client.flexApi.v1.interaction
      .get(flexInteractionSid)
      .channels.get(flexInteractionChannelSid)
      .participants.list();

    originalParticipantSid = interactionChannelParticipants.find(
      p => p.type === 'agent',
    )?.sid;
  } catch (err) {
    return newHttpErrorResult(err as Error, 500);
  }

  /**
   * Replicates TransferHelpers.setTransferMeta from the Flex plugin.
   * Setting the transfer metadata server side (rather than via task.setAttributes in Flex)
   * allows a supervisor to start a transfer of a task assigned to another worker ('take over').
   * It is always rebuilt from the task's accepted reservation, so stale metadata left by a
   * previously rejected transfer can't leave the original worker in control of the task.
   * Updating the original task's attributes here is also what locks the form for the
   * original worker while the reservation is offered to the transfer target.
   */
  const originalWorker = await workspace.workers
    .get(acceptedReservation.workerSid)
    .fetch();
  const originalWorkerAttributes = JSON.parse(originalWorker.attributes);
  const transferMeta = {
    initiatingWorkerSid: tokenResult.worker_sid,
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
  let attributesWithTransferMeta: Record<string, any> = {
    ...originalAttributes,
    transferStarted: true,
    transferMeta,
  };
  try {
    const patchResult = await patchTaskAttributes(
      accountSid,
      taskSid,
      currentAttributes => {
        const status = currentAttributes.transferMeta?.transferStatus;
        if (status === 'transferring' || status === 'accepted') {
          throw new ActiveTransferError();
        }

        attributesWithTransferMeta = {
          ...currentAttributes,
          transferStarted: true,
          transferMeta: {
            ...transferMeta,
            originalConversationSid:
              currentAttributes.conversationSid || currentAttributes.channelSid,
          },
        };
        return attributesWithTransferMeta;
      },
      { requireEtag: true },
    );
    if (isErr(patchResult)) {
      return newHttpErrorResult(patchResult.message, 500);
    }
  } catch (err) {
    if (err instanceof ActiveTransferError) {
      return newHttpErrorResult('A transfer is already active for this task', 409);
    }
    return newHttpErrorResult(err as Error, 500);
  }

  const newAttributes: Record<string, any> = {
    ...attributesWithTransferMeta,
    initiatedByWorker: tokenResult.worker_sid,
    conversations: attributesWithTransferMeta.conversations, // link the new task to the original in Flex Insights
    ignoreAgent, // update task attributes to ignore the agent who transferred the task
    targetSid, // update task attributes to include the required targetSid on the task (workerSid or a queueSid)
    transferTargetType,
    originalParticipantSid,
  };

  let newTaskSid;
  try {
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
  } catch (err) {
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
    return newHttpErrorResult(err as Error, 500);
  }

  return newOk({ taskSid: newTaskSid });
};
