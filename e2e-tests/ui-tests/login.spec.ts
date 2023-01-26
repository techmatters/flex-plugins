import { expect, Page, test } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';
import { fakeAuthenticatedBrowser } from '../flex-in-a-box/flex-auth';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';
import context from '../flex-in-a-box/global-context';
import { mockStartup } from '../aselo-service-mocks/startup-mocks';
import AxeBuilder from '@axe-core/playwright';
import { addTaskToWorker } from '../flex-in-a-box/task';

test.describe.serial('Agent Desktop', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    await mockServer.start();

    const newContext = await browser.newContext();
    page = await newContext.newPage();
    logPageTelemetry(page);
    await fakeAuthenticatedBrowser(page, context.ACCOUNT_SID);
    await mockStartup(page);
  });

  test.afterAll(async () => {
    await mockServer.stop();
  });

  test('Plugin loads', async () => {
    await page.goto('/agent-desktop', { waitUntil: 'networkidle' });
    const callsWaitingLabel = page.locator(
      "div.Twilio-AgentDesktopView-default div[data-testid='Fake Queue-voice']",
    );
    await callsWaitingLabel.waitFor({ timeout: 60 * 60000, state: 'visible' });
  });

  test('Contacts waiting passes AXE scan', async () => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.Twilio-AgentDesktopView-default')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('A new chat task in the workers queue shows ', async () => {
    addTaskToWorker();
    const chatWaitingLabel = page.locator(
      "div.Twilio-AgentDesktopView-default div[data-testid='Fake Queue-chat']",
    );
    await chatWaitingLabel.waitFor({ timeout: 60 * 60000, state: 'visible' });
    await expect(chatWaitingLabel).toContainText('1');
  });
});
