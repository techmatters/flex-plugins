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
import { Page } from '@playwright/test';
import context from '../global-context';
import flexContext from '../../flex-in-a-box/global-context';

export const mockListWorkerQueues = async (page: Page) => {
  const baseWorkspaceUrl = `https://taskrouter.twilio.com/v1/Workspaces/${flexContext.WORKSPACE_SID}`;
  const queues = [
    { sid: 'WQ_EVERYONE', friendlyName: 'Everyone' },
    { sid: 'WQ_FAKE_QUEUE', friendlyName: 'Fake Queue' },
  ];
  await page.route(
    new URL('/listWorkerQueues', context.SERVERLESS_BASE_URL).toString(),
    (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          workerQueues: queues.map(({ sid, friendlyName }) => ({
            accountSid: flexContext.ACCOUNT_SID,
            assignmentActivitySid: null,
            assignmentActivityName: null,
            dateCreated: '2019-12-17T09:58:33.000Z',
            dateUpdated: '2019-12-17T09:58:35.000Z',
            friendlyName,
            maxReservedWorkers: 1,
            reservationActivitySid: null,
            reservationActivityName: null,
            sid,
            targetWorkers: '1==1',
            taskOrder: 'FIFO',
            url: `${baseWorkspaceUrl}/TaskQueues/${sid}`,
            workspaceSid: flexContext.WORKSPACE_SID,
            links: {
              cumulative_statistics: `${baseWorkspaceUrl}/TaskQueues/${sid}/CumulativeStatistics`,
              real_time_statistics: `${baseWorkspaceUrl}/TaskQueues/${sid}/RealTimeStatistics`,
              statistics: `${baseWorkspaceUrl}/TaskQueues/${sid}/Statistics`,
              list_statistics: `${baseWorkspaceUrl}/TaskQueues/Statistics`,
              reservation_activity: null,
              workspace: baseWorkspaceUrl,
              assignment_activity: null,
            },
          })),
        }),
      });
    },
  );
};
