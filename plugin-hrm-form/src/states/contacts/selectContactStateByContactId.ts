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

import { ContactState } from './existingContacts';
import { RootState } from '..';
import { namespace } from '../storeNamespaces';
import { isOfflineContact } from '../../types/types';

/**
 * Select contact state by contactId
 * @param state
 * @param contactId
 */
const selectContactStateByContactId = (state: RootState, contactId: string): ContactState | undefined => {
  console.log(`[CONTACT_SYNC_LOOKUP] Looking up contact state for contactId=${contactId}`);

  if (!contactId) {
    console.warn('[CONTACT_SYNC_LOOKUP] Attempted to select contact with undefined/null contactId');
    return undefined;
  }

  const allContactsInStore = state[namespace].activeContacts.existingContacts;
  const contactState = contactId ? allContactsInStore[contactId] : undefined;

  if (contactState) {
    console.log(`[CONTACT_SYNC_LOOKUP] Contact state FOUND for contactId=${contactId}`, {
      hasReferences: contactState.references?.size > 0,
      referenceCount: contactState.references?.size,
      hasSavedContact: Boolean(contactState.savedContact),
      taskId: contactState.savedContact?.taskId,
    });
  } else {
    console.warn(`[CONTACT_SYNC_LOOKUP] Contact state NOT FOUND for contactId=${contactId}`);
    console.log('[CONTACT_SYNC_LOOKUP] Available contact IDs in store:', Object.keys(allContactsInStore));
  }

  return contactState;
};
export default selectContactStateByContactId;
