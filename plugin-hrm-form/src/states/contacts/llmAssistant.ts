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

import { ContactMetadata, ContactsState, LoadingStatus } from './types';
import { ContactDraftChanges } from './existingContacts';
import { generateSummary, TranscriptForLlmAssistant } from '../../services/llmAssistantService';
import { Contact, ContactRawJson } from '../../types/types';

const AUTO_GENERATE_SUMMARY_ACTION = 'contact-actions/auto-generate-summary-action';

export const newGenerateSummaryAsyncAction = createAsyncAction(
  AUTO_GENERATE_SUMMARY_ACTION,
  async (
    { id: contactId, channelSid }: Contact,
    form: keyof Pick<ContactRawJson, 'caseInformation' | 'childInformation' | 'callerInformation'>,
    item: string,
  ) => {
    const conversation = await Manager.getInstance().conversationsClient.getConversationBySid(channelSid);
    const messages = await conversation.getMessages(1000);
    const forTranscript: TranscriptForLlmAssistant = messages.items.map(({ author, body }) => ({
      role: author,
      from: author,
      content: body,
    }));
    const { summaryText } = await generateSummary(contactId, forTranscript);

    return { contactId, summaryText, form, item };
  },
  (contact: Contact, form: string, item: string) => ({
    contactId: contact.id,
    form,
    item,
  }),
);

export const llmAssistantReducer = (initialState: ContactsState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newGenerateSummaryAsyncAction.pending,
      (state, action): ContactsState => {
        const { contactId } = (action as any).meta;
        return {
          ...state,
          existingContacts: {
            ...state.existingContacts,
            [contactId]: {
              ...state.existingContacts[contactId],
              metadata: { ...state.existingContacts[contactId].metadata, loadingStatus: LoadingStatus.LOADING },
            },
          },
        };
      },
    ),
    handleAction(
      newGenerateSummaryAsyncAction.fulfilled,
      (state, { payload: { contactId, summaryText, form, item } }): ContactsState => {
        const { draftContact, savedContact } = state.existingContacts[contactId];
        const llmSupportedEntries =
          draftContact?.rawJson?.llmSupportedEntries ?? savedContact.rawJson.llmSupportedEntries ?? {};
        llmSupportedEntries[form] = Array.from(new Set([...(llmSupportedEntries[form] ?? []), item]));
        const existingText = draftContact?.rawJson[form]?.[item] ?? savedContact.rawJson[form]?.[item] ?? '';
        const updatedText = `${existingText}${existingText ? '\n\n' : ''}${summaryText}`;

        const updatedDraft: ContactDraftChanges = {
          ...draftContact,
          rawJson: {
            ...draftContact?.rawJson,
            [form]: {
              ...draftContact?.rawJson[form],
              [item]: updatedText,
            },
            llmSupportedEntries,
          },
        };
        const updatedMetadata: ContactMetadata = {
          ...state.existingContacts[contactId].metadata,
          loadingStatus: LoadingStatus.LOADED,
        };

        return {
          ...state,
          existingContacts: {
            ...state.existingContacts,
            [contactId]: {
              ...state.existingContacts[contactId],
              draftContact: updatedDraft,
              metadata: updatedMetadata,
            },
          },
        };
      },
    ),
    handleAction(
      newGenerateSummaryAsyncAction.rejected,
      (state, action): ContactsState => {
        const { payload } = action;
        const { contactId, form, item } = (action as any).meta;
        const currentDraft = state.existingContacts[contactId].draftContact;
        const updatedDraft: ContactDraftChanges = {
          ...currentDraft,
          rawJson: {
            ...currentDraft?.rawJson,
            [form]: {
              ...currentDraft?.rawJson.caseInformation,
              [item]: payload.toString(),
            },
          },
        };
        const updatedMetadata: ContactMetadata = {
          ...state.existingContacts[contactId].metadata,
          loadingStatus: LoadingStatus.LOADED,
        };
        return {
          ...state,
          existingContacts: {
            ...state.existingContacts,
            [contactId]: {
              ...state.existingContacts[contactId],
              draftContact: updatedDraft,
              metadata: updatedMetadata,
            },
          },
        };
      },
    ),
  ]);
