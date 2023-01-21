// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from '../global-context';

export const mockIssueSyncToken = async (page: Page) => {
  await page.route(new URL('/issueSyncToken', context.SERVERLESS_BASE_URL).toString(), (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'FAKE_SYNC_TOKEN',
      }),
    });
  });
};
