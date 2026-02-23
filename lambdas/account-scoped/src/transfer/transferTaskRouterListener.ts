/**
 * Copyright (C) 2021-2025 Technology Matters
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
import type { EventFields } from '../taskrouter';
import { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { registerTaskRouterEventHandler } from '../taskrouter/taskrouterEventHandler';
import { TASK_QUEUE_ENTERED } from '../taskrouter/eventTypes';
import { getWorkspaceSid } from '@tech-matters/twilio-configuration';

export const handleQueueTransferEvent = async (
  {
    TaskAttributes: taskAttributesString,
    TaskSid: taskSid,
    TaskChannelUniqueName: taskChannelUniqueName,
  }: EventFields,
  accountSid: AccountSID,
  client: Twilio,
): Promise<void> => {
  const taskAttributes = JSON.parse(taskAttributesString);
  if (
    taskChannelUniqueName !== 'voice' ||
    taskAttributes?.transferMeta?.transferStatus !== 'accepted'
  ) {
    return;
  }
  const { originalTask: originalTaskSid } = taskAttributes.transferMeta;
  console.info(
    `Handling ${taskChannelUniqueName} transfer for target task ${taskSid} to queue from original task ${originalTaskSid} entering target queue...`,
  );

  await client.taskrouter.v1.workspaces
    .get(await getWorkspaceSid(accountSid))
    .tasks.get(originalTaskSid)
    .update({
      assignmentStatus: 'completed',
      reason: 'task transferred into queue',
    });
};

registerTaskRouterEventHandler([TASK_QUEUE_ENTERED], handleQueueTransferEvent);
