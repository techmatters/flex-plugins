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

// playwright.config.ts
// eslint-disable-next-line import/no-extraneous-dependencies
import { PlaywrightTestConfig } from '@playwright/test';
import { getConfigValue } from './config';

const inLambda = getConfigValue('inLambda') as boolean;

const playwrightConfig: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  use: {
    storageState: getConfigValue('storageStatePath') as string,
    baseURL: getConfigValue('baseURL') as string,
    ignoreHTTPSErrors: inLambda ? true : false,
    permissions: ['microphone'],
    screenshot: inLambda ? 'off' : 'only-on-failure',
    video: inLambda ? 'off' : 'retry-with-video',
    headless: inLambda ? true : false,
    launchOptions: inLambda
      ? {
          // Put your chromium-specific args here
          args: [
            '--single-process',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--use-gl=swiftshader',
            '--autoplay-policy=no-user-gesture-required',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--disable-sync',
          ],
        }
      : {},
  },
  testDir: './tests',
  retries: inLambda ? 0 : 1,
  timeout: 60000,
};

// Only /tmp is writable in a lambda
if (inLambda) {
  playwrightConfig.outputDir = '/tmp/test-results';
}

export default playwrightConfig;
