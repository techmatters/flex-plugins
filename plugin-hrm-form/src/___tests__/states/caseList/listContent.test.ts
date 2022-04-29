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
