import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './ContactState';
import { reduce as SearchFormReducer } from './SearchContact';
import { reduce as ConfigurationReducer } from './ConfigurationState';

// Register your redux store under a unique namespace
export const namespace = 'plugin-hrm-form';
export const contactFormsBase = 'activeContacts';
export const searchContactsBase = 'searchContacts';
export const configurationBase = 'configuration';

// Combine the reducers
export default combineReducers({
  [contactFormsBase]: ContactStateReducer,
  [searchContactsBase]: SearchFormReducer,
  [configurationBase]: ConfigurationReducer,
});
