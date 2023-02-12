// noinspection ES6UnusedImports

import { expect, Page, test } from '@playwright/test';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';
import AxeBuilder from '@axe-core/playwright';
import { addTaskToWorker } from '../aselo-service-mocks/task';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { preload, useUnminifiedFlex } from '../flex-in-a-box/local-resources';
import { aseloPage } from '../aselo-service-mocks/aselo-page';

test.describe.serial('Agent Desktop', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    await mockServer.start();
    page = await aseloPage(browser);
  });

  test.afterAll(async () => {
    await mockServer.stop();
  });

  test('Agent Desktop loads', async () => {
    await page.goto('/agent-desktop', { waitUntil: 'networkidle' });
    const callsWaitingLabel = page.locator(
      "div.Twilio-AgentDesktopView-default div[data-testid='Fake Queue-voice']",
    );
    await callsWaitingLabel.waitFor({ state: 'visible' });
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
      "div.Twilio-AgentDesktopView-default div[data-testid='Fake Queue-web'] div[data-testid='channel-box-inner-value']",
    );
    await expect(chatWaitingLabel).toContainText('1');
  });
});
