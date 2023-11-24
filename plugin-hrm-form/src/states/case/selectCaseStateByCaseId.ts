import { RootState } from '..';
import { connectedCaseBase, namespace } from '../storeNamespaces';
import { CaseStateEntry } from './types';

const selectCaseByCaseId = (state: RootState, caseId: string): CaseStateEntry | undefined =>
  state[namespace][connectedCaseBase].cases[caseId];

export default selectCaseByCaseId;
