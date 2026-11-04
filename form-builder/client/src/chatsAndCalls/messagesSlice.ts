/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * The automatic messages editor: the language being edited and the language code being typed to
 * add one. The messages themselves are edited straight in the draft: customStrings/Messages.json
 * and customStrings/postSurveyMessages.json, both grouped by language, though the post-survey
 * file can also be flat (one set for every language) and keeps whichever shape it has.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { DefinitionFileMap } from '../common/definitions';
import { AppThunk, rootReducer } from '../app/store';
import { editDraftFiles } from '../drafts/draftSlice';
import { getMessages, isFlatMessages, LocalizedMessages, MESSAGES_FILE, POST_SURVEY_MESSAGES_FILE } from './sections';

export const ALL_LANGUAGES = '(all languages)';

export type MessagesState = {
  language: string;
  // A language code being typed to add
  newLanguage: string;
};

const initialState: MessagesState = { language: 'en', newLanguage: '' };

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    messagesOpened: (_state, action: PayloadAction<string>) => ({ ...initialState, language: action.payload }),
    languageSelected: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    newLanguageChanged: (state, action: PayloadAction<string>) => {
      state.newLanguage = action.payload;
    },
  },
  selectors: {
    selectMessages: (state) => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof messagesSlice> {}
}
const injected = messagesSlice.injectInto(rootReducer);
export const { selectMessages } = injected.selectors;
const { messagesOpened } = messagesSlice.actions;
export const { languageSelected, newLanguageChanged } = messagesSlice.actions;

// The post-survey messages, grouped by language even when the file is flat
export const getSurveyMessages = (files: DefinitionFileMap): { surveyIsFlat: boolean; surveyMessages: LocalizedMessages } => {
  const surveyFile = files[POST_SURVEY_MESSAGES_FILE];
  const surveyIsFlat = isFlatMessages(surveyFile);
  return {
    surveyIsFlat,
    surveyMessages: surveyIsFlat
      ? { [ALL_LANGUAGES]: surveyFile as Record<string, string> }
      : ((surveyFile ?? {}) as LocalizedMessages),
  };
};

// The languages either file has messages in
export const getMessageLanguages = (files: DefinitionFileMap): string[] => [
  ...new Set(
    [...Object.keys(getMessages(files)), ...Object.keys(getSurveyMessages(files).surveyMessages)].filter(
      (language) => language !== ALL_LANGUAGES,
    ),
  ),
];

// Sets or removes (when empty) one message, keeping the file's shape
const withMessage = (file: unknown, language: string, key: string, text: string): Record<string, unknown> => {
  if (language === ALL_LANGUAGES) {
    const flat = { ...((file ?? {}) as Record<string, string>) };
    if (text) flat[key] = text;
    else delete flat[key];
    return flat;
  }
  const localized = { ...((file ?? {}) as LocalizedMessages) };
  const messages = { ...(localized[language] ?? {}) };
  if (text) messages[key] = text;
  else delete messages[key];
  localized[language] = messages;
  return localized;
};

// Starts on the first language the draft has
export const openMessages = (): AppThunk => (dispatch, getState) => {
  dispatch(messagesOpened(getMessageLanguages(getState().draft.files)[0] ?? 'en'));
};

export const setChatMessage =
  (key: string, text: string): AppThunk =>
  (dispatch, getState) => {
    const { language } = selectMessages(getState());
    dispatch(
      editDraftFiles((files) => ({ ...files, [MESSAGES_FILE]: withMessage(files[MESSAGES_FILE], language, key, text) })),
    );
  };

// In the language being edited, or for every language when the file is flat
export const setSurveyMessage =
  (key: string, text: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const surveyLanguage = getSurveyMessages(state.draft.files).surveyIsFlat
      ? ALL_LANGUAGES
      : selectMessages(state).language;
    dispatch(
      editDraftFiles((files) => ({
        ...files,
        [POST_SURVEY_MESSAGES_FILE]: withMessage(files[POST_SURVEY_MESSAGES_FILE], surveyLanguage, key, text),
      })),
    );
  };

// Switches to the language code typed (its messages are added as they're written)
export const addLanguage = (): AppThunk => (dispatch, getState) => {
  const code = selectMessages(getState()).newLanguage.trim();
  if (!code) return;
  dispatch(languageSelected(code));
  dispatch(newLanguageChanged(''));
};
