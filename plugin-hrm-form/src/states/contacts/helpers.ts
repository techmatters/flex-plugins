import callTypes from '../DomainConstants';
import type { ContactRawJson, SearchContact } from '../../types/types';
import type { TaskEntry } from './reducer';

function copyCallerInformation(original: TaskEntry, newValues: ContactRawJson): TaskEntry {
  if (!newValues || !newValues.callerInformation) return original;

  const { callerInformation } = newValues;
  return { ...original, callerInformation };
}

function copyChildInformation(original: TaskEntry, newValues: ContactRawJson): TaskEntry {
  if (!newValues || !newValues.childInformation) return original;

  const { childInformation } = newValues;
  return { ...original, childInformation };
}

function partiallyCopyValues(original: TaskEntry, newValues: ContactRawJson): TaskEntry {
  switch (newValues.callType) {
    case callTypes.caller: {
      if (original.callType === callTypes.caller) {
        return copyCallerInformation(original, newValues);
      }
      if (original.callType === callTypes.child) {
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

export function copySearchResultIntoTask(currentTask: TaskEntry, searchContact: SearchContact): TaskEntry {
  const searchContactDetails = searchContact.details;
  return partiallyCopyValues(currentTask, searchContactDetails);
}
