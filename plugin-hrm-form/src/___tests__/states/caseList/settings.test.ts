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
import { DateExistsCondition } from '../../../components/caseList/filters/dateFilters';
import { ListCasesSortBy, ListCasesSortDirection } from '../../../types/types';

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
