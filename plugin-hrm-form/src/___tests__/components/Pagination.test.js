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

import React from 'react';
import renderer from 'react-test-renderer';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { range } from 'lodash';

import HrmTheme from '../../styles/HrmTheme';
import { PaginationButton } from '../../components/pagination/styles';
import Pagination, { getPaginationNumbers } from '../../components/pagination';

const themeConf = {
  colorTheme: HrmTheme,
};

test('getPaginationNumbers', async () => {
  range(1, 12).forEach(n => {
    expect(getPaginationNumbers(0, n)).toStrictEqual(range(0, n));
  });

  range(12, 100).forEach(n => {
    expect(getPaginationNumbers(0, n)).toStrictEqual([...range(0, 9), -1, n - 2, n - 1]);
  });

  range(12, 100).forEach(n => {
    range(1, 6).forEach(x => {
      expect(getPaginationNumbers(n - x, n)).toStrictEqual([0, 1, -1, ...range(n - 9, n)]);
    });
  });

  range(0, 7).forEach(n => {
    expect(getPaginationNumbers(n, 10)).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(getPaginationNumbers(n, 20)).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, -1, 18, 19]);
    expect(getPaginationNumbers(n, 100)).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, -1, 98, 99]);
  });

  range(7, 93).forEach(n => {
    if (n < 10) expect(getPaginationNumbers(n, 10)).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    if (n < 14) expect(getPaginationNumbers(n, 20)).toStrictEqual([0, 1, -1, ...range(n - 3, n + 4), -1, 18, 19]);
    if (n >= 14 && n < 20)
      expect(getPaginationNumbers(n, 20)).toStrictEqual([0, 1, -1, 11, 12, 13, 14, 15, 16, 17, 18, 19]);

    if (n < 94) expect(getPaginationNumbers(n, 100)).toStrictEqual([0, 1, -1, ...range(n - 3, n + 4), -1, 98, 99]);
    if (n >= 94 && n < 100)
      expect(getPaginationNumbers(n, 100)).toStrictEqual([0, 1, -1, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
  });
});

describe('Pagination', () => {
  test('page 1/20', async () => {
    const component = renderer.create(
      <StorelessThemeProvider themeConf={themeConf}>
        <Pagination page={0} pagesCount={20} handleChangePage={n => console.log(`pressed${n}`)} />
      </StorelessThemeProvider>,
    ).root;

    expect(() => component.findAllByType(PaginationButton)).not.toThrow();
    expect(component.findAllByType(PaginationButton)).toHaveLength(11);
  });

  test('page 10/20', async () => {
    const component = renderer.create(
      <StorelessThemeProvider themeConf={themeConf}>
        <Pagination page={10} pagesCount={20} handleChangePage={n => console.log(`pressed${n}`)} />
      </StorelessThemeProvider>,
    ).root;

    expect(() => component.findAllByType(PaginationButton)).not.toThrow();
    expect(component.findAllByType(PaginationButton)).toHaveLength(11);
  });

  test('page 20/20', async () => {
    const component = renderer.create(
      <StorelessThemeProvider themeConf={themeConf}>
        <Pagination page={20} pagesCount={20} handleChangePage={n => console.log(`pressed${n}`)} />
      </StorelessThemeProvider>,
    ).root;

    expect(() => component.findAllByType(PaginationButton)).not.toThrow();
    expect(component.findAllByType(PaginationButton)).toHaveLength(11);
  });
});
