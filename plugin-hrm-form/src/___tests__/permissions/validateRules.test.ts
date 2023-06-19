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
import each from 'jest-each';

import { actionsMaps, validateRules } from '../../permissions';

const rulesMapNames = [
  'br',
  'ca',
  'cl',
  'co',
  'et',
  'hu',
  'in',
  'jm',
  'mt',
  'mw',
  'nz',
  'ph',
  'pl',
  'ro',
  'th',
  'uk',
  'za',
  'zm',
  'zw',
  'demo',
  'dev',
  'e2e',
];

describe('Permissions  files are valid', () => {
  const testCases = rulesMapNames.flatMap(name => Object.keys(actionsMaps).map(kind => ({ name, kind })));
  each(testCases).test('$name file is valid', ({ name, kind }) => {
    expect(() => validateRules(name, kind)).not.toThrow();
  });
});
