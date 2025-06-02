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
  // The name of the env var for this config option
  envKey: string;

  // An optional path to the ssm param to load this config option from. A function
  // can be used to dynamically generate the path based on other config values
  ssmPath?: string | (() => string);

  // The optional default value to use if no env var or ssm param is present A function
  // can be used to dynamically generate the default based on other config values
  default?: ConfigValue | (() => ConfigValue);
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

// These are environments where we want to avoid tests or steps that update HRM data
const skipDataUpdateEnvs = ['staging', 'production'];

// These are environments where we want to hit remote flex instead of localhost
const flexEnvs = ['development', 'staging', 'production'];

// This is kindof a hack to get the correct default remote webchat url and twilio account info for the local env
export const localOverrideEnv = helplineEnv == 'local' ? 'development' : helplineEnv;

export const config: Config = {};

export const getConfigValue = (key: string) => {
  // We assume all config values are required for now
  if (config[key] == null) {
    throw new Error(`Config value ${key} is not set`);
  }

  return config[key];
};

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
  // The helpline short code is used to generate the ssm param paths for the other config options
  helplineShortCode: {
    envKey: 'HL',
    default: helplineShortCode,
  },

  // The helpline env is used to generate the ssm param paths for the other config options
  helplineEnv: {
    envKey: 'HL_ENV',
    default: helplineEnv,
  },

  // The okta username and password are used to login to flex
  oktaUsername: {
    envKey: 'PLAYWRIGHT_USER_USERNAME',
    ssmPath: `/${helplineEnv}/flex-plugins/e2e/okta_username`,
  },
  oktaPassword: {
    envKey: 'PLAYWRIGHT_USER_PASSWORD',
    ssmPath: `/${helplineEnv}/flex-plugins/e2e/okta_password`,
  },

  // The baseUrl is used to navigate to the flex app
  baseURL: {
    envKey: 'PLAYWRIGHT_BASEURL',
    default: flexEnvs.includes(helplineEnv) ? 'https://flex.twilio.com/' : 'http://localhost:3000',
  },

  // The telemetry level is used to configure our logging
  browserTelemetryLevel: {
    envKey: 'PLAYWRIGHT_BROWSER_TELEMETRY_LEVEL',
    default: 'errors',
  },

  // The browser telemetry log response body is used to configure the verbosity of our browser logs
  browserTelemetryLogResponseBody: {
    envKey: 'PLAYWRIGHT_BROWSER_TELEMETRY_LOG_RESPONSE_BODY',
    default: 'false',
  },

  // This allows us to disable browser telemetry logging
  browserTelemetryDisabled: {
    envKey: 'PLAYWRIGHT_BROWSER_TELEMETRY_DISABLED',
    default: 'false',
  },

  // The twilio account sid and auth token are used to target a flex account
  twilioAccountSid: {
    envKey: 'TWILIO_ACCOUNT_SID',
    ssmPath: `/${localOverrideEnv}/twilio/${helplineShortCode.toUpperCase()}/account_sid`,
    default: 'AC_FAKE_UI_TEST_ACCOUNT',
  },
  twilioAuthToken: {
    envKey: 'TWILIO_AUTH_TOKEN',
    // Order is important here. We use a function so that we can reference the twilioAccountSid config value above.
    ssmPath: () => `/${localOverrideEnv}/twilio/${getConfigValue('twilioAccountSid')}/auth_token`,
  },

  // Turn on debug mode. Possibly unused.
  debug: {
    envKey: 'DEBUG',
    default: '',
  },

  // These are internal environment switches.
  isProduction: {
    envKey: 'IS_PRODUCTION',
    default: helplineEnv === 'production',
  },
  isStaging: {
    envKey: 'IS_STAGING',
    default: helplineEnv === 'staging',
  },
  isDevelopment: {
    envKey: 'IS_DEVELOPMENT',
    default: helplineEnv === 'staging',
  },

  // We can skip data updates in certain environments to keep from impacting real data
  skipDataUpdate: {
    envKey: 'SKIP_DATA_UPDATE',
    default: skipDataUpdateEnvs.includes(helplineEnv),
  },

  // The url of the webchat app is used to navigate to the webchat app
  webchatUrl: {
    envKey: 'WEBCHAT_URL',
    // In this case there is a default and an ssmPath. The default will be used if the ssmPath does not exist.
    // This will allow us to override the default for production tests if needed. We use the direct s3 url for
    // the assets bucket because we don't want to deal with CloudFront caching issues.
    default: `https://s3.amazonaws.com/assets-${localOverrideEnv}.tl.techmatters.org/webchat/${helplineShortCode}/e2e-chat.html`,
  },

  // inLambda is used to determine if we are running in a lambda or not and set other config values accordingly
  inLambda: {
    envKey: 'TEST_IN_LAMBDA',
    default: false,
  },

  // The storage state path is used to store the state of the browser between tests
  storageStatePath: {
    envKey: 'STORAGE_STATE_PATH',
    default: () => (getConfigValue('inLambda') ? '/tmp/state.json' : 'temp/state.json'),
  },

  // Specifying a test name will cause only the matching test file to be run.
  testName: {
    envKey: 'TEST_NAME',
    default: () => (getConfigValue('inLambda') ? 'login' : ''),
  },

  hrmRoot: {
    envKey: 'HRM_ROOT',
    default: '', // Default cannot be set up front due to the account sid might not calculated.
  },

  legacyOktaSso: {
    envKey: 'LEGACY_OKTA_SSO',
    ssmPath: () => `/${localOverrideEnv}/twilio/${getConfigValue('twilioAccountSid')}/legacy_sso`,
    default: 'false',
  },
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
  process.env[configOptions[key].envKey] = value as string;
};

