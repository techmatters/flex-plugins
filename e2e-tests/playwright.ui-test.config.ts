// playwright.config.ts
// eslint-disable-next-line import/no-extraneous-dependencies
import { PlaywrightTestConfig } from '@playwright/test';
import environmentVariables from './environmentVariables';
import { MOCKTTP_SERVER_PORT } from './flex-in-a-box/proxied-endpoints';

const config: PlaywrightTestConfig = {
  use: {
    storageState: 'temp/state.json',
    baseURL: environmentVariables.PLAYWRIGHT_BASEURL ?? 'http://localhost:3000',
    permissions: ['microphone'],
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Browser proxy option is required for Chromium on Windows.
    proxy: { server: `http://localhost:${MOCKTTP_SERVER_PORT}`, bypass: 'localhost:3100' },
    launchOptions: { proxy: { server: `http://localhost:${MOCKTTP_SERVER_PORT}` } },
    ignoreHTTPSErrors: true,
  },
  testDir: './ui-tests',
  timeout: 60000,
};
export default config;
