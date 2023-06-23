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
  env: string; // The name of the env var to use
  ssmPath?: string; // The optional path to the ssm param to use
  default?: ConfigValue; // The optional default value to use
};

export type ConfigOptions = {
  [key: string]: ConfigOption;
};

export type ConfigValue = boolean | string | undefined;

export type Config = {
  [key: string]: ConfigValue;
};

const helplineShortCode = process.env.HL?.toLocaleLowerCase() || 'e2e';
const helplineEnv = process.env.HL_ENV?.toLocaleLowerCase() || 'local';
const shouldLoadFromSsm = process.env.LOAD_SSM_CONFIG && process.env.LOAD_SSM_CONFIG !== 'false';

// These are environments where we want to avoid actually updating HRM data
const skipDataUpdateEnvs = ['staging', 'production'];

// These are environments where we want to hit remote flex instead of localhost
const flexEnvs = ['development', 'staging', 'production'];

// This is kindof a hack to get the correct default remote webchat url for the local env
const webchatUrlEnv = helplineEnv == 'local' ? 'development' : helplineEnv;

/**
 * The config options config is the heart of the dynamic configuration system.
 *
 * The order of precedence for config values is:
 * 1. Explicit env vars
 * 2. .env file via dotenv
 * 3. SSM parameters
 *
 * The HL settings are an outlier to the normal default pattern because they are
 * used in the config itself. We use the vars we set earlier as the default to keep
 * the default dry instead of duplicating the values here.
 */
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
  webchatUrl: {
    env: 'WEBCHAT_URL',
    // In this case there is a default and an ssmPath. The default will be used if the ssmPath does not exist.
    // This will allow us to override the default for production tests if needed.
    default: `https://assets-${webchatUrlEnv}.tl.techmatters.org/webchat/${helplineShortCode}/e2e-chat.html`,
  },
};

export const config: Config = {};

export const getConfigValue = (key: string) => {
  // We assume all config values are required for now
  if (config[key] == null) {
    throw new Error(`Config value ${key} is not set`);
  }

  return config[key];
};

export const setConfigValue = (key: string, value: ConfigValue) => {
  let typedValue: ConfigValue = value;

  // Handle correctly converting boolean values from environment variable strings
  if (value === 'true') {
    typedValue = true;
  } else if (value === 'false') {
    typedValue = false;
  }
  config[key] = typedValue;

  /**
   * This probably seems weird, and it is. Playwright doesn't run in a
   * single process, so we can't just set a global variable. Instead,
   * we depend on environment variables to be the global source of truth
   * and to help us to only load SSM values once.
   * When we explicitly set a config value, we also set the env var
   * which will be always be the first source loaded when attempting to
   * init a config value.
   */
  process.env[configOptions[key].env] = value as string;
};

export const shouldSkipDataUpdate = () => {
  if (config.skipDataUpdate) {
    console.log('Data update is disabled. Skipping...');
  }

  return config.skipDataUpdate as boolean;
};

const setConfigValueFromSsm = async (key: string) => {
  const option = configOptions[key];
  if (!option.ssmPath) return;

  const envValue = process.env[option.env];

  // If we have a value in the environment and it is not the default, we don't want/need to load from SSM
  if (envValue && envValue !== option.default) {
    setConfigValue(key, process.env[option.env]);
    return;
  }

  try {
    setConfigValue(key, await getSsmParameter(option.ssmPath!));
  } catch (err) {
    if (!option.default) {
      throw err;
    }

    console.log(`Failed to load config value from SSM at ${option.ssmPath}. Using default value`);
  }
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

/**
 * Loading config from SSM is async, so we need to provide a way for it to be
 * initialized before we can use it. This is a bit of a hack, but it works.
 * We call this once in global-setup and it populates ENV vars which are then used
 * to initialize the config values via initStaticConfigValues on subsequent runs.
 */
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
