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

import { ContactMetadata, ContactsState, LoadingStatus } from './types';
import { Contact } from '../../types/types';
import { ContactDraftChanges } from './existingContacts';
import { getUnsavedContact } from './getUnsavedContact';
import { newContactMetaData } from './contactState';

export const contactReduxUpdates = (
  state: ContactsState,
  contact: Contact | string,
  updates: ContactDraftChanges = undefined,
): ContactsState => {
  const { existingContacts } = state;
  const id = typeof contact === 'object' ? contact.id : contact;
  return {
    ...state,
    existingContacts: {
      ...state.existingContacts,
      [id]: {
        ...existingContacts[id],
        draftContact: undefined,
        savedContact: getUnsavedContact(existingContacts[id]?.savedContact, updates),
        metadata: {
          ...newContactMetaData(false),
          ...existingContacts[id]?.metadata,
          loadingStatus: LoadingStatus.LOADING,
        },
      },
    },
  };
};

export const markContactAsCreatingInRedux = (state: ContactsState, taskSid: string): ContactsState => {
  const contactsBeingCreated = new Set(state.contactsBeingCreated);
  contactsBeingCreated.add(taskSid);
  return {
    ...state,
    contactsBeingCreated,
  };
};

export const markContactAsNotCreatingInRedux = (state: ContactsState, taskSid: string): ContactsState => {
  const contactsBeingCreated = new Set(state.contactsBeingCreated);
  contactsBeingCreated.delete(taskSid);
  return {
    ...state,
    contactsBeingCreated,
  };
};

// TODO: Consolidate this logic with the loadContactReducer implementation?
export const loadContactIntoRedux = (
  state: ContactsState,
  contact: Contact,
  reference?: string,
  newMetadata?: ContactMetadata,
): ContactsState => {
  const { existingContacts } = state;
  const references = existingContacts[contact.id]?.references ?? new Set();
  if (reference) {
    references.add(reference);
  }
  const metadata = { ...newContactMetaData(false), ...(newMetadata ?? existingContacts[contact.id]?.metadata) };
  const existingContact = existingContacts[contact.id]?.savedContact;
  const existingAssociations = {
    ...(existingContact?.csamReports ? { csamReports: existingContact.csamReports } : {}),
    ...(existingContact?.conversationMedia ? { conversationMedia: existingContact.conversationMedia } : {}),
    ...(existingContact?.referrals ? { referrals: existingContact.referrals } : {}),
  };
  return {
    ...markContactAsNotCreatingInRedux(state, contact.taskId),
    existingContacts: {
      ...existingContacts,
      [contact.id]: {
        ...existingContacts[contact.id],
        metadata: { ...metadata, loadingStatus: LoadingStatus.LOADED },
        savedContact: {
          ...existingAssociations,
          ...contact,
        },
        references: references ?? existingContacts[contact.id]?.references,
      },
    },
  };
};

export const rollbackSavingStateInRedux = (
  state: ContactsState,
  contact: Contact,
  changes: ContactDraftChanges,
): ContactsState => {
  const { existingContacts } = state;
  return {
    ...state,
    existingContacts: {
      ...existingContacts,
      [contact.id]: {
        ...existingContacts[contact.id],
        draftContact: changes,
        savedContact: contact,
        metadata: { ...existingContacts[contact.id]?.metadata, loadingStatus: LoadingStatus.LOADED },
      },
    },
  };
};
