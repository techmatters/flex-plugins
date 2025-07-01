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

import { formatName, formatAddress, formatDuration, formatCategories } from '../../utils/formatters';

test('Test name formatter', () => {
  const name = 'Some name';
  const expectName = formatName(name);
  const expectUnknown = formatName(' ');

  expect(expectName).toEqual(name);
  expect(expectUnknown).toEqual('Unknown');
});

test('Test address formatter', () => {
  const addr1 = ['Street', 'City', 'State', 'CP'];
  const expectedAddr1 = 'Street, City, State CP';
  const formattedAddr1 = formatAddress(addr1[0], addr1[1], addr1[2], addr1[3]);

  const addr2 = ['', 'City', 'State', ''];
  const expectedAddr2 = 'City, State';
  const formattedAddr2 = formatAddress(addr2[0], addr2[1], addr2[2], addr2[3]);

  const addr3 = ['', '', '', ''];
  const expectedAddr3 = '';
  const formattedAddr3 = formatAddress(addr3[0], addr3[1], addr3[2], addr3[3]);

  expect(formattedAddr1).toEqual(expectedAddr1);
  expect(formattedAddr2).toEqual(expectedAddr2);
  expect(formattedAddr3).toEqual(expectedAddr3);
});

test('Test conversation duration formatter', () => {
  const duration1 = 42;
  const expectedDuration1 = '42s';
  const formattedDuration1 = formatDuration(duration1);

  const duration2 = 1449;
  const expectedDuration2 = '24m 9s';
  const formattedDuration2 = formatDuration(duration2);

  const duration3 = 4320;
  const expectedDuration3 = '1h 12m 0s';
  const formattedDuration3 = formatDuration(duration3);

  const duration4 = 36729;
  const expectedDuration4 = '10h 12m 9s';
  const formattedDuration4 = formatDuration(duration4);

  expect(formattedDuration1).toEqual(expectedDuration1);
  expect(formattedDuration2).toEqual(expectedDuration2);
  expect(formattedDuration3).toEqual(expectedDuration3);
  expect(formattedDuration4).toEqual(expectedDuration4);
});

describe('test formatCategories', () => {
  test('with 1 category, 1 subcategory', async () => {
    const categories = {
      category1: ['something'],
    };

    const result = formatCategories(categories);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('something');
  });

  test('with 1 category, 2 subcategories', async () => {
    const categories = {
      category1: ['something', 'another'],
    };

    const result = formatCategories(categories);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe('something');
    expect(result[1]).toBe('another');
  });

  test('with 1 category, 3 subcategories', async () => {
    const categories = {
      category1: ['something', 'another', 'and more'],
    };

    const result = formatCategories(categories);

    expect(result).toHaveLength(3);
    expect(result[0]).toBe('something');
    expect(result[1]).toBe('another');
    expect(result[2]).toBe('and more');
  });

  test('with 2 categories, 2 subcategories', async () => {
    const categories = {
      category1: ['something'],
      category2: ['another'],
    };

    const result = formatCategories(categories);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe('something');
    expect(result[1]).toBe('another');
  });

  test('with 2 categories, 3 subcategories', async () => {
    const categories = {
      category1: ['something'],
      category2: ['another', 'and more'],
    };

    const result = formatCategories(categories);

    expect(result).toHaveLength(3);
    expect(result[0]).toBe('something');
    expect(result[1]).toBe('another');
    expect(result[2]).toBe('and more');
  });

  test('test with "Unspecified/Other" subcategories', async () => {
    const categories = {
      category1: ['Unspecified/Other'],
      category2: ['Unspecified/Other'],
    };

    const result = formatCategories(categories);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe('Unspecified/Other - category1');
    expect(result[1]).toBe('Unspecified/Other - category2');
  });
});
