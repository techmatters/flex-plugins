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
  console.log(
    'Calling /listWorkerQueues:',
    new URL('/listWorkerQueues', context.SERVERLESS_BASE_URL).toString(),
  );
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
