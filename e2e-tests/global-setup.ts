import { chromium, expect, FullConfig, firefox } from '@playwright/test';
import { differenceInMilliseconds } from 'date-fns';
import { oktaSsoLoginViaApi, oktaSsoLoginViaGui } from './okta/sso-login';

// TODO: Replace with API call
async function globalSetup(config: FullConfig) {
  const start = new Date();
  console.log('Global setup started');
  if (config.projects.length>1) {
    console.warn(`Tests have ${config.projects.length} set up, only running global configuration against the first one - consider revising the global setup code.` )
  }

  // await oktaSsoLoginViaApi(config.projects[0].use.baseURL, process.env.PLAYWRIGHT_USER_USERNAME, process.env.PLAYWRIGHT_USER_PASSWORD, process.env.TWILIO_ACCOUNT_SID);
  await oktaSsoLoginViaGui(config, process.env.PLAYWRIGHT_USER_USERNAME, process.env.PLAYWRIGHT_USER_PASSWORD);
  console.log('Global setup completed', `Took ${differenceInMilliseconds(new Date(), start) / 1000} seconds`);
}

export default globalSetup;