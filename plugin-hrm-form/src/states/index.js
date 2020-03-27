import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './ContactState';
import { reduce as SearchFormReducer } from './SearchContact';

// Register your redux store under a unique namespace
export const namespace = 'plugin-hrm-form';
export const contactFormsBase = 'activeContacts';
export const searchContactsBase = 'searchContacts';

// Combine the reducers
export default combineReducers({
  [contactFormsBase]: ContactStateReducer,
  [searchContactsBase]: SearchFormReducer,
});
