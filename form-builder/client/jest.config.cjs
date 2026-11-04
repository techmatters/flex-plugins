/**
 * Copyright (C) 2021-2026 Technology Matters
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

/** The client's tests (npm test). UI tests say so with a @jest-environment jsdom docblock. */
const path = require('path');
const { hrmFormDefinitionsSrc } = require('./build-tools/hrmFormDefinitions.cjs');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  // The UI tests render whole editors; with every test file running at once, some take a while
  testTimeout: 20_000,
  setupFiles: ['<rootDir>/jest/setup.cjs'],
  resolver: '<rootDir>/jest/resolver.cjs',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/styleStub.cjs',
    '/FeatureFlags\\.ts\\?raw$': '<rootDir>/jest/featureFlagsSource.cjs',
    '^@hrm-form-definitions/(.*)$': `${hrmFormDefinitionsSrc.split(path.sep).join('/')}/$1`,
  },
  transform: { '\\.[jt]sx?$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel.config.cjs') }] },
};
