import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './ContactState';
import { reduce as SearchFormReducer } from './SearchContact';
import { reduce as QueuesStatusReducer } from './QueuesStatus';

// Register your redux store under a unique namespace
export const namespace = 'plugin-hrm-form';
export const contactFormsBase = 'activeContacts';
export const searchContactsBase = 'searchContacts';
export const queuesStatusBase = 'queuesStatusState';

// Combine the reducers
export default combineReducers({
  [contactFormsBase]: ContactStateReducer,
  [searchContactsBase]: SearchFormReducer,
  [queuesStatusBase]: QueuesStatusReducer,
});
