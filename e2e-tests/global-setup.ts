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

/* eslint-disable import/no-extraneous-dependencies */
import { FullConfig } from '@playwright/test';
import { differenceInMilliseconds } from 'date-fns';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { oktaSsoLoginViaApi, oktaSsoLoginViaGui } from './okta/sso-login';
import environmentVariables from './environmentVariables';

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

  process.env.ARTIFACT_PATH = config.projects[0].outputDir;
  console.log(
    'Global setup completed',
    `Took ${differenceInMilliseconds(new Date(), start) / 1000} seconds`,
  );
}

export default globalSetup;
