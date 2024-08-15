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

// For rapidly running non flex UI dependent tests locally
const { defaults } = require('jest-config');

module.exports = (config) => {
  return (
    config || {
      ...defaults,
      rootDir: './src',
      // Only run tests in files that end in .test.ts or .spec.ts AND are under the __tests__ directory
      testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"]
    }
  );
};
