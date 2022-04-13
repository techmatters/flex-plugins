import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { getConfig } from '../../HrmFormPlugin';
import Case from '../case';
import {
  Case as CaseType,
  StandaloneITask,
  ListCasesQueryParams,
  ListCasesFilters,
  ListCasesSortBy,
  ListCasesSortDirection,
} from '../../types/types';
import CaseListTable from './CaseListTable';
import { CaseListContainer, CenteredContainer, SomethingWentWrongText } from '../../styles/caseList';
import { listCases } from '../../services/CaseService';
import { CaseLayout } from '../../styles/case';
import * as CaseActions from '../../states/case/actions';
import * as ConfigActions from '../../states/configuration/actions';
import { StandaloneSearchContainer } from '../../styles/search';
import { RootState, namespace, configurationBase } from '../../states';
import { getCasesMissingVersions } from '../../utils/definitionVersions';

export const CASES_PER_PAGE = 5;

type State = {
  loading: boolean;
  showCaseDetails: boolean;
  error: any;
  caseList: CaseType[];
  caseCount: number;
  page: number;
  queryParams: ListCasesQueryParams;
  filters: ListCasesFilters;
};

const initialState: State = {
  loading: true,
  showCaseDetails: false,
  error: null,
  caseList: [],
  caseCount: 0,
  page: 0,
  queryParams: {
    limit: CASES_PER_PAGE,
    offset: 0,
    sortBy: ListCasesSortBy.ID,
    sortDirection: ListCasesSortDirection.DESC,
  },
  filters: {
    counsellors: [],
    statuses: [],
  },
};

type CaseListActions =
  | { type: 'fetchStarted' }
  | {
      type: 'fetchSuccess';
      payload: { caseList: CaseType[]; caseCount: number };
    }
  | { type: 'fetchError'; payload: { error: any } }
  | { type: 'fetchUpdate'; payload: { caseList: CaseType[] } }
  | { type: 'showCaseDetails' }
  | { type: 'hideCaseDetails' }
  | { type: 'setPage'; payload: number }
  | { type: 'setQueryParams'; payload: ListCasesQueryParams }
  | { type: 'setFilters'; payload: ListCasesFilters };

function reducer(state: State, action: CaseListActions) {
  switch (action.type) {
    case 'fetchStarted':
      return { ...state, loading: true };
    // TODO: after this succeeds, we should check if there is a case such that it's definitionVersion is not loaded in the state, then load it and dispatch it to global state, only then set loading to false
    case 'fetchSuccess': {
      const { caseList, caseCount } = action.payload;
      return { ...state, caseList, caseCount, loading: false };
    }
    case 'fetchError': {
      return { ...state, loading: false, error: action.payload.error };
    }
    case 'fetchUpdate': {
      const { caseList } = action.payload;
      return { ...state, caseList };
    }
    case 'showCaseDetails': {
      return { ...state, showCaseDetails: true };
    }
    case 'hideCaseDetails': {
      return { ...state, showCaseDetails: false };
    }
    case 'setPage': {
      return { ...state, page: action.payload };
    }
    case 'setQueryParams': {
      return { ...state, queryParams: action.payload };
    }
    case 'setFilters': {
      return { ...state, filters: action.payload };
    }
    default:
      return state;
  }
}

const standaloneTask: StandaloneITask = {
  taskSid: 'standalone-task-sid',
  attributes: { isContactlessTask: false },
};

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseList: React.FC<Props> = ({ setConnectedCase, updateDefinitionVersion }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { helpline } = getConfig();

  const fetchCaseList = async (page: number, queryParams: ListCasesQueryParams, filters: ListCasesFilters) => {
    const { queryParams: previousGetCasesParam, filters: previousFilters, page: previousPage } = state;

    try {
      dispatch({ type: 'fetchStarted' });
      dispatch({ type: 'setQueryParams', payload: queryParams });
      dispatch({ type: 'setFilters', payload: filters });
      dispatch({ type: 'setPage', payload: page });

      const listCasesPayload = {
        filters,
        helpline,
      };
      const { cases, count } = await listCases(queryParams, listCasesPayload);

      const definitions = await getCasesMissingVersions(cases);
      definitions.forEach(d => updateDefinitionVersion(d.version, d.definition));

      dispatch({
        type: 'fetchSuccess',
        payload: { caseList: cases, caseCount: count },
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'setQueryParams', payload: previousGetCasesParam });
      dispatch({ type: 'setFilters', payload: previousFilters });
      dispatch({ type: 'setPage', payload: previousPage });
      dispatch({ type: 'fetchError', payload: { error } });
    }
  };

  useEffect(() => {
    fetchCaseList(state.page, state.queryParams, state.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePage = async page => {
    const queryParams = {
      ...state.queryParams,
      offset: CASES_PER_PAGE * page,
    };
    await fetchCaseList(page, queryParams, state.filters);
  };

  const handleColumnClick = async (sortBy, sortDirection) => {
    const queryParams = {
      ...state.queryParams,
      offset: 0,
      sortBy,
      sortDirection,
    };
    await fetchCaseList(0, queryParams, state.filters);
  };

  const handleApplyFilter = async (filters: ListCasesFilters) => {
    await fetchCaseList(0, state.queryParams, filters);
  };

  const handleClickViewCase = currentCase => () => {
    setConnectedCase(currentCase, standaloneTask.taskSid, false);
    dispatch({ type: 'showCaseDetails' });
  };

  const closeCaseView = () => {
    dispatch({ type: 'hideCaseDetails' });
  };

  const handleUpdatedCase = (updatedCase: CaseType) => {
    const caseList = state.caseList.map(c => (c.id === updatedCase.id ? { ...c, ...updatedCase } : { ...c }));
    dispatch({ type: 'fetchUpdate', payload: { caseList } });
  };

  if (state.error)
    return (
      <CenteredContainer>
        <SomethingWentWrongText data-testid="CaseList-SomethingWentWrongText">
          <Template code="CaseList-SomethingWentWrong" />
        </SomethingWentWrongText>
      </CenteredContainer>
    );

  if (state.showCaseDetails) {
    return (
      <StandaloneSearchContainer>
        <CaseLayout>
          <Case
            task={standaloneTask}
            isCreating={false}
            handleClose={closeCaseView}
            updateAllCasesView={handleUpdatedCase}
          />
        </CaseLayout>
      </StandaloneSearchContainer>
    );
  }

  return (
    <>
      <CaseListContainer>
        <CaseListTable
          loading={state.loading}
          caseList={state.caseList}
          caseCount={state.caseCount}
          page={state.page}
          queryParams={state.queryParams}
          handleChangePage={handleChangePage}
          handleColumnClick={handleColumnClick}
          handleApplyFilter={handleApplyFilter}
          handleClickViewCase={handleClickViewCase}
        />
      </CaseListContainer>
    </>
  );
};

CaseList.displayName = 'CaseList';

CaseList.propTypes = {
  setConnectedCase: PropTypes.func.isRequired,
  updateDefinitionVersion: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  setConnectedCase: CaseActions.setConnectedCase,
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(CaseList);

export default connected;
