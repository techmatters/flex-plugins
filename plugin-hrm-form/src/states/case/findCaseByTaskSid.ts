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

import { RootState } from '..';
import { Case } from '../../types/types';
import { contactFormsBase, connectedCaseBase, searchContactsBase, namespace } from '../storeNamespaces';
import findContactByTaskSid from '../contacts/findContactByTaskSid';

/**
 * Currently the case connected to the contact can be found at:
 * 1. ConnectedCase state, or
 * 2. SearchContacts state
 *
 * TODO: Unify to fetch the case from a single source, or load the
 * case from the backend, instead.
 */
const findCaseByTaskSid = (state: RootState, taskSid: string): Case => {
  const contact = findContactByTaskSid(state, taskSid).savedContact;
  const { caseId } = state[namespace][contactFormsBase].existingContacts[contact?.id]?.savedContact;

  const caseFromConnectedCase = state[namespace][connectedCaseBase].tasks[taskSid]?.connectedCase;
  if (caseFromConnectedCase?.id === caseId) {
    return caseFromConnectedCase;
  }

  return state[namespace][searchContactsBase].tasks[taskSid].searchCasesResult.cases.find(cas => cas.id === caseId);
};

export default findCaseByTaskSid;
