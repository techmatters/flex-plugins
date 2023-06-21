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

import dotenv from 'dotenv';
import { getSsmParameter } from './ssmClient';

dotenv.config();

export type ConfigOption = {
  env: string;
  ssmPath?: string;
  default?: ConfigValue;
};

export type ConfigOptions = {
  [key: string]: ConfigOption;
};

export type ConfigValue = boolean | string | undefined;

export type Config = {
  [key: string]: ConfigValue;
};

const configEnv = process.env.CONFIG_ENVIRONMENT || 'local';
const helplineShortCode = process.env.HELPLINE_SHORT_CODE || '';
const shouldLoadFromSsm = !!(process.env.LOAD_FROM_SSM && process.env.LOAD_FROM_SSM !== 'false');

const configOptions: ConfigOptions = {
  oktaUsername: {
    env: 'PLAYWRIGHT_USER_USERNAME',
    ssmPath: `/${configEnv}/flex-plugins/e2e/okta_username`,
  },
  oktaPassword: {
    env: 'PLAYWRIGHT_USER_PASSWORD',
    ssmPath: `/${configEnv}/flex-plugins/e2e/okta_password`,
  },
  baseURL: {
    env: 'PLAYWRIGHT_BASEURL',
    default: process.env.CONFIG_ENVIRONMENT ? 'https://flex.twilio.com/' : 'http://localhost:3000',
  },
  browserTelemetryLevel: {
    env: 'PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL',
    default: 'errors',
  },
  browserTelemetryLogResponseBody: {
    env: 'PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY',
    default: 'false',
  },
  twilioAccountSid: {
    env: 'TWILIO_ACCOUNT_SID',
    ssmPath: `/${configEnv}/twilio/${helplineShortCode.toUpperCase()}/account_sid`,
  },
  twilioAuthToken: {
    env: 'TWILIO_AUTH_TOKEN',
  },
  debug: {
    env: 'DEBUG',
    default: false,
  },
  isProduction: {
    env: 'IS_PRODUCTION',
    default: process.env.CONFIG_ENVIRONMENT === 'production' || false,
  },
  isStaging: {
    env: 'IS_STAGING',
    default: process.env.CONFIG_ENVIRONMENT === 'staging' || false,
  },
  isDevelopment: {
    env: 'IS_DEVELOPMENT',
    default: process.env.CONFIG_ENVIRONMENT === 'staging' || false,
  },
  skipDataUpdate: {
    env: 'SKIP_DATA_UPDATE',
    default: false,
  },
};

export const config: Config = {};

export const getConfigValue = (key: string) => {
  console.dir(config, { depth: null });
  if (!config[key]) {
    throw new Error(`Config value ${key} is not set`);
  }

  return config[key];
};

export const setConfigValue = (key: string, value: ConfigValue) => {
  config[key] = value;
  process.env[configOptions[key].env] = value as string;
};

export const shouldSkipDataUpdate = () => {
  if (config.skipDataUpdate) {
    console.log('Data update is disabled. Skipping...');
  }

  return config.skipDataUpdate;
};

const setConfigValueFromSsm = async (key: string) => {
  if (!configEnv) {
    throw new Error('Trying to load config from SSM, but CONFIG_ENVIRONMENT is not set');
  }
  if (!helplineShortCode) {
    throw new Error('Trying to load config from SSM, but HELPLINE_SHORT_CODE is not set');
  }

  if (!configOptions[key].ssmPath) return;

  if (process.env[configOptions[key].env]) {
    console.warn(
      `Trying to load config from SSM, but ${configOptions[key].env} is already set. Using env value instead.`,
    );
    setConfigValue(key, process.env[configOptions[key].env]);
    return;
  }

  setConfigValue(key, await getSsmParameter(configOptions[key].ssmPath!));
};

const setDefaultConfigValue = (key: string) => {
  const option = configOptions[key];

  if (option.default == null) {
    throw new Error(`Config value ${key} doesn't have a default value`);
  }
  setConfigValue(key, option.default);
};

const initConfigValue = async (key: string) => {
  const option = configOptions[key];

  if (shouldLoadFromSsm) {
    await setConfigValueFromSsm(key);
    return;
  }

  if (process.env[option.env]) {
    setConfigValue(key, process.env[option.env]);
    return;
  }

  setDefaultConfigValue(key);
};

export const initConfig = async () => {
  const promises = Object.keys(configOptions).map(async (key) => {
    await initConfigValue(key);
  });
  await Promise.all(promises);

  setConfigValue('skipDataUpdate', config.isProduction || config.isStaging);
};

Object.keys(configOptions).forEach((key) => {
  if (configOptions[key].default == null) return;

  setDefaultConfigValue(key);
});
