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
import type { AccountScopedHandler, HttpRequest } from '../httpTypes';
import type { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { newMissingParameterResult } from '../httpErrors';
import { newOk } from '../Result';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';

export type Body = {
  request: { cookies: {}; headers: {} };
} & { taskSid: TaskSID };

const isTaskAssigned = async (
  accountSid: AccountSID,
  taskSid: TaskSID,
): Promise<boolean> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  try {
    const task = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .fetch();

    const { assignmentStatus } = task;

    return assignmentStatus === 'assigned' || assignmentStatus === 'wrapping';
  } catch (err) {
    console.error('Error fetching task:', err);
    return false;
  }
};

export const checkTaskAssignmentHandler: AccountScopedHandler = async (
  { body: event }: HttpRequest,
  accountSid: AccountSID,
) => {
  const { taskSid } = event as { taskSid: TaskSID };

  if (taskSid === undefined) {
    return newMissingParameterResult('taskSid');
  }

  const result = await isTaskAssigned(accountSid, taskSid);
  return newOk({ isAssigned: result });
};
