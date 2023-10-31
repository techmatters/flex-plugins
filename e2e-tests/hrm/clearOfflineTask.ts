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

// Clears out any residual offline task data for a worker so the test env is clean
export const clearOfflineTask = async (hrmRoot: string, workerSid: string, flexToken: string) => {
  const apiRequest = await request.newContext();
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
