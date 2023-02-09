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

import { updateCaseListFilter, updatedFilterReducer } from '../../../states/caseList/settings';
import { DateExistsCondition } from '../../../components/caseList/filters/dateFilters';
import { ListCasesSortBy, ListCasesSortDirection } from '../../../types/types';
import {
  closeCaseDetails,
  closeCaseDetailsReducer,
  fetchCaseListError,
  fetchCaseListErrorReducer,
  fetchCaseListStarted,
  fetchCaseListStartReducer,
  fetchCaseListSuccess,
  fetchCaseListSuccessReducer,
  openCaseDetails,
  openCaseDetailsReducer,
} from '../../../states/caseList/listContent';

test('fetchCaseListStartReducer - Patches existing filter state with action payload and resets page to zero', () => {
  const updatedState = fetchCaseListStartReducer(
    {
      listLoading: false,
      fetchError: undefined,
      caseList: [],
      caseCount: 1337,
      caseDetailsOpen: true,
    },
    fetchCaseListStarted(),
  );
  expect(updatedState).toStrictEqual({
    listLoading: true,
    fetchError: undefined,
    caseList: [],
    caseCount: 1337,
    caseDetailsOpen: true,
  });
});

test('fetchListSuccessReducer - Sets caseList and caseCount from payload, and clears errors and loading flag', () => {
  const updatedState = fetchCaseListSuccessReducer(
    {
      listLoading: true,
      fetchError: {},
      caseList: [],
      caseCount: 1337,
      caseDetailsOpen: true,
    },
    fetchCaseListSuccess([<any>{}, <any>{}], 42),
  );
  expect(updatedState).toStrictEqual({
    listLoading: false,
    fetchError: undefined,
    caseList: [{}, {}],
    caseCount: 42,
    caseDetailsOpen: true,
  });
});

test('fetchListErrorReducer - Sets error from payload, and clears the loading flag', () => {
  const updatedState = fetchCaseListErrorReducer(
    {
      listLoading: true,
      fetchError: undefined,
      caseList: [<any>{}, <any>{}],
      caseCount: 1337,
      caseDetailsOpen: true,
    },
    fetchCaseListError({}),
  );
  expect(updatedState).toStrictEqual({
    listLoading: false,
    fetchError: {},
    caseList: [{}, {}],
    caseCount: 1337,
    caseDetailsOpen: true,
  });
});

test('openCaseDetailsReducer - Sets caseDetailsOpen to true', () => {
  const updatedState = openCaseDetailsReducer(
    {
      listLoading: false,
      fetchError: undefined,
      caseList: [],
      caseCount: 1337,
      caseDetailsOpen: false,
    },
    openCaseDetails(),
  );
  expect(updatedState).toStrictEqual({
    listLoading: false,
    fetchError: undefined,
    caseList: [],
    caseCount: 1337,
    caseDetailsOpen: true,
  });
});

test('closeCaseDetailsReducer - Sets caseDetailsOpen to false', () => {
  const updatedState = closeCaseDetailsReducer(
    {
      listLoading: false,
      fetchError: undefined,
      caseList: [],
      caseCount: 1337,
      caseDetailsOpen: true,
    },
    closeCaseDetails(),
  );
  expect(updatedState).toStrictEqual({
    listLoading: false,
    fetchError: undefined,
    caseList: [],
    caseCount: 1337,
    caseDetailsOpen: false,
  });
});
