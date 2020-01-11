import { callTypes } from './DomainConstants';
import cloneDeep from 'lodash/cloneDeep';

export function validateFormBeforeSubmit(form) {
  // return isStandAloneCallType(form.callType);
  return true; // need to add more later
}

// Questionable whether we should export this
export function isStandAloneCallType(callType) {
  return (callType !== callTypes.caller &&
          callType !== callTypes.child);
}

// returns a new version of the form that updates the error messages
// should this actually check for whether anything has changed?
// not planning to do that yet, but could add it as an optimization
export function validateOnBlur(form) {
  let newForm = cloneDeep(form);
  if (newForm.callerInformation.name.firstName.touched &&
      !newForm.callerInformation.name.firstName.value) {
        newForm.callerInformation.name.firstName.error = "This field is required";
  } else {
    newForm.callerInformation.name.firstName.error = null;
  }
  return newForm;
}

// walk a form tree looking for non-null error values
export function formIsValid(form) {
  if ('error' in form && form.error !== null) {
    return false;
  }
  for (const key of Object.keys(form)) {
    if (typeof form[key] === 'object' 
        && form[key] !== null
        && !formIsValid(form[key])) {
      return false;
    }
  }
  return true;
};