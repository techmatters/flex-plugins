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

import {
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import {
  EventType,
  RESERVATION_ACCEPTED,
  RESERVATION_REJECTED,
  RESERVATION_TIMEOUT,
  RESERVATION_WRAPUP,
  TASK_CANCELED,
  TASK_QUEUE_ENTERED,
} from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveFeatureFlags } from '../configuration/aseloConfiguration';
import { getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { TransferMeta } from './hasTaskControl';

const DUMMY_CHANNEL_SID = 'CH00000000000000000000000000000000';

type ExtendedTransferMeta = TransferMeta & {
  originalReservation: string;
  originalTask: string;
};

type TransferTaskAttributes = {
  transferMeta?: ExtendedTransferMeta;
  transferTargetType?: 'worker' | 'queue';
  originalParticipantSid?: string;
  channelSid?: string;
  flexInteractionSid?: string;
  flexInteractionChannelSid?: string;
};

const isChatTransfer = (
  taskChannelUniqueName: string,
  taskAttributes: { transferMeta?: TransferMeta },
) =>
  taskChannelUniqueName !== 'voice' &&
  taskAttributes.transferMeta &&
  taskAttributes.transferMeta.mode === 'COLD' &&
  taskAttributes.transferMeta.transferStatus === 'accepted';

const isChatTransferToWorkerAccepted = (
  eventType: EventType,
  taskChannelUniqueName: string,
  taskAttributes: TransferTaskAttributes,
) =>
  eventType === RESERVATION_ACCEPTED &&
  isChatTransfer(taskChannelUniqueName, taskAttributes) &&
  taskAttributes.transferTargetType === 'worker';

const isChatTransferToWorkerRejected = (
  eventType: EventType,
  taskChannelUniqueName: string,
  taskAttributes: TransferTaskAttributes,
) =>
  (eventType === RESERVATION_REJECTED ||
    eventType === RESERVATION_TIMEOUT ||
    eventType === TASK_CANCELED) &&
  isChatTransfer(taskChannelUniqueName, taskAttributes) &&
  taskAttributes.transferTargetType === 'worker';

const isChatTransferToQueueComplete = (
  eventType: EventType,
  taskChannelUniqueName: string,
  taskAttributes: TransferTaskAttributes,
) =>
  eventType === TASK_QUEUE_ENTERED &&
  isChatTransfer(taskChannelUniqueName, taskAttributes) &&
  taskAttributes.transferTargetType === 'queue';

const isWarmVoiceTransferRejected = (
  eventType: EventType,
  taskChannelUniqueName: string,
  taskAttributes: { transferMeta?: TransferMeta },
) =>
  eventType === RESERVATION_REJECTED &&
  taskChannelUniqueName === 'voice' &&
  taskAttributes.transferMeta &&
  taskAttributes.transferMeta.mode === 'WARM';

const isVoiceTransferOriginalInWrapup = (
  eventType: EventType,
  taskChannelUniqueName: string,
  taskAttributes: { transferMeta?: TransferMeta },
) =>
  eventType === RESERVATION_WRAPUP &&
  taskChannelUniqueName === 'voice' &&
  taskAttributes.transferMeta &&
  taskAttributes.transferMeta.transferStatus === 'accepted';

const isWarmVoiceTransferTimedOut = (
  eventType: EventType,
  taskChannelUniqueName: string,
  taskAttributes: { transferMeta?: TransferMeta },
) =>
  eventType === RESERVATION_TIMEOUT &&
  taskChannelUniqueName === 'voice' &&
  taskAttributes.transferMeta &&
  taskAttributes.transferMeta.mode === 'WARM';

const transitionAgentParticipants = async (
  client: Twilio,
  taskAttributes: { flexInteractionSid?: string; flexInteractionChannelSid?: string },
  targetStatus: string,
  interactionChannelParticipantSid?: string,
) => {
  const { flexInteractionSid, flexInteractionChannelSid } = taskAttributes;

  if (!flexInteractionSid || !flexInteractionChannelSid) {
    console.warn(
      'transitionAgentParticipants called without flexInteractionSid or flexInteractionChannelSid - is it a Programmable Chat task?',
    );
    return;
  }

  const participants = await client.flexApi.v1.interaction
    .get(flexInteractionSid)
    .channels.get(flexInteractionChannelSid)
    .participants.list();

  const agentParticipants = participants.filter(
    p =>
      p.type === 'agent' &&
      (!interactionChannelParticipantSid || p.sid === interactionChannelParticipantSid),
  );

  await Promise.allSettled(
    agentParticipants.map(p => p.update({ status: targetStatus as any })),
  );
};

const updateWarmVoiceTransferAttributes = async (
  transferStatus: string,
  client: Twilio,
  workspaceSid: string,
  taskAttributes: { transferMeta: ExtendedTransferMeta } & Record<string, unknown>,
  taskSid: string,
) => {
  console.info(
    `TransfersListener: updating warm voice transfer ${transferStatus} attributes for task ${taskSid}...`,
  );

  const updatedAttributes = {
    ...taskAttributes,
    transferMeta: {
      ...taskAttributes.transferMeta,
      sidWithTaskControl: taskAttributes.transferMeta.originalReservation,
      transferStatus,
    },
  };

  await client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks.get(taskSid)
    .update({ attributes: JSON.stringify(updatedAttributes) });

  console.info(
    `TransfersListener: warm voice transfer ${transferStatus} attributes updated for task ${taskSid}.`,
  );
};

const transfersHandler: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  const featureFlags = await retrieveFeatureFlags(client);

  if (!featureFlags.use_twilio_lambda_transfers) {
    console.debug(
      `TransfersTaskRouterListener skipped for account ${accountSid} - use_twilio_lambda_transfers flag not enabled`,
    );
    return;
  }

  try {
    const {
      EventType: eventType,
      TaskChannelUniqueName: taskChannelUniqueName,
      TaskSid: taskSid,
      TaskAttributes: taskAttributesString,
    } = event;

    console.info(
      `TransfersListener executing for account ${accountSid}, task ${taskSid}, event: ${eventType}`,
    );

    const taskAttributes: TransferTaskAttributes = JSON.parse(taskAttributesString);
    const workspaceSid = await getWorkspaceSid(accountSid);

    if (
      isChatTransferToWorkerAccepted(eventType, taskChannelUniqueName, taskAttributes)
    ) {
      console.info(
        `TransfersListener: handling chat transfer accepted for account ${accountSid}, task ${taskSid}`,
      );

      const { originalTask: originalTaskSid } = taskAttributes.transferMeta!;

      const originalTask = await client.taskrouter.v1.workspaces
        .get(workspaceSid)
        .tasks.get(originalTaskSid)
        .update({
          assignmentStatus: 'completed',
          reason: 'task transferred accepted',
        });

      const originalTaskAttributes = JSON.parse(originalTask.attributes);
      await transitionAgentParticipants(
        client,
        originalTaskAttributes,
        'closed',
        taskAttributes.originalParticipantSid,
      );

      console.info(
        `TransfersListener: chat transfer accepted handled for account ${accountSid}, task ${taskSid}, original task ${originalTaskSid}`,
      );
      return;
    }

    if (isChatTransferToQueueComplete(eventType, taskChannelUniqueName, taskAttributes)) {
      console.info(
        `TransfersListener: handling chat transfer to queue for account ${accountSid}, task ${taskSid}`,
      );

      const { originalTask: originalTaskSid } = taskAttributes.transferMeta!;

      const originalTask = await client.taskrouter.v1.workspaces
        .get(workspaceSid)
        .tasks.get(originalTaskSid)
        .update({
          assignmentStatus: 'completed',
          reason: 'task transferred into queue',
        });

      if (taskAttributes.originalParticipantSid) {
        try {
          const originalTaskAttributes = JSON.parse(originalTask.attributes);
          await transitionAgentParticipants(
            client,
            originalTaskAttributes,
            'closed',
            taskAttributes.originalParticipantSid,
          );
        } catch (err) {
          console.error(
            `TransfersListener: error closing original participant ${taskAttributes.originalParticipantSid} for account ${accountSid}, task ${taskSid}`,
            err,
          );
        }
      }

      console.info(
        `TransfersListener: chat transfer to queue handled for account ${accountSid}, task ${taskSid}, original task ${originalTaskSid}`,
      );
      return;
    }

    if (
      isChatTransferToWorkerRejected(eventType, taskChannelUniqueName, taskAttributes)
    ) {
      console.info(
        `TransfersListener: handling chat transfer to worker rejected for account ${accountSid}, task ${taskSid}`,
      );

      const { originalTask: originalTaskSid } = taskAttributes.transferMeta!;
      const workspace = client.taskrouter.v1.workspaces.get(workspaceSid);
      const [originalTask, rejectedTask] = await Promise.all([
        workspace.tasks.get(originalTaskSid).fetch(),
        workspace.tasks.get(taskSid).fetch(),
      ]);

      const { channelSid } = taskAttributes;
      const { attributes: attributesRaw } = originalTask;
      const originalAttributes = JSON.parse(attributesRaw);

      const transferMeta = {
        ...originalAttributes.transferMeta,
        sidWithTaskControl: originalAttributes.transferMeta.originalReservation,
        transferStatus: 'rejected',
      };

      const updatedOriginalTaskAttributes = {
        ...originalAttributes,
        transferMeta,
        channelSid,
      };

      const updatedRejectedTaskAttributes = {
        ...JSON.parse(rejectedTask.attributes),
        transferMeta,
        channelSid: DUMMY_CHANNEL_SID,
      };

      await Promise.all([
        originalTask.update({
          attributes: JSON.stringify(updatedOriginalTaskAttributes),
        }),
        rejectedTask.update({
          attributes: JSON.stringify(updatedRejectedTaskAttributes),
        }),
      ]);

      await rejectedTask.update({
        assignmentStatus: 'canceled',
        reason: 'task transferred rejected',
      });

      console.info(
        `TransfersListener: chat transfer to worker rejected handled for account ${accountSid}, task ${taskSid}, original task ${originalTaskSid}`,
      );
      return;
    }

    if (isWarmVoiceTransferRejected(eventType, taskChannelUniqueName, taskAttributes)) {
      await updateWarmVoiceTransferAttributes(
        'rejected',
        client,
        workspaceSid,
        taskAttributes as { transferMeta: ExtendedTransferMeta } & Record<
          string,
          unknown
        >,
        taskSid,
      );
      return;
    }

    if (isWarmVoiceTransferTimedOut(eventType, taskChannelUniqueName, taskAttributes)) {
      await updateWarmVoiceTransferAttributes(
        'timeout',
        client,
        workspaceSid,
        taskAttributes as { transferMeta: ExtendedTransferMeta } & Record<
          string,
          unknown
        >,
        taskSid,
      );
      return;
    }

    if (
      isVoiceTransferOriginalInWrapup(eventType, taskChannelUniqueName, taskAttributes)
    ) {
      console.info(
        `TransfersListener: handling voice transfer wrapup for account ${accountSid}, task ${taskSid}`,
      );

      const { originalTask: originalTaskSid, originalReservation } =
        taskAttributes.transferMeta!;

      await client.taskrouter.v1.workspaces
        .get(workspaceSid)
        .tasks.get(originalTaskSid)
        .reservations.get(originalReservation)
        .update({ reservationStatus: 'completed' });

      console.info(
        `TransfersListener: voice transfer wrapup handled for account ${accountSid}, task ${taskSid}, original task ${originalTaskSid}`,
      );
      return;
    }

    console.info(
      `TransfersListener finished successfully for account ${accountSid}, task ${taskSid}, event: ${eventType}`,
    );
  } catch (err) {
    console.error(
      `TransfersListener failed for account ${accountSid}, task ${event.TaskSid}`,
      err,
    );
    throw err;
  }
};

export { transfersHandler as handleEvent };

registerTaskRouterEventHandler(
  [
    RESERVATION_ACCEPTED,
    RESERVATION_REJECTED,
    RESERVATION_TIMEOUT,
    RESERVATION_WRAPUP,
    TASK_CANCELED,
    TASK_QUEUE_ENTERED,
  ],
  transfersHandler,
);
