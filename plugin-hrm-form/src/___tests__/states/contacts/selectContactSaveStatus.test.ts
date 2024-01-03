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

import { RootState } from '../../../states';
import { namespace } from '../../../states/storeNamespaces';
import { RecursivePartial } from '../../RecursivePartial';
import { selectAnyContactIsSaving, selectIsContactCreating } from '../../../states/contacts/selectContactSaveStatus';
import { LoadingStatus } from '../../../states/contacts/types';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';

const withContactsBeingCreated = (contactsBeingCreated: string[]): RootState => {
  const partial: RecursivePartial<RootState> = {
    [namespace]: {
      activeContacts: {
        existingContacts: {
          'created-me-contact-id': {
            savedContact: { ...VALID_EMPTY_CONTACT, id: 'created-me-contact-id', taskId: 'created-me' },
            metadata: { ...VALID_EMPTY_METADATA, loadingStatus: LoadingStatus.LOADED },
          },
        },
        contactsBeingCreated: new Set(contactsBeingCreated),
      },
    },
  };
  return partial as RootState;
};

describe('selectIsContactCreating', () => {
  test('should return true if contact is in creating set', () => {
    expect(selectIsContactCreating(withContactsBeingCreated(['creating-me']), 'creating-me')).toBe(true);
  });
  test('should return false if contact is not in creating set', () => {
    expect(selectIsContactCreating(withContactsBeingCreated(['creating-me']), 'not-creating-me')).toBe(false);
  });
  test('should return true if contact is in creating set even if a contact with that taskId is already the existingContacts map', () => {
    expect(selectIsContactCreating(withContactsBeingCreated(['created-me']), 'created-me')).toBe(true);
  });
});

describe('selectAnyContactIsSaving', () => {
  test('Returns true if any contact has a LOADING status', () => {
    const state = withContactsBeingCreated([]);
    state[namespace].activeContacts.existingContacts['created-me-contact-id'].metadata = {
      ...VALID_EMPTY_METADATA,
      loadingStatus: LoadingStatus.LOADING,
    };
    expect(selectAnyContactIsSaving(state)).toBe(true);
  });
  test('Returns true if any entries are in the contactsBeingCreated set', () => {
    const state = withContactsBeingCreated(['creating-me']);
    expect(selectAnyContactIsSaving(state)).toBe(true);
  });
  test('Returns false if no existing contact has a LOADING status and the contactsBeingCreated set is empty', () => {
    const state = withContactsBeingCreated([]);
    expect(selectAnyContactIsSaving(state)).toBe(false);
  });
});
