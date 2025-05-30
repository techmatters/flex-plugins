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
import { FullConfig, request } from '@playwright/test';
import { differenceInMilliseconds } from 'date-fns';
import { legacyOktaSsoLoginViaApi, oktaSsoLoginViaApi } from './okta/sso-login';
import { getConfigValue, initConfig } from './config';
import { getSidForWorker } from './twilio/worker';
import { clearOfflineTask } from './hrm/clearOfflineTask';
import { apiHrmRequest } from './hrm/hrmRequest';

async function globalSetup(config: FullConfig) {
  const start = new Date();
  console.log('Global setup started');
  if (config.projects.length > 1) {
    console.warn(
      `Tests have ${config.projects.length} set up, only running global configuration against the first one - consider revising the global setup code.`,
    );
  }

  await initConfig();
  const login = getConfigValue('legacyOktaSso') ? legacyOktaSsoLoginViaApi : oktaSsoLoginViaApi;
  process.env.FLEX_TOKEN = await login(
    getConfigValue('baseURL') as string,
    getConfigValue('oktaUsername') as string,
    getConfigValue('oktaPassword') as string,
    getConfigValue('twilioAccountSid') as string,
  );
  process.env.LOGGED_IN_WORKER_SID = await getSidForWorker(
    getConfigValue('oktaUsername') as string,
  );
  if (process.env.LOGGED_IN_WORKER_SID) {
    await clearOfflineTask(
      apiHrmRequest(await request.newContext(), process.env.FLEX_TOKEN),
      process.env.LOGGED_IN_WORKER_SID,
    );
  } else {
    console.warn(
      `Could not find worker with username ${getConfigValue(
        'oktaUsername',
      )} to clear out offline tasks.`,
    );
  }
  process.env.ARTIFACT_PATH = config.projects[0].outputDir;
  console.log(
    'Global setup completed',
    `Took ${differenceInMilliseconds(new Date(), start) / 1000} seconds`,
  );
}

export default globalSetup;
