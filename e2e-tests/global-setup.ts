/* eslint-disable import/no-extraneous-dependencies */
import { FullConfig } from '@playwright/test';
import { differenceInMilliseconds } from 'date-fns';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { oktaSsoLoginViaApi, oktaSsoLoginViaGui } from './okta/sso-login';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

export const environmentVariables = {
  PLAYWRIGHT_USER_USERNAME: process.env.PLAYWRIGHT_USER_USERNAME,
  PLAYWRIGHT_USER_PASSWORD: process.env.PLAYWRIGHT_USER_PASSWORD,
  PLAYWRIGHT_BASEURL: process.env.PLAYWRIGHT_BASEURL,
  PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL: process.env.PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL,
  PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY:
    process.env.PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  DEBUG: process.env.DEBUG,
};

async function globalSetup(config: FullConfig) {
  const start = new Date();
  console.log('Global setup started');
  if (config.projects.length > 1) {
    console.warn(
      `Tests have ${config.projects.length} set up, only running global configuration against the first one - consider revising the global setup code.`,
    );
  }

  await oktaSsoLoginViaApi(
    config.projects[0].use.baseURL!,
    environmentVariables.PLAYWRIGHT_USER_USERNAME!,
    environmentVariables.PLAYWRIGHT_USER_PASSWORD!,
    environmentVariables.TWILIO_ACCOUNT_SID!,
  );
  /* await oktaSsoLoginViaGui(
    config,
    environmentVariables.PLAYWRIGHT_USER_USERNAME ?? 'NOT SET',
    environmentVariables.PLAYWRIGHT_USER_PASSWORD ?? 'NOT SET',
  );
   */
  console.log(
    'Global setup completed',
    `Took ${differenceInMilliseconds(new Date(), start) / 1000} seconds`,
  );
}

export default globalSetup;
