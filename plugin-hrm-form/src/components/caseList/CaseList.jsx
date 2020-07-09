import React, { useEffect, useReducer } from 'react';
import { Template } from '@twilio/flex-ui';
import { CircularProgress, Dialog, DialogContent } from '@material-ui/core';

import CaseListTable from './CaseListTable';
import { CaseListContainer, LoadingContainer } from '../../styles/caseList';
import { getCases } from '../../services/CaseService';

export const CASES_PER_PAGE = 5;

const mockedMessage = <Template code="NotImplemented" />;

const initialState = {
  loading: true,
  caseList: [],
  caseCount: 0,
  page: 0,
  mockedMessage: null,
};

/**
 * @param {initialState} state
 * @param {{ type: string; payload?: Partial<initialState>}} action
 */
function reducer(state, action) {
  switch (action.type) {
    case 'fetchStarted':
      return { ...state, loading: true };
    case 'fetchSuccess': {
      const { page, caseList, caseCount } = action.payload;
      return { ...state, page, caseList, caseCount, loading: false };
    }
    case 'openMockedMessage':
      return { ...state, mockedMessage };
    case 'closeMockedMessage':
      return { ...state, mockedMessage: null };
    default:
      return state;
  }
}

const CaseList = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchCaseList = async (page) => {
    dispatch({ type: 'fetchStarted' });
    const { cases, count } = await getCases(CASES_PER_PAGE, CASES_PER_PAGE * page);
    dispatch({ type: 'fetchSuccess', payload: { page, caseList: cases, caseCount: count } });
  };

  useEffect(() => {
    fetchCaseList(0);
  }, []);

  const handleChangePage = async (page) => {
    await fetchCaseList(page);
  };

  const openMockedMessage = () => dispatch({ type: 'openMockedMessage' });

  const closeMockedMessage = () => dispatch({ type: 'closeMockedMessage' });

  return (
    <>
      <Dialog onClose={closeMockedMessage} open={state.mockedMessage !== null}>
        <DialogContent>{state.mockedMessage}</DialogContent>
      </Dialog>
      <CaseListContainer>
        {state.loading ? (
          <LoadingContainer>
            <CircularProgress size={50} />
          </LoadingContainer>
        ) : (
          <CaseListTable
            caseList={state.caseList}
            caseCount={state.caseCount}
            page={state.page}
            handleChangePage={handleChangePage}
            openMockedMessage={openMockedMessage}
          />
        )}
      </CaseListContainer>
    </>
  );
};

CaseList.displayName = 'CaseList';

export default CaseList;
