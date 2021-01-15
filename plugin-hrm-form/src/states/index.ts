import type { FlexState } from '@twilio/flex-ui';
import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './contacts/reducer';
import { reduce as SearchFormReducer } from './search/reducer';
import { reduce as ConnectedCaseReducer } from './case/reducer';
import { reduce as QueuesStatusReducer } from './queuesStatus/reducer';
import { reduce as ConfigurationReducer } from './configuration/reducer';
import { reduce as RoutingReducer } from './routing/reducer';

// Register your redux store under a unique namespace
export const namespace = 'plugin-hrm-form';
export const contactFormsBase = 'activeContacts';
export const searchContactsBase = 'searchContacts';
export const connectedCaseBase = 'connectedCase';
export const queuesStatusBase = 'queuesStatusState';
export const configurationBase = 'configuration';
export const routingBase = 'routing';

const reducers = {
  [contactFormsBase]: ContactStateReducer,
  [searchContactsBase]: SearchFormReducer,
  [queuesStatusBase]: QueuesStatusReducer,
  [connectedCaseBase]: ConnectedCaseReducer,
  [configurationBase]: ConfigurationReducer,
  [routingBase]: RoutingReducer,
};

// Combine the reducers
const reducer = combineReducers(reducers);

export default reducer;

type HrmState = {
  [P in keyof typeof reducers]: ReturnType<typeof reducers[P]>;
};

export type RootState = FlexState & { [namespace]: HrmState };
