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
import { getConfigValue } from '../config';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./ui-global-setup'),
  use: {
    baseURL: getConfigValue('baseURL') as string,
    permissions: ['microphone'],
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Browser proxy option is required for Chromium on Windows
    launchOptions: { proxy: { server: `https://per-context` } },
    ignoreHTTPSErrors: true,
  },
  testDir: './tests',
  timeout: 60000,
  reporter: [['junit', { outputFile: 'junit.xml' }]],
};
export default config;
