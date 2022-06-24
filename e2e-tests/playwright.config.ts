// playwright.config.ts
// eslint-disable-next-line import/no-extraneous-dependencies
import { PlaywrightTestConfig } from '@playwright/test';
import { environmentVariables } from './global-setup';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  use: {
    storageState: 'temp/state.json',
    baseURL: environmentVariables.PLAYWRIGHT_BASEURL ?? 'http://localhost:3000',
    permissions: ['microphone'],
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  timeout: 60000,
};
export default config;
