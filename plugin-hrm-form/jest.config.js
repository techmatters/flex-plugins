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

// NOTE: seems like this ain't used at all, can we just delete it?
module.exports = (config, { isProd, isDev, isTest }) => {
  config.transformIgnorePatterns = ['/node_modules/(?!wavesurfer.js)'];
  config.testEnvironment = 'jsdom';
  config.testURL = 'http://localhost/';
  // config.testEnvironmentOptions = {};
  return config;
};
