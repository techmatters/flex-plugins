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
import { newErr, newOk } from '../Result';
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

type AssignmentResult =
  | {
      type: 'error';
      payload: { message: string; attributes?: string };
    }
  | { type: 'success'; completedTask: TaskInstance };

const updateAndCompleteTask = async (
  accountSid: AccountSID,
  event: Required<Pick<OfflineContactComplete, 'taskSid' | 'finalTaskAttributes'>>,
): Promise<AssignmentResult> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  try {
    const task = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(event.taskSid)
      .fetch();

    await task.update({ attributes: event.finalTaskAttributes });

    const completedTask = await task.update({ assignmentStatus: 'completed' });

    return { type: 'success', completedTask } as const;
  } catch (err) {
    return {
      type: 'error',
      payload: { message: String(err), attributes: event.finalTaskAttributes },
    };
  }
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

  try {
    // If action is "complete", we want to update the task attributes to its final form and complete it
    if (action === 'complete') {
      const { finalTaskAttributes } = event as OfflineContactComplete;

      if (finalTaskAttributes === undefined) {
        return newMissingParameterResult('finalTaskAttributes');
      }

      const result = await updateAndCompleteTask(accountSid, {
        taskSid,
        finalTaskAttributes,
      });

      if (result.type === 'error') {
        return newErr({
          message: result.payload.message,
          error: { statusCode: 500 },
        });
      }

      return newOk(result.completedTask);
    }

    // If action is "remove", we want to cleanup the stuck task
    if (action === 'remove') {
      const client = await getTwilioClient(accountSid);
      const workspaceSid = await getWorkspaceSid(accountSid);

      const removed = await client.taskrouter.v1
        .workspaces(workspaceSid)
        .tasks(taskSid)
        .remove();

      return newOk({ removed, taskSid });
    }

    return newMissingParameterResult('action');
  } catch (err: any) {
    return newErr({
      message: err.message,
      error: { statusCode: 500, cause: err },
    });
  }
};
