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

import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { logPageTelemetry } from './browser-logs';
import { getConfigValue } from './config';

export type SetupPageReturn = {
  context: BrowserContext;
  page: Page;
};

// Sometimes the browser is not ready when we try to launch a page in a lambda
const waitForBrowser = async (browser: Browser): Promise<void> => {
  console.log('Waiting for browser to be ready');
  let count = 0;
  while (!browser.isConnected()) {
    if (count > 20) {
      throw new Error('Browser is not ready');
    }
    await chromium.launch();

    if (browser.isConnected()) break;

    // eslint-disable-next-line @typescript-eslint/no-loop-func
    await new Promise((resolve) => setTimeout(resolve, 1000));
    count++;
  }
  console.log('Browser is ready');
};

export const setupContextAndPage = async (browser: Browser): Promise<SetupPageReturn> => {
  await waitForBrowser(browser);

  console.info('Launching page');
  const context = await browser.newContext({
    storageState: getConfigValue('storageStatePath') as string,
  });
  const page = await context.newPage();

  logPageTelemetry(page);
  if (process.env.TWILIO_RUNTIME_DOMAIN) {
    console.debug(
      `Visiting /${process.env.TWILIO_RUNTIME_DOMAIN} to ensure future requests route to correct account`,
    );
    await page.goto(`/${process.env.TWILIO_RUNTIME_DOMAIN}`, { waitUntil: 'domcontentloaded' });
    console.debug(
      `Visited /${process.env.TWILIO_RUNTIME_DOMAIN} - waiting for logged in page element to load`,
    );
    // There are multiple elements so we need to use waitForSelector instead of a locator/waitFor
  }
  await page.waitForSelector('h2[data-testid="side-nav-header"]');

  console.info('Plugin page browser session launched');
  return { page, context };
};

export const closePage = async (page: Page): Promise<void> => {
  console.log('Closing page');
  try {
    await page.close();
  } catch (e) {
    console.log('Error closing page: ' + e);
  }
};
