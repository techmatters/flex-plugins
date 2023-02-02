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

// your account sid
const accountSid = '__TWILIO_ACCOUNT_SID__';

/*
 * set to /plugins.json for local dev
 * set to /plugins.local.build.json for testing your build
 * set to "" for the default live plugin loader
 */
const pluginServiceUrl = '/plugins.json';

const appConfig = {
  pluginService: {
    enabled: true,
    url: pluginServiceUrl,
    // If this is not set flex waits for 10 seconds between running plugin init() and rendering components :-/
    initializationTimeout: 1,
  },
  sso: {
    accountSid,
  },
  ytica: false,
  logLevel: 'debug',
  showSupervisorDesktopView: true,
};
