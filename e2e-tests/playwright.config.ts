// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  use: {
    storageState: 'temp/state.json',
    baseURL: 'http://localhost:3000',
    permissions: ['microphone']
  },
  timeout: 180000
};
export default config;