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

import { addDays } from 'date-fns';

import {
  clearCaseListFilter,
  clearFilterReducer,
  updateCaseListFilter,
  updateCaseListPage,
  updateCaseListSort,
  updatedFilterReducer,
  updatedPageReducer,
  updatedSortReducer,
} from '../../../states/caseList/settings';
import { ListCasesSortBy, ListCasesSortDirection } from '../../../types/types';
import { DateExistsCondition } from '../../../states/caseList/dateFilters';

const baselineDate = new Date(2012, 11, 3);

test('updatedFilterReducer - Patches existing filter state with action payload and resets page to zero', () => {
  const updatedState = updatedFilterReducer(
    {
      filter: {
        counsellors: ['something'],
        statuses: [],
        categories: [{ category: 'Violence', subcategory: 'Bullying' }],
        createdAt: { option: 'B', to: baselineDate },
        followUpDate: { option: 'A', exists: DateExistsCondition.MUST_NOT_EXIST },
        includeOrphans: false,
      },
      page: 1337,
      sort: {
        sortBy: ListCasesSortBy.CHILD_NAME,
        sortDirection: ListCasesSortDirection.DESC,
      },
    },
    updateCaseListFilter({
      counsellors: ['another', 'thing'],
      categories: [{ category: 'Missing children', subcategory: 'Child abduction' }],
      updatedAt: { option: 'D', from: baselineDate, to: addDays(baselineDate, 1) },
      followUpDate: { option: 'C', from: baselineDate },
      createdAt: undefined,
    }),
  );
  expect(updatedState).toStrictEqual({
    filter: {
      counsellors: ['another', 'thing'],
      statuses: [],
      categories: [{ category: 'Missing children', subcategory: 'Child abduction' }],
      createdAt: undefined,
      updatedAt: { option: 'D', from: baselineDate, to: addDays(baselineDate, 1) },
      followUpDate: { option: 'C', from: baselineDate },
      includeOrphans: false,
    },
    page: 0,
    sort: {
      sortBy: ListCasesSortBy.CHILD_NAME,
      sortDirection: ListCasesSortDirection.DESC,
    },
  });
});

test('updatedSortReducer - Replaces sort settings and resets page to zero', () => {
  const updatedState = updatedSortReducer(
    {
      filter: {
        counsellors: ['something'],
        statuses: [],
        createdAt: { option: 'B', to: baselineDate },
        followUpDate: { option: 'A', exists: DateExistsCondition.MUST_NOT_EXIST },
        includeOrphans: false,
      },
      page: 1337,
      sort: {
        sortBy: ListCasesSortBy.CHILD_NAME,
        sortDirection: ListCasesSortDirection.DESC,
      },
    },
    updateCaseListSort({
      sortBy: ListCasesSortBy.FOLLOW_UP_DATE,
      sortDirection: ListCasesSortDirection.ASC,
    }),
  );
  expect(updatedState).toStrictEqual({
    filter: {
      counsellors: ['something'],
      statuses: [],
      createdAt: { option: 'B', to: baselineDate },
      followUpDate: { option: 'A', exists: DateExistsCondition.MUST_NOT_EXIST },
      includeOrphans: false,
    },
    page: 0,
    sort: {
      sortBy: ListCasesSortBy.FOLLOW_UP_DATE,
      sortDirection: ListCasesSortDirection.ASC,
    },
  });
});

test('updatePageReducer - Replaces page setting', () => {
  const updatedState = updatedPageReducer(
    {
      filter: {
        counsellors: ['something'],
        statuses: [],
        createdAt: { option: 'B', to: baselineDate },
        followUpDate: { option: 'A', exists: DateExistsCondition.MUST_NOT_EXIST },
        includeOrphans: false,
      },
      page: 1337,
      sort: {
        sortBy: ListCasesSortBy.CHILD_NAME,
        sortDirection: ListCasesSortDirection.DESC,
      },
    },
    updateCaseListPage(42),
  );
  expect(updatedState).toStrictEqual({
    filter: {
      counsellors: ['something'],
      statuses: [],
      createdAt: { option: 'B', to: baselineDate },
      followUpDate: { option: 'A', exists: DateExistsCondition.MUST_NOT_EXIST },
      includeOrphans: false,
    },
    page: 42,
    sort: {
      sortBy: ListCasesSortBy.CHILD_NAME,
      sortDirection: ListCasesSortDirection.DESC,
    },
  });
});

test('clearFilterReducer - Replaces filter settings with defaults and resets page to zero', () => {
  const updatedState = clearFilterReducer(
    {
      filter: {
        counsellors: ['something'],
        statuses: [],
        createdAt: { option: 'B', to: baselineDate },
        followUpDate: { option: 'A', exists: DateExistsCondition.MUST_NOT_EXIST },
        includeOrphans: false,
      },
      page: 1337,
      sort: {
        sortBy: ListCasesSortBy.CHILD_NAME,
        sortDirection: ListCasesSortDirection.DESC,
      },
    },
    clearCaseListFilter(),
  );
  expect(updatedState).toStrictEqual({
    filter: {
      counsellors: [],
      statuses: [],
      categories: [],
      includeOrphans: false,
    },
    page: 0,
    sort: {
      sortBy: ListCasesSortBy.CHILD_NAME,
      sortDirection: ListCasesSortDirection.DESC,
    },
  });
});
