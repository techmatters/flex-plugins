import { combineReducers } from 'redux';

//import { reduce as HrmFormReducer } from './HrmFormState';
import { reducer as formReducer } from 'redux-form'

// Register your redux store under a unique namespace
export const namespace = 'hrmform';

// Combine the reducers
export default combineReducers({
  form: formReducer
});
