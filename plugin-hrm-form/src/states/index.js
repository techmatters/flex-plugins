import { combineReducers } from 'redux';

//import { reduce as HrmFormReducer } from './HrmFormState';
import { reducer as formReducer } from 'redux-form'

// Register your redux store under a unique namespace
export const namespace = 'hrmform';

// Combine the reducers
// TODO(nick): probs have better naming later.  But according to docs it needs to be 'form'
export default combineReducers({
//  hrmForm: HrmFormReducer,
  form:    formReducer
});
