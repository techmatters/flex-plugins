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
const clientId = '__TWILIO_CLIENT_ID__';
const connection = '__TWILIO_CONNECTION__';

/*
 * set to /plugins.json for local dev
 * set to /plugins.local.build.json for testing your build
 * set to "" for the default live plugin loader
 */
const pluginServiceUrl = '/plugins';

const appConfig = {
  pluginService: {
    enabled: true,
    url: pluginServiceUrl,
    initializationTimeout: 1,
  },
  sso: {
    accountSid,
  },
  oauth: {
    connection,
    clientId,
    redirectUrl: 'http://localhost:3000',
  },
  ytica: false,
  logLevel: 'debug',
  showSupervisorDesktopView: true,
};
