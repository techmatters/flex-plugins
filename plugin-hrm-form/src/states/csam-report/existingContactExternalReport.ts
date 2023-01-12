import { CSAMReportEntry } from '../../types/types';
import * as t from '../contacts/types';
import { ExistingContactsState } from '../contacts/existingContacts';

export const ADD_EXTERNAL_REPORT_ENTRY = 'contacts/ADD_EXTERNAL_REPORT_ENTRY';

export type AddExternalReportEntryAction = {
  type: typeof ADD_EXTERNAL_REPORT_ENTRY;
  csamReportEntry: CSAMReportEntry;
  contactId: string;
};

export const addExternalReportEntry = (
  csamReportEntry: CSAMReportEntry,
  contactId: string,
): AddExternalReportEntryAction => ({
  type: ADD_EXTERNAL_REPORT_ENTRY,
  csamReportEntry,
  contactId,
});

export const addExternalReportEntryReducer = (
  state: ExistingContactsState,
  action: AddExternalReportEntryAction,
): ExistingContactsState => {
  if (!state[action.contactId]) {
    return state;
  }
  return {
    ...state,
    [action.contactId]: {
      ...state[action.contactId],
      savedContact: {
        ...state[action.contactId].savedContact,
        csamReports: [...state[action.contactId].savedContact.csamReports, action.csamReportEntry],
      },
    },
  };
};
