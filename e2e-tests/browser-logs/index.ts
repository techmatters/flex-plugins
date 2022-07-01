// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import environmentVariables from '../environmentVariables';


export const enum PageTelemetryLevel {
  NONE = 'none',
  ERRORS = 'errors',
  ALL = 'all',
}

export type PageTelemetryConfig = {
  level: PageTelemetryLevel;
  logResponseBody: boolean;
};

const DEFAULT_CONFIG: PageTelemetryConfig = {
  level: <PageTelemetryLevel>(environmentVariables.PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL ?? 'errors'),
  logResponseBody:
    environmentVariables.PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY?.toLowerCase() === 'true',
};

export function logPageTelemetry(
  page: Page,
  configOverrides: Partial<PageTelemetryConfig> = {},
): void {
  const config: PageTelemetryConfig = { ...DEFAULT_CONFIG, ...configOverrides };
  if (config.level === PageTelemetryLevel.NONE) return;
  page.on('console', (message) => {
    if (
      config.level === PageTelemetryLevel.ALL ||
      message.type() === 'error' ||
      message.type() === 'warn'
    ) {
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
    if (response && (config.level === PageTelemetryLevel.ALL || response.status() >= 400)) {
      let bytes = 'unknown',
        body: Buffer | null = null;
      if (response.status() < 300) {
        try {
          body = await response!.body();
          bytes = body.length.toString();
        } catch (e) {
          console.warn('Failed to read response body', e);
        }
      }
      console.log(
        `[BROWSER: ${page.url()} (REQUEST)] ${request.method()} ${request.url()} ${response.status()}: ${response.statusText()} [${bytes} bytes] ${
          config.logResponseBody && body ? body.toString() : ''
        }`,
      );
    }
  });
}
