/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { handler } from './index';
process.env.NODE_ENV = process.argv[3] || process.env.NODE_ENV || 'development';
const shortRegion = (process.env.AWS_REGION || 'us-east-1').split('-')[0];
process.env.HRM_URL = `https://hrm-${process.env.NODE_ENV}${shortRegion === 'us' ? '' : `-${shortRegion}`}.tl.techmatters.org`;
// Entry point for simulating a lambda test run locally
handler({
  testFilter: process.argv[2],
  jestPathOverride: '../../node_modules/jest/bin/jest.js',
}).catch(err => {
  console.error(err);
});