const setConfigValueFromSsm = async (key: string) => {
  const option = configOptions[key];
  if (!option.ssmPath) return;

  const envValue = process.env[option.envKey];

  // If we have a value in the environment and it is not the default, we don't want/need to load from SSM
  if (envValue && envValue !== option.default) {
    setConfigValue(key, process.env[option.envKey]);
    return;
  }

  const ssmPath = typeof option.ssmPath === 'function' ? option.ssmPath() : option.ssmPath;
  try {
    setConfigValue(key, await getSsmParameter(ssmPath));
  } catch (err) {
    if (!option.default) {
      console.error(
        `Failed to load config value from SSM at ${ssmPath}. No default value provided`,
      );
      throw err;
    }

    console.log(`Failed to load config value from SSM at ${option.ssmPath}. Using default value`);

    setConfigValue(key, typeof option.default === 'function' ? option.default() : option.default);
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

  // This must be done in series because some config options depend on others
  for (const key of Object.keys(configOptions)) {
    await setConfigValueFromSsm(key);
  }
};

/**
 * Loading config from SSM is async, so we need to provide a way for it to be
 * initialized before we can use it. This is a bit of a hack, but it works.
 * We call this once in global-setup and it populates ENV vars which are then used
 * to initialize the config values via initStaticConfigValues when subsequent test
 * processes include this file.
 */
export const initConfig = async () => {
  await initSsmConfigValues();
};

const initStaticConfigValue = (key: string) => {
  const option = configOptions[key];

  // If we have a value in the environment, use that since it is the source of truth
  if (process.env[option.envKey]) {
    setConfigValue(key, process.env[option.envKey]);
    return;
  }

  if (option.default == null) return;

  const defaultValue = typeof option.default === 'function' ? option.default() : option.default;
  setConfigValue(key, defaultValue);
};

const initStaticConfigValues = () => {
  dotenv.config();
  Object.keys(configOptions).forEach((key) => {
    initStaticConfigValue(key);
  });
};

initStaticConfigValues();
