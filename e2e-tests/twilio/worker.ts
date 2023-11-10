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

import { getConfigValue } from '../config';
// eslint-disable-next-line import/no-extraneous-dependencies
import twilio from 'twilio';

export const getSidForWorker = async (friendlyName: string): Promise<string | undefined> => {
  const accountSid = getConfigValue('twilioAccountSid') as string;
  const authToken = getConfigValue('twilioAuthToken') as string;
  const twilioClient = twilio(accountSid, authToken);

  const workspaces = await twilioClient.taskrouter.v1.workspaces.list();
  if (!workspaces) {
    throw new Error(`Workspaces not found.`);
  }
  for (const workspace of workspaces) {
    const workersInWorkspace = await workspace.workers().list();
    const sid = workersInWorkspace.find((worker) => worker.friendlyName === friendlyName)?.sid;
    if (sid) {
      return sid;
    }
  }
  return undefined;
};

export const getWorkerFromPage = async (page: any): Promise<string> => {
  return page.evaluate(() => {
    const manager = (window as any).Twilio.Flex.Manager.getInstance();
    return manager.workerClient.sid;
  });
};
