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
    permissions: ['microphone', 'clipboard-write', 'clipboard-read'],
    screenshot: inLambda ? 'off' : 'only-on-failure',
    video: inLambda ? 'off' : 'retry-with-video',
    launchOptions: inLambda
      ? {
          args: [
            /**
             * --single-process is needed for AWS Lambda to work, but it breaks
             * some browser rehandling features between tests in the current versions
             * of chromium/Playwright. We use the `TEST_NAME` environment variable to set
             * a unique target for each test that runs in lambdas to avoid this issue.
             */
            '--single-process',
            '--autoplay-policy=user-gesture-required',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-domain-reliability',
            '--disable-extensions',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-print-preview',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-setuid-sandbox',
            '--disable-speech-api',
            '--disable-sync',
            '--disk-cache-size=33554432',
            '--hide-scrollbars',
            '--ignore-gpu-blacklist',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-sandbox',
            '--no-zygote',
            '--password-store=basic',
            '--use-gl=swiftshader',
            '--use-mock-keychain',
            '--disable-gpu',
            '--use-gl=swiftshader',
            '--autoplay-policy=no-user-gesture-required',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        }
      : {},
  },
  testDir: './tests',
  retries: inLambda ? 0 : 1,
  timeout: 60000,
  reporter: [['junit', { outputFile: 'junit.xml' }]],
};

// Only /tmp is writable in a lambda
if (inLambda) {
  playwrightConfig.outputDir = '/tmp/test-results';
}

export default playwrightConfig;
