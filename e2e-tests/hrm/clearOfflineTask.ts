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

// Clears out any residual offline task data for a worker so the test env is clean
export const clearOfflineTask = async (
  hrmRequester: (hrmPath: string, method: 'get' | 'delete' | 'patch', body?: any) => Promise<any>,
  workerSid: string,
) => {
  const responseBody = await hrmRequester(`contacts/byTaskSid/offline-task-${workerSid}`, 'get');

  if (responseBody) {
    const contactId: string = responseBody.id;
    await hrmRequester(`contacts/${contactId}?finalize=false`, 'patch', {
      caseId: null,
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
    });
  } else {
    console.warn(`No offline task found for worker ${workerSid}, cannot clear out offline tasks`);
    return;
  }
};
