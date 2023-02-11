// noinspection ES6UnusedImports

import { expect, Page, test } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';
import { fakeAuthenticatedBrowser } from '../flex-in-a-box/flex-auth';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';
import context from '../flex-in-a-box/global-context';
import { mockStartup } from '../aselo-service-mocks/startup-mocks';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { preload, useUnminifiedFlex } from '../flex-in-a-box/local-resources';
import hrmCases from '../aselo-service-mocks/hrm/cases';
import { caseList } from '../caseList';
import AxeBuilder from '@axe-core/playwright';

test.describe.serial('Case List', () => {
  let page: Page;
  const cases = hrmCases();

  test.beforeAll(async ({ browser }) => {
    await preload();
    await mockServer.start();
    const newContext = await browser.newContext();
    page = await newContext.newPage();

    await useUnminifiedFlex(page);
    logPageTelemetry(page);
    await fakeAuthenticatedBrowser(page, context.ACCOUNT_SID);
    await mockStartup(page);
    await cases.mockCaseEndpoints(page);
  });

  test.afterAll(async () => {
    await mockServer.stop();
  });

  test('Case list loads items', async () => {
    await page.goto('/case-list', { waitUntil: 'networkidle' });
    await caseList(page).verifyCaseIdsAreInListInOrder(
      cases
        .getMockCases()
        .slice(0, 10)
        .map((c) => c.id.toString()),
    );
  });

  test('Case list waiting passes AXE scan', async () => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
