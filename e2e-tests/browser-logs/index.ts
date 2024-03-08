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

// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import { getConfigValue } from '../config';

export const enum PageTelemetryLevel {
  NONE = 'none',
  ERRORS = 'errors',
  ALL = 'all',
}

const DEFAULT_EXCLUSIONS: RegExp[] = [/.*FlexModule: FlexModule not initialized.*/];

export type PageTelemetryConfig = {
  level: PageTelemetryLevel;
  logResponseBody: boolean;
};

const DEFAULT_CONFIG: PageTelemetryConfig = {
  level: <PageTelemetryLevel>getConfigValue('browserTelemetryLevel'),
  logResponseBody: getConfigValue('browserTelemetryLogResponseBody') as boolean,
};

export function logPageTelemetry(
  page: Page,
  configOverrides: Partial<PageTelemetryConfig> = {},
): void {
  if (getConfigValue('browserTelemetryDisabled')) return;

  const config: PageTelemetryConfig = { ...DEFAULT_CONFIG, ...configOverrides };
  if (config.level === PageTelemetryLevel.NONE) return;
  page.on('console', (message) => {
    if (
      config.level === PageTelemetryLevel.ALL ||
      message.type() === 'error' ||
      message.type() === 'warn' ||
      DEFAULT_EXCLUSIONS.every((exclusion) => !exclusion.test(message.text()))
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
