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

import { parseISO } from 'date-fns';

import { RootState } from '..';
import { ContactState } from './existingContacts';
import { namespace } from '../storeNamespaces';
import { Case, Contact } from '../../types/types';
import selectContactStateByContactId from './selectContactStateByContactId';

export const selectContactsByCaseId = (state: RootState, caseId: Case['id']): ContactState[] =>
  Object.values(state[namespace].activeContacts.existingContacts)
    .filter(cs => cs.savedContact?.caseId === caseId)
    .sort((a, b) => parseISO(a.savedContact?.createdAt).valueOf() - parseISO(b.savedContact?.createdAt).valueOf());

export const selectFirstContactByCaseId = (state: RootState, caseId: Case['id']): ContactState =>
  selectContactsByCaseId(state, caseId)[0] || null;

export const selectFirstCaseContact = (state: RootState, parentCase: Case): Contact => {
  if (!parentCase.firstContact) return undefined;
  const contactState = selectContactStateByContactId(state, parentCase.firstContact.id);
  if (contactState) {
    if (contactState.savedContact.caseId === parentCase.id) {
      return contactState.savedContact; // Contact loaded into state and still connected to case, return this version
    }
    // If the contact in state is not connected to the case, try to find one that is.
    return selectFirstContactByCaseId(state, parentCase.id)?.savedContact;
  }
  return parentCase.firstContact; // Contact not loaded into state, return this version, could be stale
};
