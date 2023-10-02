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
import { ContactRawJson, HrmServiceContact } from '../../types/types';
import { UPDATE_CONTACT_ACTION } from './types';
import { ExistingContactsState } from './existingContacts';

export const updateContactsFormInHrmAsyncAction = createAsyncAction(
  UPDATE_CONTACT_ACTION,
  async (
    contactId: string,
    body: Partial<ContactRawJson>,
    helpline: string,
    reference?: string,
  ): Promise<{ contacts: Partial<HrmServiceContact>[]; replaceExisting: boolean; reference?: string }> => {
    const contact = await updateContactsFormInHrm(contactId, body, helpline);
    return {
      contacts: [contact],
      replaceExisting: true,
      reference,
    };
  },
);

export type SaveContactReducerState = {
  state: ExistingContactsState;
};

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
        const updateEntries = payload.contacts
          .filter(c => {
            return (
              (payload.reference && !(state[c.id]?.references ?? new Set()).has(payload.reference)) ||
              payload.replaceExisting
            );
          })
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
                savedContact: payload.replaceExisting || !current.references.size ? c : state[c.id].savedContact,
                references: payload.reference ? current.references.add(payload.reference) : current.references,
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
