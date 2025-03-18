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

import { dispatchIncident } from '../../components/customIntegrations/uscr/dispatchService';
import { Contact } from '../../types/types';
import type { HrmState } from '..';
import { getCaseTimeline } from '../../services/CaseService';
import { getContactById } from '../../services/ContactService';
import { dispatchAttemptSectionType } from '../../components/customIntegrations/uscr/dispatchAttempt';
import { loadContactIntoRedux, rollbackSavingStateInRedux, contactReduxUpdates } from '../contacts/contactReduxUpdates';
import { loadTimelineIntoRedux } from '../case/timeline';

const INCIDENT_DISPATCH = 'custom-integrations/uscr/incident-dispatch';

export const newIncidentDispatchAction = createAsyncAction(
  INCIDENT_DISPATCH,
  async (contact: Contact) => {
    await dispatchIncident({ contact });
    const updatedContact = await getContactById(contact.id);
    const timeline = await getCaseTimeline(updatedContact.caseId, [dispatchAttemptSectionType], false, {
      offset: 0,
      limit: 1000,
    });
    return { contact: updatedContact, timeline };
  },
  contact => {
    return { contact };
  },
);

export const uscrDispatchReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newIncidentDispatchAction.pending as typeof newIncidentDispatchAction,
      (state: HrmState, { meta: { contact } }) => {
        return {
          ...state,
          activeContacts: contactReduxUpdates(state.activeContacts, contact.id),
        };
      },
    ),
    handleAction(newIncidentDispatchAction.fulfilled, (state: HrmState, { payload: { contact, timeline } }) => {
      const stateWithTimelineUpdates = loadTimelineIntoRedux(state, contact.id, timeline, dispatchAttemptSectionType, {
        offset: 0,
      });

      return {
        ...stateWithTimelineUpdates,
        activeContacts: loadContactIntoRedux(state.activeContacts, contact),
      };
    }),
    handleAction(newIncidentDispatchAction.rejected, (state: HrmState, { meta: { contact } }: any) => {
      const dispatchContact: Contact = contact;
      return {
        ...state,
        activeContacts: rollbackSavingStateInRedux(state.activeContacts, dispatchContact, {}),
      };
    }),
  ]);
