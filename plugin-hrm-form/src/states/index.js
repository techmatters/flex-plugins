import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './ContactState';
import { reduce as SearchFormReducer } from './SearchContact';
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

// Combine the reducers
export default combineReducers({
  [contactFormsBase]: ContactStateReducer,
  [searchContactsBase]: SearchFormReducer,
  [queuesStatusBase]: QueuesStatusReducer,
  [connectedCaseBase]: ConnectedCaseReducer,
  [configurationBase]: ConfigurationReducer,
  [routingBase]: RoutingReducer,
});
