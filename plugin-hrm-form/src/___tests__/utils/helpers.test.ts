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

import { splitDate, splitTime, getDateTime } from '../../utils/helpers';

test('splitDate', () => {
  expect(splitDate('1-1-1')).toEqual([1, 1, 1]);
  expect(splitDate('10-10-10')).toEqual([10, 10, 10]);

  expect(splitDate('-10-12')).toEqual([NaN, 10, 12]);
  expect(splitDate('2014--12')).toEqual([2014, NaN, 12]);
  expect(splitDate('2014-10-')).toEqual([2014, 10, NaN]);
});

test('splitTime', () => {
  expect(splitTime('1:1')).toEqual([1, 1]);
  expect(splitTime('10:10')).toEqual([10, 10]);

  expect(splitTime(':10')).toEqual([NaN, 10]);
  expect(splitTime('10:')).toEqual([10, NaN]);
});

test('getDateTime', () => {
  expect(getDateTime({ date: '2020-11-24', time: '12:00' })).toEqual(new Date(2020, 10, 24, 12, 0).getTime());
  expect(getDateTime({ date: '2021-06-24', time: '12:00' })).toEqual(new Date(2021, 5, 24, 12, 0).getTime());
  expect(getDateTime({ date: '2021-6-24', time: '12:00' })).toEqual(new Date(2021, 5, 24, 12, 0).getTime());

  // 2 ms of tolerance for the tests is enough so far
  expect(Date.now() - getDateTime({})).toBeLessThan(2);
  expect(Date.now() - getDateTime({ date: '2021-wrong- 24', time: '12:00' })).toBeLessThan(2);
  expect(Date.now() - getDateTime({ date: '2020-11-24', time: 'wrong' })).toBeLessThan(2);
});
