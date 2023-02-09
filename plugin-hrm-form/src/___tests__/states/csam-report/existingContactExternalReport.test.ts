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

import {
  addExternalReportEntry,
  addExternalReportEntryReducer,
} from '../../../states/csam-report/existingContactExternalReport';
import { ExistingContactsState } from '../../../states/contacts/existingContacts';
import { CSAMReportEntry } from '../../../types/types';

const BASELINE_STATE: ExistingContactsState = {
  exists: {
    references: new Set([]),
    categories: { gridView: false, expanded: {} },
    savedContact: {
      contactId: '',
      csamReports: [],
      details: undefined,
      overview: {
        callType: undefined,
        categories: {},
        channel: undefined,
        conversationDuration: 0,
        counselor: '',
        createdBy: '',
        customerNumber: '',
        dateTime: '',
        helpline: '',
        name: '',
        notes: '',
        taskId: '',
      },
    },
  },
};

const entry: CSAMReportEntry = {
  acknowledged: false,
  createdAt: '',
  csamReportId: '',
  id: 0,
  reportType: undefined,
  twilioWorkerId: '',
};

describe('addExternalReportEntryReducer', () => {
  test('Contact without CSAM reports exists in state with this contactId - adds report', () => {
    const state = addExternalReportEntryReducer(BASELINE_STATE, addExternalReportEntry(entry, 'exists'));
    expect(state).toStrictEqual({
      ...BASELINE_STATE,
      exists: {
        ...BASELINE_STATE.exists,
        savedContact: { ...BASELINE_STATE.exists.savedContact, csamReports: [entry] },
      },
    });
  });
  test('Contact without CSAM reports exists in state with this contactId - adds report', () => {
    const stateWithEntryWithReport = {
      ...BASELINE_STATE,
      exists: {
        ...BASELINE_STATE.exists,
        savedContact: { ...BASELINE_STATE.exists.savedContact, csamReports: [entry] },
      },
    };
    const state = addExternalReportEntryReducer(
      stateWithEntryWithReport,
      addExternalReportEntry({ ...entry, id: 1234 }, 'exists'),
    );
    expect(state).toStrictEqual({
      ...BASELINE_STATE,
      exists: {
        ...BASELINE_STATE.exists,
        savedContact: { ...BASELINE_STATE.exists.savedContact, csamReports: [entry, { ...entry, id: 1234 }] },
      },
    });
  });
  test('No contact exists in state with this contactId - NOOP', () => {
    const state = addExternalReportEntryReducer(BASELINE_STATE, addExternalReportEntry(entry, 'not exists'));
    expect(state).toStrictEqual(BASELINE_STATE);
  });
});
