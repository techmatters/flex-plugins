// playwright.config.ts
// eslint-disable-next-line import/no-extraneous-dependencies
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  use: {
    storageState: 'temp/state.json',
<<<<<<< HEAD
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    // headless: false,    // Browser can run headlessly by default
=======
    baseURL: process.env.PLAYWRIGHT_BASEURL ?? 'http://localhost:3000',
>>>>>>> e3849bb442fb85573ec4b1e421c65992f4acd5e9
    permissions: ['microphone'],
  },
  timeout: 60000,
};
export default config;
