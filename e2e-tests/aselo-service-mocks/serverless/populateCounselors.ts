// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from '../global-context';
import flexContext from '../../flex-in-a-box/global-context';

export const mockPopulateCounselors = async (page: Page) => {
  await page.route(
    new URL('/populateCounselors', context.SERVERLESS_BASE_URL).toString(),
    (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          workerSummaries: [
            { fullName: 'Logged In Counsellor', sid: flexContext.LOGGED_IN_WORKER_SID },
            { fullName: 'Lorna Ballentyne', sid: 'WK_LORNA' },
          ],
        }),
      });
    },
  );
};
