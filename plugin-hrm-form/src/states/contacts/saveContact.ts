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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { submitContactForm } from '../../services/formSubmissionHelpers';
import { connectToCase, createContact, getContactByTaskSid, updateContactInHrm } from '../../services/ContactService';
import { Case, CustomITask, Contact } from '../../types/types';
import {
  CONNECT_TO_CASE,
  ContactMetadata,
  CREATE_CONTACT_ACTION,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION,
  SET_SAVED_CONTACT,
  UPDATE_CONTACT_ACTION,
} from './types';
import { ContactDraftChanges, ExistingContactsState } from './existingContacts';
import { newContactMetaData } from './contactState';

export const createContactAsyncAction = createAsyncAction(
  CREATE_CONTACT_ACTION,
  async (contact: Contact, workerSid: string, taskSid: string) => {
    return {
      contact: await createContact(contact, workerSid, taskSid),
      reference: taskSid,
      metadata: newContactMetaData(false),
    };
  },
);

type FulfilledUpdatedContactActionPayload = { contact: Contact; previousContact: Contact; reference: string };

export const updateContactInHrmAsyncAction = createAsyncAction(
  UPDATE_CONTACT_ACTION,
  async (
    previousContact: Contact,
    body: ContactDraftChanges,
    reference?: string,
  ): Promise<FulfilledUpdatedContactActionPayload> => {
    const contact = await updateContactInHrm(previousContact.id, body);
    return {
      contact,
      previousContact,
      reference,
    };
  },
);

// TODO: Update connectedContacts on case in redux state
export const connectToCaseAsyncAction = createAsyncAction(
  CONNECT_TO_CASE,
  async (contactId: string, caseId: number | null): Promise<{ contactId: string; caseId: number }> => {
    await connectToCase(contactId, caseId);
    return { contactId, caseId };
  },
);

export const submitContactFormAsyncAction = createAsyncAction(
  SET_SAVED_CONTACT,
  async (task: CustomITask, contact: Contact, metadata: ContactMetadata, caseForm: Case) => {
    return submitContactForm(task, contact, metadata, caseForm);
  },
);

export const loadContactFromHrmByTaskSidAsyncAction = createAsyncAction(
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION,
  async (taskSid: string, reference: string = taskSid) => {
    return {
      contact: await getContactByTaskSid(taskSid),
      reference,
    };
  },
);

const handleAsyncAction = (handleAction, asyncAction) =>
  handleAction(asyncAction, state => {
    return {
      ...state,
    };
  });

// TODO: Consolidate this logic with the loadContactReducer implementation?
const loadContactIntoRedux = (
  state: ExistingContactsState,
  contact: Contact,
  reference?: string,
  newMetadata?: ContactMetadata,
) => {
  const references = state[contact.id]?.references ?? new Set();
  if (reference) {
    references.add(reference);
  }
  const metadata = newMetadata ?? state[contact.id]?.metadata;
  return {
    ...state,
    [contact.id]: {
      ...state[contact.id],
      metadata,
      draftContact: undefined,
      savedContact: contact,
      references,
    },
  };
};

export const saveContactReducer = (initialState: ExistingContactsState) =>
  createReducer(initialState, handleAction => [
    handleAsyncAction(handleAction, updateContactInHrmAsyncAction.pending),

    handleAction(
      updateContactInHrmAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ExistingContactsState => {
        return loadContactIntoRedux(state, contact, reference);
      },
    ),
    handleAction(
      createContactAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ExistingContactsState => {
        return loadContactIntoRedux(state, contact, reference, newContactMetaData(false));
      },
    ),
    handleAction(
      loadContactFromHrmByTaskSidAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ExistingContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact, reference, newContactMetaData(true));
      },
    ),

    handleAsyncAction(handleAction, updateContactInHrmAsyncAction.rejected),
  ]);