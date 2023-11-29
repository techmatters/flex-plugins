import { SearchCaseResult } from '../../types/types';
import { RootState } from '..';
import { namespace } from '../storeNamespaces';

const selectCasesForSearchResults = (state: RootState, taskSid: string): SearchCaseResult => {
  const resultReferences = state[namespace].searchContacts.tasks[taskSid]?.searchCasesResult;
  if (!resultReferences) {
    return {
      count: 0,
      cases: [],
    };
  }
  return {
    count: resultReferences.count,
    cases: resultReferences.ids
      .map(id => state[namespace].connectedCase.cases[id]?.connectedCase)
      .filter(c => Boolean(c)),
  };
};

export default selectCasesForSearchResults;
