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

import { BrowserContext, Page, test } from '@playwright/test';
import { navigateToAgentDesktop } from '../agent-desktop';
import { setupPluginPage, teardownPluginPage } from '../pluginPage';

test.describe.serial('Login', () => {
  let pluginPage: Page, context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    pluginPage = await setupPluginPage(browser);
  });

  test.afterAll(async () => {
    await teardownPluginPage(pluginPage);
  });

  test('Plugin loads', async () => {
    await navigateToAgentDesktop(pluginPage);
    console.log('Agent Desktop loaded');
  });
});
