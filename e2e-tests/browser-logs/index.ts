// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

export function logPageErrors(page: Page, errorsOnly = true): void {
  page.on('console', (message) => {
    if (!errorsOnly || message.type() === 'error' || message.type() === 'warn') {
      console.log(`[BROWSER: ${page.url()} (${message.type()})] ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    console.log(
      `[BROWSER: ${page.url()} (REQUEST FAILED)] ${request.method()} ${request.url()} ${request.failure()}`,
    );
  });
  page.on('requestfinished', async (request) => {
    const response = await request.response();
    if (response && (!errorsOnly || response.status() >= 400)) {
      let bytes = 'unknown';
      try {
        bytes = (await response!.body()).length.toString();
      } catch (e) {
        console.warn('Failed to read response body', e);
      }
      console.log(
        `[BROWSER: ${page.url()} (REQUEST)] ${request.method()} ${request.url()} ${response.status()}: ${response.statusText()} [${bytes} bytes]`,
      );
    }
  });
}
