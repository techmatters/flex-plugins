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

/**
 * This file MUST be plain JS.
 */

var accountSid = 'AC...';

var appConfig = {
  pluginService: {
    enabled: true,
    url: './plugins.json',
  },
  sso: {
    accountSid,
  },
  ytica: false,
  logLevel: 'debug',
  showSupervisorDesktopView: true,
  serviceBaseUrl: 'wine-lyrebird-1400.twil.io', // as dev
  // insights: {
  //   analyticsUrl: 'http://localhost:3008'
  // },
};
