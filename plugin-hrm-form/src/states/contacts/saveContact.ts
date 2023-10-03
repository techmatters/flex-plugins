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
import { connectToCase, updateContactsFormInHrm } from '../../services/ContactService';
import { Case, ContactRawJson, CustomITask, HrmServiceContact } from '../../types/types';
import { CONNECT_TO_CASE, ContactMetadata, SET_SAVED_CONTACT, UPDATE_CONTACT_ACTION } from './types';
import { ExistingContactsState } from './existingContacts';

export const updateContactsFormInHrmAsyncAction = createAsyncAction(
  UPDATE_CONTACT_ACTION,
  async (
    contactId: string,
    body: Partial<ContactRawJson>,
    helpline: string,
  ): Promise<{ contacts: Partial<HrmServiceContact>[] }> => {
    const contact = await updateContactsFormInHrm(contactId, body, helpline);
    return {
      contacts: [contact],
    };
  },
);

export const connectToCaseAsyncAction = createAsyncAction(
  CONNECT_TO_CASE,
  async (contactId: string, caseId: number) => {
    await connectToCase(contactId, caseId);
  },
);

export const submitContactFormAsyncAction = createAsyncAction(
  SET_SAVED_CONTACT,
  async (
    task: CustomITask,
    contact: HrmServiceContact,
    metadata: ContactMetadata,
    caseForm: Case,
  ): Promise<{ contact: Partial<HrmServiceContact> }> => {
    return { contact: await submitContactForm(task, contact, metadata, caseForm) };
  },
);

const handleAsyncAction = (handleAction, asyncAction) =>
  handleAction(asyncAction, state => {
    return {
      ...state,
    };
  });

export const saveContactReducer = (initialState: ExistingContactsState) =>
  createReducer(initialState, handleAction => [
    handleAsyncAction(handleAction, updateContactsFormInHrmAsyncAction.pending),

    handleAction(
      updateContactsFormInHrmAsyncAction.fulfilled,
      (state, { payload }): ExistingContactsState => {
        const replaceExisting = true;
        const updateEntries = payload.contacts
          .filter(c => state[c.id]?.references && replaceExisting)
          .map(c => {
            const current = state[c.id] ?? { references: new Set() };
            const { draftContact, ...currentContact } = state[c.id] ?? {
              categories: {
                expanded: {},
                gridView: false,
              },
            };
            return [
              c.id,
              {
                ...currentContact,
                savedContact: replaceExisting || !current.references.size ? c : state[c.id].savedContact,
                ...state[c.id].references,
              },
            ];
          });
        return {
          ...state,
          ...Object.fromEntries(updateEntries),
        };
      },
    ),

    handleAsyncAction(handleAction, updateContactsFormInHrmAsyncAction.rejected),
  ]);

export const submitContactFormReducer = (initialState: HrmServiceContact) =>
  createReducer(initialState, handleAction => [
    handleAsyncAction(handleAction, submitContactFormAsyncAction.pending),

    handleAction(
      submitContactFormAsyncAction.fulfilled,
      (state, { payload }): HrmServiceContact => {
        return {
          ...state,
          ...payload.contact,
        };
      },
    ),

    handleAsyncAction(handleAction, submitContactFormAsyncAction.rejected),
  ]);
