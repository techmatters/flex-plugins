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

import { FlexValidatedHandler } from '../validation/flexToken';
import type { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';
import { newOk } from '../Result';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';

type OfflineContactComplete = {
  action: 'complete';
  taskSid: TaskSID;
  finalTaskAttributes: TaskInstance['attributes'];
};

type OfflineContactRemove = {
  action: 'remove';
  taskSid: TaskSID;
};

type OfflineContactResolvePayload = OfflineContactComplete | OfflineContactRemove;

export type Body = OfflineContactResolvePayload;

const updateAndCompleteTask = async (
  accountSid: AccountSID,
  event: Required<Pick<OfflineContactComplete, 'taskSid' | 'finalTaskAttributes'>>,
): Promise<TaskInstance> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  const task = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .tasks(event.taskSid)
    .fetch();

  console.info(
    `Updating attributes for task ${event.taskSid} in workspace ${workspaceSid}`,
  );
  await task.update({ attributes: event.finalTaskAttributes });

  console.info(`Completing task ${event.taskSid} in workspace ${workspaceSid}`);
  const completedTask = await task.update({ assignmentStatus: 'completed' });
  console.info(`Task ${event.taskSid} completed successfully`);

  return completedTask;
};

export const assignOfflineContactResolveHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { action, taskSid } = event as Partial<OfflineContactResolvePayload>;

  if (action === undefined || (action !== 'complete' && action !== 'remove')) {
    return newMissingParameterResult('action');
  }

  if (taskSid === undefined) {
    return newMissingParameterResult('taskSid');
  }

  console.info(
    `assignOfflineContactResolve: action=${action}, taskSid=${taskSid}, accountSid=${accountSid}`,
  );

  // If action is "complete", we want to update the task attributes to its final form and complete it
  if (action === 'complete') {
    const { finalTaskAttributes } = event as OfflineContactComplete;

    if (finalTaskAttributes === undefined) {
      return newMissingParameterResult('finalTaskAttributes');
    }

    const completedTask = await updateAndCompleteTask(accountSid, {
      taskSid,
      finalTaskAttributes,
    });

    return newOk(completedTask);
  }

  // If action is "remove", we want to cleanup the stuck task
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  console.info(`Removing task ${taskSid} from workspace ${workspaceSid}`);
  const removed = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .tasks(taskSid)
    .remove();
  console.info(`Task ${taskSid} removed: ${removed}`);

  return newOk({ removed, taskSid });
};
