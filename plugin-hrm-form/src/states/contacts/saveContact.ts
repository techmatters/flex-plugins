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

import { updateContactsFormInHrm } from '../../services/ContactService';
import { ContactRawJson, Contact } from '../../types/types';
import { UPDATE_CONTACT_ACTION } from './types';
import { ExistingContactsState } from './existingContacts';

export const updateContactsFormInHrmAsyncAction = createAsyncAction(
  UPDATE_CONTACT_ACTION,
  async (contactId: string, body: Partial<ContactRawJson>): Promise<{ contact: Contact }> => {
    const contact = await updateContactsFormInHrm(contactId, body);
    return {
      contact,
    };
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
      (state, { payload: { contact } }): ExistingContactsState => {
        return {
          ...state,
          [contact.id]: {
            ...state[contact.id],
            draftContact: { rawJson: {} },
            savedContact: contact,
          },
        };
      },
    ),

    handleAsyncAction(handleAction, updateContactsFormInHrmAsyncAction.rejected),
  ]);
