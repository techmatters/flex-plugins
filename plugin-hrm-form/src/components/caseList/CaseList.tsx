import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';

import Case from '../case';
import { Case as CaseType } from '../../types/types';
import CaseListTable from './CaseListTable';
import { CaseListContainer, CenteredContainer, SomethingWentWrongText } from '../../styles/caseList';
import { getCases } from '../../services/CaseService';
import { CaseLayout } from '../../styles/case';
import * as CaseActions from '../../states/case/actions';
import { StandaloneSearchContainer } from '../../styles/search';
import { StandaloneITask } from '../StandaloneSearch';

export const CASES_PER_PAGE = 5;

const initialState = {
  loading: true,
  showCaseDetails: false,
  error: null,
  caseList: [],
  caseCount: 0,
  page: 0,
};

type CaseListActions = 
  { type: 'fetchStarted' } |
  { type: 'fetchSuccess', payload: { page: number, caseList: CaseType[], caseCount: number } } |
  { type: 'fetchError', payload: { error: any } }  |
  { type: 'fetchUpdate', payload: { caseList: CaseType[] } } |
  { type: 'showCaseDetails' } |
  { type: 'hideCaseDetails' };

/**
 * @param {initialState} state
 * @param {{ type: string; payload?: Partial<initialState>}} action
 */
function reducer(state, action: CaseListActions) {
  switch (action.type) {
    case 'fetchStarted':
      return { ...state, loading: true };
    case 'fetchSuccess': {
      const { page, caseList, caseCount } = action.payload;
      return { ...state, page, caseList, caseCount, loading: false };
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
      return { ...state, showCaseDetails: false }
    }    
    default:
      return state;
  }
}

const standaloneTask: StandaloneITask = {
  taskSid: 'standalone-task-sid',
  attributes: { isContactlessTask: false },
};

type OwnProps = {
  setConnectedCase: (currentCase: CaseType, taskSid: string, caseHasBeenEdited: Boolean) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseList: React.FC<Props> = ({ setConnectedCase }) => {
  // const [showCaseDetails, setDisplayCase] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchCaseList = async page => {
    try {
      dispatch({ type: 'fetchStarted' });
      const { cases, count } = await getCases(CASES_PER_PAGE, CASES_PER_PAGE * page);
      dispatch({ type: 'fetchSuccess', payload: { page, caseList: cases, caseCount: count } });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'fetchError', payload: { error } });
    }
  };

  useEffect(() => {
    fetchCaseList(0);
  }, []);

  const handleChangePage = async page => {
    await fetchCaseList(page);
  };

  const handleClickViewCase = currentCase => () => {
    setConnectedCase(currentCase, standaloneTask.taskSid, false);
    dispatch({ type: 'showCaseDetails' });
  };

  const closeCaseView = () => {
    dispatch({ type: 'hideCaseDetails' });
  };

  const handleUpdatedCase = (updatedCase: CaseType) => {
    const caseList = state.caseList.map(c => c.id === updatedCase.id ? { ...c, ...updatedCase } : { ...c });
    dispatch({ type: 'fetchUpdate', payload: { caseList } });
  }

  if (state.error)
    return (
      <CenteredContainer>
        <SomethingWentWrongText data-testid="CaseList-SomethingWentWrongText">
          <Template code="CaseList-SomethingWentWrong" />
        </SomethingWentWrongText>
      </CenteredContainer>
    );

  if (state.loading)
    return (
      <CenteredContainer>
        <CircularProgress size={50} />
      </CenteredContainer>
    );

  if (state.showCaseDetails) {
    return (
      <StandaloneSearchContainer>
        <CaseLayout>
          <Case task={standaloneTask} isCreating={false} handleClose={closeCaseView} updateAllCasesView={handleUpdatedCase} />
        </CaseLayout>
      </StandaloneSearchContainer>
    );
  }

  return (
    <>
      <CaseListContainer>
        <CaseListTable
          caseList={state.caseList}
          caseCount={state.caseCount}
          page={state.page}
          handleChangePage={handleChangePage}
          handleClickViewCase={handleClickViewCase}
        />
      </CaseListContainer>
    </>
  );
};

CaseList.displayName = 'CaseList';

CaseList.propTypes = {
  setConnectedCase: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  setConnectedCase: CaseActions.setConnectedCase,
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(CaseList);

export default connected;
