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

const fs = require('fs');

/**
 * Checks that MODE var is 'development' or 'production'.
 * Otherwise, throws an error.
 * @param {string} mode
 */
function checkMODE(mode) {
  const isModeSet = mode === 'development' || mode === 'production';

  if (!isModeSet) {
    throw new Error('Please set env var MODE to development or production');
  }
}

/**
 * Checks that CONFIG var corresponds to an existing file, and copies it to /src'.
 * Otherwise, throws an error.
 * @param {string} config
 */
function setConfigFile(config) {
  const src = `configurations/${config}.ts`;
  if (fs.existsSync(src)) {
    fs.copyFile(src, `src/config.ts`, (error) => {
      if (error) {
        throw error;
      } else {
        console.log(`src/config.ts filled with config file ${config}`);
      }
    });
  } else {
    throw new Error(`file config for ${config} not found!`);
  }
}

module.exports = {
  checkMODE,
  setConfigFile,
};
