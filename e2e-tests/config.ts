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

import { config as dotenvConfig } from 'dotenv';
import { getSsmParameter, getSsmParametersByPath } from './ssmClient';
dotenvConfig();

const getBaseUrl = () =>
  process.env.PLAYWRIGHT_BASEURL ?? process.env.SSM_ENVIRONMENT
    ? 'https://flex.twilio.com/'
    : 'http://localhost:3000';

const config: Record<string, boolean | string | undefined> = {
  oktaUsername: process.env.PLAYWRIGHT_USER_USERNAME,
  oktaPassword: process.env.PLAYWRIGHT_USER_PASSWORD,
  baseURL: getBaseUrl(),
  browserTelemetryLevel: process.env.PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL ?? 'errors',
  browserTelemetryLogResponseBody:
    process.env.PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY ?? 'false',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  debug: process.env.DEBUG,
  isProduction: process.env.SSM_ENVIRONMENT === 'production' || !!process.env.IS_PRODUCTION,
  isStaging: process.env.SSM_ENVIRONMENT === 'staging' || !!process.env.IS_STAGING,
};

export const getConfigValue = (key: string) => {
  if (!config[key]) {
    throw new Error(`Config value ${key} is not set`);
  }

  return config[key];
};

export const setConfigValue = (key: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Config value for ${key} is not passed`);
  }

  config[key] = value;
};

export const shouldSkipDataUpdate = () => {
  if (config.skipDataUpdate) {
    console.log('Data update is disabled. Skipping...');
  }

  return config.skipDataUpdate;
};

const setEnvConfigFromSsm = async () => {
  if (!process.env.HELPLINE_SHORT_CODE) {
    throw new Error('In Production mode, but HELPLINE_SHORT_CODE is not set');
  }

  const env = process.env.SSM_ENVIRONMENT;
  const shortCode = process.env.HELPLINE_SHORT_CODE;
  const oktaSsmPath = `/${env}/flex-plugins/e2e`;

  const oktaParameters = await getSsmParametersByPath(oktaSsmPath);
  setConfigValue('oktaUsername', oktaParameters[`${oktaSsmPath}/okta_username`]);
  setConfigValue('oktaPassword', oktaParameters[`${oktaSsmPath}/okta_password`]);

  const accountSid = await getSsmParameter(`/${env}/twilio/${shortCode.toUpperCase()}/account_sid`);
  setConfigValue('twilioAccountSid', accountSid);
  setConfigValue(
    'twilioAuthToken',
    await getSsmParameter(`/${env}/twilio/${accountSid}/auth_token`),
  );
};

export const initConfig = async () => {
  if (process.env.SSM_ENVIRONMENT) await setEnvConfigFromSsm();

  config.skipDataUpdate = config.isProduction || config.isStaging;
};
