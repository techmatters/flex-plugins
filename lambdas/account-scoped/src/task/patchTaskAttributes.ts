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

import { AccountSID, TaskSID, WorkspaceSID } from '../twilioTypes';
import { Twilio } from 'twilio';
import { getWorkspaceSid } from '../configuration/twilioConfiguration';

const logError = (
  taskSid: TaskSID,
  workspaceSid: WorkspaceSID,
  step: 'fetch' | 'update',
  errorInstance: Error,
): void => {
  const errorMessage = `Error at patchTaskAttributes: task with sid ${taskSid} does not exists in workspace ${workspaceSid} when trying to ${step} it.`;
  console.error(errorMessage, errorInstance);
};

export const patchTaskAttributes = async (
  client: Twilio,
  accountSid: AccountSID,
  taskSid: TaskSID,
  updatedAttributesGenerator: (
    originalTaskAttributes: Record<string, any>,
  ) => Record<string, any>,
) => {
  const workspaceSid: WorkspaceSID = await getWorkspaceSid(accountSid);
  console.info('Adding external_id to task', taskSid);

  if (!taskSid) throw new Error('TaskSid missing in event object');

  let task;

  try {
    task = await client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).fetch();
  } catch (err) {
    logError(taskSid, workspaceSid, 'fetch', err as Error);
    return;
  }

  const taskAttributes = JSON.parse(task.attributes);

  const newAttributes = updatedAttributesGenerator(taskAttributes);

  try {
    await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .update({ attributes: JSON.stringify(newAttributes) });
  } catch (err) {
    logError(taskSid, workspaceSid, 'update', err as Error);
  }
};
