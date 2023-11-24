import { RootState } from '..';
import { namespace } from '../storeNamespaces';
import { selectCurrentTopmostRouteForTask } from '../routing/getRoute';
import { isCaseRoute } from '../routing/types';
import { CaseStateEntry } from './types';

const selectCurrentRouteCaseState = (state: RootState, taskSid: string): CaseStateEntry | undefined => {
  const currentRoute = selectCurrentTopmostRouteForTask(state, taskSid);
  if (isCaseRoute(currentRoute)) {
    return state[namespace].connectedCase.cases[currentRoute.caseId];
  }
  return undefined;
};

export default selectCurrentRouteCaseState;
