import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './ContactState';

// Register your redux store under a unique namespace
export const namespace = 'plugin-hrm-form';
export const contactFormsBase = 'activeContacts';

// Combine the reducers
export default combineReducers({
  [contactFormsBase]: ContactStateReducer
});
