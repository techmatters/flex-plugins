import { combineReducers } from 'redux';

import { reduce as HrmFormReducer } from './HrmFormState';

// Register your redux store under a unique namespace
export const namespace = 'hrm-form';

// Combine the reducers
export default combineReducers({
  hrmForm: HrmFormReducer
});
