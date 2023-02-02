/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

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
