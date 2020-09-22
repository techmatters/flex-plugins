import callTypes from '../DomainConstants';
import { createBlankForm } from '../ContactFormStateFactory';

const { childInformation: blankChildInformation, callerInformation: blankCallerInformation } = createBlankForm();

function copyNewValues(originalObject, objectWithNewValues) {
  if (objectWithNewValues === null || typeof objectWithNewValues === 'undefined') {
    return originalObject;
  }

  const isLeaf = originalObject.hasOwnProperty('value');

  if (isLeaf) {
    return {
      ...originalObject,
      value: objectWithNewValues,
      touched: true,
    };
  }

  const keys = Object.keys(originalObject);
  const values = keys.map(key => copyNewValues(originalObject[key], objectWithNewValues[key]));

  const entries = keys.map((key, i) => [key, values[i]]);
  return Object.fromEntries(entries);
}

function copyCallerInformation(original, newValues) {
  const callerInformation = copyNewValues(blankCallerInformation, newValues.callerInformation);
  return { ...original, callerInformation };
}

function copyChildInformation(original, newValues) {
  const childInformation = copyNewValues(blankChildInformation, newValues.childInformation);
  return { ...original, childInformation };
}

/**
 * Partially copies values from the contact (newValues) into the form (original)
 * based on the type calls of both
 * @param {{ callType: { value: string; }; }} original
 * @param {{ callType: string; }} newValues
 * @returns {{ callType: { value: string; }; }} a new form with caller or child information copied over
 */
function partiallyCopyValues(original, newValues) {
  switch (newValues.callType) {
    case callTypes.caller: {
      if (original.callType.value === callTypes.caller) {
        return copyCallerInformation(original, newValues);
      }
      if (original.callType.value === callTypes.child) {
        return copyChildInformation(original, newValues);
      }
      return original;
    }
    case callTypes.child: {
      return copyChildInformation(original, newValues);
    }
    default:
      return original;
  }
}

export function copySearchResultIntoTask(currentTask, searchResult) {
  const searchResultDetails = searchResult.details;
  return partiallyCopyValues(currentTask, searchResultDetails);
}
