import { Browser, Page, chromium } from '@playwright/test';
import { logPageTelemetry } from './browser-logs';

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

    await new Promise((resolve) => setTimeout(resolve, 1000));
    count++;
  }
  console.log('Browser is ready');
};

export const setupContextAndPage = async (browser: Browser): Promise<SetupPageReturn> => {
  await waitForBrowser(browser);

  console.log('Launching page');
  const context = await browser.newContext();
  const page = await context.newPage();

  logPageTelemetry(page);

  console.log('Plugin page browser session launched');
  return { page, context };
};

export const closePage = async (page: Page): Promise<void> => {
  console.log('Closing page');
  try {
    await page.close();
  } catch (e) {
    console.log('Error closing page' + e);
  }
};
