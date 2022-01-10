// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  webServer: {
    command: 'cd ../plugin-hrm-form && npm start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    storageState: 'temp/state.json',
    baseURL: 'http://localhost:3000'
  },
  timeout: 180000
};
export default config;