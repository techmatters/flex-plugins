import { callTypes } from './DomainConstants'

export function validateFormBeforeSubmit(form) {
  return isStandAloneCallType(form.callType);
}

function isStandAloneCallType(callType) {
  return (callType !== callTypes.caller &&
          callType !== callTypes.child);
}
