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

const helplineEnv = process.env.HL_ENV || 'local';
const helplineShortCode = process.env.HL || 'as';
const shouldLoadFromSsm = process.env.LOAD_SSM_CONFIG && process.env.LOAD_SSM_CONFIG !== 'false';

const skipDataUpdateEnvs = ['staging', 'production'];
const flexEnvs = ['development', 'staging', 'production'];

const configOptions: ConfigOptions = {
  helplineShortCode: {
    env: 'HL',
    default: helplineShortCode,
  },
  helplineEnv: {
    env: 'HL_ENV',
    default: helplineEnv,
  },
  oktaUsername: {
    env: 'PLAYWRIGHT_USER_USERNAME',
    ssmPath: `/${helplineEnv}/flex-plugins/e2e/okta_username`,
  },
  oktaPassword: {
    env: 'PLAYWRIGHT_USER_PASSWORD',
    ssmPath: `/${helplineEnv}/flex-plugins/e2e/okta_password`,
  },
  baseURL: {
    env: 'PLAYWRIGHT_BASEURL',
    default: flexEnvs.includes(helplineEnv) ? 'https://flex.twilio.com/' : 'http://localhost:3000',
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
    ssmPath: `/${helplineEnv}/twilio/${helplineShortCode.toUpperCase()}/account_sid`,
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
    default: helplineEnv === 'production',
  },
  isStaging: {
    env: 'IS_STAGING',
    default: helplineEnv === 'staging',
  },
  isDevelopment: {
    env: 'IS_DEVELOPMENT',
    default: helplineEnv === 'staging',
  },
  skipDataUpdate: {
    env: 'SKIP_DATA_UPDATE',
    default: skipDataUpdateEnvs.includes(helplineEnv),
  },
};

export const config: Config = {};

export const getConfigValue = (key: string) => {
  if (config[key] == null) {
    throw new Error(`Config value ${key} is not set`);
  }

  return config[key];
};

export const setConfigValue = (key: string, value: ConfigValue) => {
  config[key] = value;
  // This probably seems weird, and it is. Playwright doesn't run in a
  // single process, so we can't just set a global variable. Instead,
  // we depend on environment variables to be the source of truth.
  // When we explicitly set a config value, we also set the environment
  // which will be always be the first source loaded when attempting to
  // init a config value.
  process.env[configOptions[key].env] = value as string;
};

export const shouldSkipDataUpdate = () => {
  if (config.skipDataUpdate) {
    console.log('Data update is disabled. Skipping...');
  }

  return config.skipDataUpdate;
};

const setConfigValueFromSsm = async (key: string) => {
  if (!configOptions[key].ssmPath) return;

  // If we have a value in the environment, we don't want to load from SSM
  if (process.env[configOptions[key].env]) {
    setConfigValue(key, process.env[configOptions[key].env]);
    return;
  }

  setConfigValue(key, await getSsmParameter(configOptions[key].ssmPath!));
};

const initSsmConfigValues = async () => {
  if (!shouldLoadFromSsm) return;
  if (!helplineEnv) {
    throw new Error('Trying to load config from SSM, but CONFIG_ENVIRONMENT is not set');
  }
  if (!helplineShortCode) {
    throw new Error('Trying to load config from SSM, but HELPLINE_SHORT_CODE is not set');
  }

  const promises = Object.keys(configOptions).map(async (key) => {
    await setConfigValueFromSsm(key);
  });
  await Promise.all(promises);
};

// Loading config from SSM is async, so we need to provide a way for it to be
// initialized before we can use it. This is a bit of a hack, but it works.
// We call this once in global-setup and it populates ENV vars which are then used
// to initialize the config values via initStaticConfigValues on subsequent runs.
export const initConfig = async () => {
  await initSsmConfigValues();
};

const initStaticConfigValue = (key: string) => {
  const option = configOptions[key];

  // If we have a value in the environment, use that since it is the source of truth
  if (process.env[option.env]) {
    setConfigValue(key, process.env[option.env]);
    return;
  }

  if (option.default == null) return;
  setConfigValue(key, option.default);
};

const initStaticConfigValues = () => {
  dotenv.config();
  Object.keys(configOptions).forEach((key) => {
    initStaticConfigValue(key);
  });
};

initStaticConfigValues();
