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

// noinspection ES6UnusedImports

import { expect, Page, test } from '@playwright/test';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';
import AxeBuilder from '@axe-core/playwright';
import { addTaskToWorker } from '../aselo-service-mocks/task';
import hrmPermissions from '../aselo-service-mocks/hrm/permissions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { preload, useUnminifiedFlex } from '../flex-in-a-box/local-resources';
import { aseloPage } from '../aselo-service-mocks/aselo-page';
import { delay } from 'mockttp/dist/util/util';

test.describe.serial('Agent Desktop', () => {
  let page: Page;
  const permissions = hrmPermissions();

  test.beforeAll(async ({ browser }) => {
    await mockServer.start();
    page = await aseloPage(browser);
    await permissions.mockPermissionEndpoint(page);
  });

  test.afterAll(async () => {
    await mockServer.stop();
    await delay(5000);
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
