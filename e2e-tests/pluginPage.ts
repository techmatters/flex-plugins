import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { logPageTelemetry } from './browser-logs';

const waitForBrowser = async (browser: Browser): Promise<void> => {
  console.log('Waiting for browser to be ready');
  let count = 0;
  while (!browser.isConnected()) {
    if (count > 20) {
      throw new Error('Browser is not ready');
    }
    await chromium.launch();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    count++;
  }
  console.log('Browser is ready');
};

export const setupPluginPage = async (browser: Browser): Promise<Page> => {
  await waitForBrowser(browser);

  console.log('Launching plugin page');
  const pluginPage = await browser.newPage();

  logPageTelemetry(pluginPage);

  console.log('Plugin page browser session launched');
  return pluginPage;
};

export const teardownPluginPage = async (pluginPage: Page): Promise<void> => {
  console.log('teardownPluginPage: Closing page');
  try {
    await pluginPage.close();
  } catch (e) {
    console.log('Error closing page' + e);
  }
};
