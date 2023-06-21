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

// eslint-disable-next-line import/no-extraneous-dependencies
import twilio from 'twilio';
import { getConfigValue } from '../config';

const accountSid = getConfigValue('twilioAccountSid');
const authToken = getConfigValue('twilioAuthToken');
const twilioClient = twilio(accountSid, authToken);

export const deleteAllTasksInQueue = async (
  workspaceName: string,
  workflowName: string,
  taskQueueName: string,
): Promise<void> => {
  const workspace = (
    await twilioClient.taskrouter.workspaces.list({
      friendlyName: workspaceName,
    })
  )[0];
  if (!workspace) {
    throw new Error(`Workspace with friendly name '${workspaceName}' not found.`);
  }
  const tasksInQueue = await workspace.tasks().list({
    workflowName,
    taskQueueName,
  });
  await Promise.all(
    tasksInQueue.map((t) => {
      console.log(`Removing task ${t.sid}`);
      return t.remove();
    }),
  );
};
