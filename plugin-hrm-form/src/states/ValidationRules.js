import { callTypes } from './DomainConstants'

export function validateFormBeforeSubmit(form) {
  // return isStandAloneCallType(form.callType);
  return true; // need to add more later
}

// Questionable whether we should export this
export function isStandAloneCallType(callType) {
  return (callType !== callTypes.caller &&
          callType !== callTypes.child);
}
