import { callTypes } from './DomainConstants';
import cloneDeep from 'lodash/cloneDeep';

export function validateBeforeSubmit(form) {
  if (isStandAloneCallType(form.callType)) {
    return form;
  }
  // we need to also consider whether we care about caller information or just child
  // and if you start with caller type, get invalid, then switch to child type, it's still disabled
  return validate(form, true);
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
  return validate(form);
}

function validate(form, ignoreTouched = false) {
  let newForm = cloneDeep(form);
  if ((ignoreTouched || newForm.callerInformation.name.firstName.touched) &&
      form.callType === callTypes.caller &&  // this is pretty bad
      !newForm.callerInformation.name.firstName.value) {
        // explicitly set it to touched so it can't get unset later
        newForm.callerInformation.name.firstName.touched = true;
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