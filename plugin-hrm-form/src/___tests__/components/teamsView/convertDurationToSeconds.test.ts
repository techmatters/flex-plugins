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
import { convertDurationToSeconds } from '../../../components/teamsView/teamsViewSorting';

describe('convertDurationToSeconds should convert', () => {
  test('seconds', () => {
    const input = '59s';
    const expected = 59;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('minutes and seconds with :', () => {
    const input = '59:59';
    const expected = 59 * 60 + 59;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('hours', () => {
    const input = '23h';
    const expected = 23 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('hours and minutes', () => {
    const input = '23h 59min';
    const expected = 23 * 60 * 60 + 59 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('days', () => {
    const input = '59d';
    const expected = 59 * 24 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('days and hours', () => {
    const input = '5d 3h';
    const expected = 5 * 24 * 60 * 60 + 3 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });

  test('more than 30 days', () => {
    const input = '30+d';
    const expected = 30 * 24 * 60 * 60;
    expect(convertDurationToSeconds(input)).toEqual(expected);
  });
});
