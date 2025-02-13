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
import { Manager } from '@twilio/flex-ui';

import { ContactsState } from './types';
import { ContactDraftChanges } from './existingContacts';
import { generateSummary, TranscriptForLlmAssistant } from '../../services/llmAssistantService';

const AUTO_GENERATE_SUMMARY_ACTION = 'contact-actions/auto-generate-summary-action';

export const newGenerateSummaryAsyncAction = createAsyncAction(
  AUTO_GENERATE_SUMMARY_ACTION,
  async (task: ITask) => {
    const { conversationSid, channelSid, contactId } = task.attributes;
    const conversation = await Manager.getInstance().conversationsClient.getConversationBySid(
      conversationSid ?? channelSid,
    );
    const messages = await conversation.getMessages(1000);
    const forTranscript: TranscriptForLlmAssistant = messages.items.map(({ author, body }) => ({
      role: author,
      content: body,
    }));
    const { summaryText } = await generateSummary(contactId, forTranscript);
    return { contactId, summaryText };
  },
  (task: ITask) => ({
    contactId: task.attributes.contactId,
  }),
);

export const llmAssistantReducer = (initialState: ContactsState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newGenerateSummaryAsyncAction.fulfilled,
      (state, { payload: { contactId, summaryText } }): ContactsState => {
        const currentDraft = state.existingContacts[contactId].draftContact;
        const updatedDraft: ContactDraftChanges = {
          ...currentDraft,
          rawJson: {
            ...currentDraft?.rawJson,
            caseInformation: {
              ...currentDraft?.rawJson.caseInformation,
              callSummary: summaryText,
            },
          },
        };
        return {
          ...state,
          existingContacts: {
            ...state.existingContacts,
            [contactId]: {
              ...state.existingContacts[contactId],
              draftContact: updatedDraft,
            },
          },
        };
      },
    ),
    handleAction(
      newGenerateSummaryAsyncAction.rejected,
      (state, action): ContactsState => {
        const { payload } = action;
        const { contactId } = (action as any).meta;
        const currentDraft = state.existingContacts[contactId].draftContact;
        const updatedDraft: ContactDraftChanges = {
          ...currentDraft,
          rawJson: {
            ...currentDraft?.rawJson,
            caseInformation: {
              ...currentDraft?.rawJson.caseInformation,
              callSummary: payload.toString(),
            },
          },
        };
        return {
          ...state,
          existingContacts: {
            ...state.existingContacts,
            [contactId]: {
              ...state.existingContacts[contactId],
              draftContact: updatedDraft,
            },
          },
        };
      },
    ),
  ]);
