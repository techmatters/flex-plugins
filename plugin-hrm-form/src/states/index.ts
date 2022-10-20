import type { FlexState } from '@twilio/flex-ui';
import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './contacts/reducer';
import { reduce as SearchFormReducer } from './search/reducer';
import { reduce as ConnectedCaseReducer } from './case/reducer';
import { reduce as CaseListReducer } from './caseList/reducer';
import { reduce as QueuesStatusReducer } from './queuesStatus/reducer';
import { reduce as ConfigurationReducer } from './configuration/reducer';
import { reduce as RoutingReducer } from './routing/reducer';
import { reduce as CSAMReportReducer } from './csam-report/reducer';
import { reduce as DualWriteReducer } from './dualWrite/reducer';
import { CaseState } from './case/types';

// Register your redux store under a unique namespace
export const namespace = 'plugin-hrm-form';
export const contactFormsBase = 'activeContacts';
export const searchContactsBase = 'searchContacts';
export const caseListBase = 'caseList';
export const connectedCaseBase = 'connectedCase';
export const queuesStatusBase = 'queuesStatusState';
export const configurationBase = 'configuration';
export const routingBase = 'routing';
export const csamReportBase = 'csam-report';
export const dualWriteBase = 'dualWrite';

const reducers = {
  [contactFormsBase]: ContactStateReducer,
  [searchContactsBase]: SearchFormReducer,
  [queuesStatusBase]: QueuesStatusReducer,
  [caseListBase]: CaseListReducer,
  [configurationBase]: ConfigurationReducer,
  [routingBase]: RoutingReducer,
  [csamReportBase]: CSAMReportReducer,
  [dualWriteBase]: DualWriteReducer,
  // [connectedCaseBase] - this is going to be combined manually, rather than using 'combineReducers', so isn't in this map
};
type HrmState = {
  [P in keyof typeof reducers]: ReturnType<typeof reducers[P]>;
} & { [connectedCaseBase]: CaseState };

export type RootState = FlexState & { [namespace]: HrmState };
const combinedReducers = combineReducers(reducers);

// Combine the reducers
const reducer = (state: HrmState, action): HrmState => {
  return {
    ...combinedReducers(state, action),
    /*
     * ConnectedCaseReducer's signature includes a parameter for global Hrm State as well as the specific CaseState
     * This makes it incompatible with combineReducers, so instead, we add the case state property with an explicit call to ConnectedCaseReducer, where we specify the extra parameter
     */
    [connectedCaseBase]: ConnectedCaseReducer(state, (state ?? {})[connectedCaseBase], action),
  };
};

export default reducer;
