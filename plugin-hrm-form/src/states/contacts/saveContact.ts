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
import { format } from 'date-fns';

import { submitContactForm } from '../../services/formSubmissionHelpers';
import {
  connectToCase,
  removeFromCase,
  createContact,
  getContactById,
  getContactByTaskSid,
  updateContactInHrm,
} from '../../services/ContactService';
import { Case, CustomITask, Contact } from '../../types/types';
import {
  CONNECT_TO_CASE,
  REMOVE_FROM_CASE,
  ContactMetadata,
  CREATE_CONTACT_ACTION,
  LOAD_CONTACT_FROM_HRM_BY_ID_ACTION,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION,
  SET_SAVED_CONTACT,
  UPDATE_CONTACT_ACTION,
} from './types';
import { ContactDraftChanges, ExistingContactsState } from './existingContacts';
import { newContactMetaData } from './contactState';
import { getCase } from '../../services/CaseService';
import { getUnsavedContact } from './getUnsavedContact';

export const createContactAsyncAction = createAsyncAction(
  CREATE_CONTACT_ACTION,
  async (contactToCreate: Contact, workerSid: string, taskSid: string) => {
    const contact = await createContact(contactToCreate, workerSid, taskSid);
    let contactCase: Case | undefined;
    if (contact.caseId) {
      contactCase = await getCase(contact.caseId);
    }
    return {
      contact,
      contactCase,
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
  (previousContact: Contact, body: ContactDraftChanges) => ({
    previousContact,
    changes: body,
  }),
);

const BLANK_CONTACT_CHANGES: ContactDraftChanges = {
  conversationDuration: 0,
  rawJson: {
    callType: '',
    childInformation: {},
    callerInformation: {},
    caseInformation: {},
    categories: {},
    contactlessTask: {
      channel: null,
      createdOnBehalfOf: null,
      date: null,
      time: null,
    },
  },
};

export const newClearContactAsyncAction = (contact: Contact) =>
  updateContactInHrmAsyncAction(contact, {
    ...BLANK_CONTACT_CHANGES,
    timeOfContact: new Date().toISOString(),
  });

export const newRestartOfflineContactAsyncAction = (contact: Contact, createdOnBehalfOf: string) => {
  const now = new Date();
  const time = format(now, 'HH:mm');
  const date = format(now, 'yyyy-MM-dd');
  return updateContactInHrmAsyncAction(contact, {
    ...BLANK_CONTACT_CHANGES,
    timeOfContact: now.toISOString(),
    rawJson: {
      ...BLANK_CONTACT_CHANGES.rawJson,
      contactlessTask: {
        channel: null,
        createdOnBehalfOf,
        date,
        time,
      },
    },
  });
};

type ConnectToCaseActionPayload = { contactId: string; caseId: number; contact: Contact };
type RemoveFromCaseActionPayload = { contactId: string; caseId: number; contact: Contact };

// TODO: Update connectedContacts on case in redux state
export const connectToCaseAsyncAction = createAsyncAction(
  CONNECT_TO_CASE,
  async (contactId: string, caseId: number | null): Promise<ConnectToCaseActionPayload> => {
    const contact = await connectToCase(contactId, caseId);
    return { contactId, caseId, contact };
  },
);

export const removeFromCaseAsyncAction = createAsyncAction(
  REMOVE_FROM_CASE,
  async (contactId: string, caseId: number | null): Promise<RemoveFromCaseActionPayload> => {
    const contact = await removeFromCase(contactId, caseId);
    return { contactId, caseId, contact };
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
    const contact = await getContactByTaskSid(taskSid);
    let contactCase: Case | undefined;
    if (contact?.caseId) {
      contactCase = await getCase(contact.caseId);
    }
    return {
      contact,
      contactCase,
      reference,
    };
  },
);

export const loadContactFromHrmByIdAsyncAction = createAsyncAction(
  LOAD_CONTACT_FROM_HRM_BY_ID_ACTION,
  async (contactId: string, reference: string = contactId) => {
    return {
      contact: await getContactById(contactId),
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
      savedContact: contact,
      references,
    },
  };
};

export const saveContactReducer = (initialState: ExistingContactsState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      updateContactInHrmAsyncAction.pending as typeof updateContactInHrmAsyncAction,
      (state, { meta: { changes, previousContact } }) => {
        return {
          ...state,
          [previousContact.id]: {
            ...state[previousContact.id],
            draftContact: undefined,
            savedContact: getUnsavedContact(state[previousContact.id]?.savedContact, changes),
          },
        };
      },
    ),

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
    handleAction(
      loadContactFromHrmByIdAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ExistingContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact, reference, newContactMetaData(true));
      },
    ),
    handleAction(
      connectToCaseAsyncAction.fulfilled,
      (state, { payload: { contact } }): ExistingContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact);
      },
    ),
    handleAction(
      removeFromCaseAsyncAction.fulfilled,
      (state, { payload: { contact } }): ExistingContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact);
      },
    ),

    handleAsyncAction(handleAction, updateContactInHrmAsyncAction.rejected),
  ]);
