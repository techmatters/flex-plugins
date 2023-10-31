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

import { request } from '@playwright/test';
import { getConfigValue } from '../config';
import * as fs from 'fs/promises';

// Clears out any residual offline task data for a worker so the test env is clean
export const clearOfflineTask = async (hrmRoot: string, workerSid: string) => {
  let flexToken;
  for (let i = 0; i < 5; i++) {
    const stateFile = await fs.readFile(getConfigValue('storageStatePath') as string, 'utf-8');
    console.log('Stored state:', stateFile);
    // Parsing the flex token from the playwright state file seems like the lesser of 2 evils vs starting up a new browser context just to get the cookie value :-)
    flexToken = JSON.parse(stateFile).cookies.find((c: any) => c.name === 'flex-jwe')?.value;
    if (flexToken) {
      break;
    } else {
      console.log(
        `Could not find Flex token in playwright session state file following login, so we cannot clear offline task data in HRM. Retrying...`,
      );
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  if (!flexToken) {
    throw new Error(
      `Could not find Flex token in playwright session state file following login, so we cannot clear offline task data in HRM. Please check your playwright config.`,
    );
  }
  const apiRequest = await request.newContext({
    storageState: getConfigValue('storageStatePath') as string,
  });
  new URL(`${hrmRoot}/contacts/byTaskSid/offline-task-${workerSid}`);
  const resp = await apiRequest.get(`${hrmRoot}/contacts/byTaskSid/offline-task-${workerSid}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${flexToken}`,
    },
  });
  if (resp.ok()) {
    const contactId: string = (await resp.json()).id;
    await apiRequest.patch(`${hrmRoot}/contacts/${contactId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${flexToken}`,
      },
      // Copied from plugin-hrm-form/src/services/ContactService.ts
      data: {
        conversationDuration: 0,
        rawJson: {
          callType: '',
          childInformation: {},
          callerInformation: {},
          caseInformation: {},
          categories: {},
          contactlessTask: {
            channel: null,
            createdOnBehalfOf: null,
            date: null,
            time: null,
          },
        },
      },
    });
  } else {
    if (resp.status() === 404) {
      console.warn(`No offline task found for worker ${workerSid}, cannot clear out offline tasks`);
      return;
    } else {
      throw new Error(
        `Error occurred finding offline tasks for ${workerSid} in HRM: ${resp.status()}`,
      );
    }
  }
};
