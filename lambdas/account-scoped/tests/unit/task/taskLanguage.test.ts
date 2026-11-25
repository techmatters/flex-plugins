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

import { getTaskLanguage } from '../../../src/task/taskLanguage';

describe('getTaskLanguage', () => {
  test.each`
    taskLanguage | helplineLanguage | expected
    ${'es-MX'}   | ${'en-CA'}       | ${'es-MX'}
    ${undefined} | ${'en-CA'}       | ${'en-CA'}
    ${''}        | ${'en-CA'}       | ${'en-CA'}
    ${undefined} | ${undefined}     | ${'en-US'}
  `(
    'task language $taskLanguage, helpline language $helplineLanguage - returns $expected',
    ({ taskLanguage, helplineLanguage, expected }) => {
      expect(getTaskLanguage(helplineLanguage)({ language: taskLanguage })).toBe(
        expected,
      );
    },
  );
});
