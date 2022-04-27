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
import { getCasesMissingVersions } from '../../utils/definitionVersions';
import { caseListBase, namespace, RootState } from '../../states';
import { undoCaseListSettingsUpdate } from '../../states/caseList/reducer';
import { dateFilterPayloadFromFilters } from './filters/dateFilters';

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
    includeOrphans: false,
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

const CaseList: React.FC<Props> = ({ setConnectedCase, updateDefinitionVersion, currentSettings }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { helpline } = getConfig();

  const fetchCaseList = async (page: number, filters: ListCasesFilters) => {
    try {
      dispatch({ type: 'fetchStarted' });
      const queryParams: ListCasesQueryParams = {
        offset: page * CASES_PER_PAGE,
      };
      const listCasesPayload = {
        filters: {
          ...filters,
          ...dateFilterPayloadFromFilters({
            createdAt: filters?.createdAt,
            updatedAt: filters?.updatedAt,
            followUpDate: filters?.followUpDate,
          }),
        },
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
      undoCaseListSettingsUpdate();
    }
  };

  useEffect(() => {
    fetchCaseList(state.page, currentSettings.filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSettings]);

  const handleChangePage = async page => {
    const queryParams = {
      ...state.queryParams,
      offset: CASES_PER_PAGE * page,
    };
    await fetchCaseList(page, currentSettings.filter);
  };

  const handleColumnClick = async (sortBy, sortDirection) => {
    const queryParams = {
      ...state.queryParams,
      offset: 0,
      sortBy,
      sortDirection,
    };
    await fetchCaseList(0, currentSettings.filter);
  };

  const handleApplyFilter = async (filters: ListCasesFilters) => {
    await fetchCaseList(0, currentSettings.filter);
  };

  const handleClickViewCase = currentCase => () => {
    setConnectedCase(currentCase, standaloneTask.taskSid, false);
    dispatch({ type: 'showCaseDetails' });
  };

  const closeCaseView = async () => {
    // Reload the current page of the list to reflect any updates to the case just being viewed
    await fetchCaseList(state.page, currentSettings.filter);
    dispatch({ type: 'hideCaseDetails' });
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
          <Case task={standaloneTask} isCreating={false} handleClose={closeCaseView} />
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
  undoSettingsUpdate: undoCaseListSettingsUpdate,
};

const mapStateToProps = (state: RootState) => ({
  currentSettings: state[namespace][caseListBase].currentSettings,
  previousSettings: state[namespace][caseListBase].previousSettings,
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseList);

export default connected;
