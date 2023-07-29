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

export const deleteAllTasksInQueue = async (): Promise<void> => {
  const accountSid = getConfigValue('twilioAccountSid') as string;
  const authToken = getConfigValue('twilioAuthToken') as string;
  const twilioClient = twilio(accountSid, authToken);

  const workspaces = await twilioClient.taskrouter.v1.workspaces.list();
  if (!workspaces) {
    throw new Error(`Workspaces not found.`);
  }

  workspaces.forEach(async (workspace) => {
    const tasksInQueue = await workspace.tasks().list();

    await Promise.all(
      tasksInQueue.map((task) => {
        const attributes = JSON.parse(task.attributes);

        if (attributes.e2eTestMode !== 'true') {
          return Promise.resolve();
        }
        console.log(`Removing task ${task.sid}`);
        return task.remove();
      }),
    );
  });
};

process.on('SIGINT', deleteAllTasksInQueue);
process.on('SIGTERM', deleteAllTasksInQueue);
