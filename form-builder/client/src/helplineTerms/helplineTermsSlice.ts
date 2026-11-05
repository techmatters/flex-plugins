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
 * Helpline terms: Aselo's English text (loaded from the plugin's en.json, to make the strings
 * from), which terms have "Something else" open, and whether the words found in the helpline's
 * own text were set aside. The terms themselves are in the draft (terms.ts).
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';

import { AppThunk, rootReducer, RootState } from '../app/store';
import type { DefinitionFileMap } from '../common/definitions';
import { editDraftFiles, selectDraftFiles } from '../drafts/draftSlice';
import { loadPluginStrings } from '../aseloPreview/translations';
import { HELPLINE_TERMS_FILE, Strings, SUBSTITUTIONS_FILE } from '../translations/translations';
import {
  applyHelplineTerms,
  getHelplineTerms,
  guessHelplineTerms,
  handWrittenKeys,
  HelplineTerms,
  termCatalogue,
  TermId,
  termsUsedBy,
  TermWords,
} from './terms';

type HelplineTermsState = {
  english?: Strings;
  // Terms with "Something else" open, before (or while) their words are typed
  customOpen: TermId[];
  guessDismissed: boolean;
};

const initialState: HelplineTermsState = { customOpen: [], guessDismissed: false };

const helplineTermsSlice = createSlice({
  name: 'helplineTerms',
  initialState,
  reducers: {
    helplineTermsOpened: state => ({ ...initialState, english: state.english }),
    englishLoaded: (state, action: PayloadAction<Strings>) => {
      state.english = action.payload;
    },
    customToggled: (state, action: PayloadAction<{ id: TermId; open: boolean }>) => {
      const { id, open } = action.payload;
      state.customOpen = open ? [...new Set([...state.customOpen, id])] : state.customOpen.filter(term => term !== id);
    },
    guessDismissed: state => {
      state.guessDismissed = true;
    },
  },
  selectors: {
    selectHelplineTermsEditor: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof helplineTermsSlice> {}
}
const injected = helplineTermsSlice.injectInto(rootReducer);
export const { selectHelplineTermsEditor } = injected.selectors;
const { helplineTermsOpened, englishLoaded, customToggled } = helplineTermsSlice.actions;
export const { guessDismissed } = helplineTermsSlice.actions;

// Every Aselo string with one of the words, as a template (none until Aselo's text has loaded)
export const selectTermCatalogue = createSelector(
  [(state: RootState) => selectHelplineTermsEditor(state).english],
  english => (english ? termCatalogue(english) : []),
);

export const selectHelplineTerms = createSelector([selectDraftFiles], getHelplineTerms);

// The words the helpline's own text already uses, offered when it hasn't chosen any here yet
export const selectGuessedTerms = createSelector(
  [selectDraftFiles, selectTermCatalogue, (state: RootState) => selectHelplineTermsEditor(state).guessDismissed],
  (files, catalogue, dismissed): HelplineTerms => {
    if (dismissed || catalogue.length === 0 || HELPLINE_TERMS_FILE in files) return {};
    return guessHelplineTerms(files, catalogue);
  },
);

// Strings written by hand that use each term (they keep their own wording)
export const selectHandWrittenByTerm = createSelector([selectDraftFiles, selectTermCatalogue], (files, catalogue) => {
  const handWritten = new Set(handWrittenKeys(files, catalogue));
  const byTerm: Partial<Record<TermId, string[]>> = {};
  catalogue
    .filter(({ key }) => handWritten.has(key))
    .forEach(({ key, template }) =>
      termsUsedBy(template).forEach(term => {
        byTerm[term] = [...(byTerm[term] ?? []), key];
      }),
    );
  return byTerm;
});

// Writes the terms and the strings they make; files the helpline didn't have, left empty, aren't created
const editTerms =
  (terms: HelplineTerms, replaceHandWritten: string[] = []): AppThunk =>
  (dispatch, getState) => {
    const catalogue = selectTermCatalogue(getState());
    if (catalogue.length === 0) return;
    const { original } = getState().draft;
    dispatch(
      editDraftFiles(files => {
        const next: DefinitionFileMap = applyHelplineTerms(files, terms, catalogue, replaceHandWritten);
        // An English block the helpline had, even empty, stays (so undoing a choice leaves the file as it was)
        const originalSubstitutions = original[SUBSTITUTIONS_FILE] as Record<string, unknown> | undefined;
        const substitutions = next[SUBSTITUTIONS_FILE] as Record<string, unknown> | undefined;
        if (originalSubstitutions && 'en' in originalSubstitutions && substitutions && !('en' in substitutions)) {
          next[SUBSTITUTIONS_FILE] = { ...substitutions, en: {} };
        }
        const isEmpty = (filePath: string) => {
          const value = next[filePath] as { terms?: object } | undefined;
          if (!value) return true;
          return filePath === HELPLINE_TERMS_FILE
            ? Object.keys(value.terms ?? {}).length === 0
            : Object.keys(value).length === 0;
        };
        [SUBSTITUTIONS_FILE, HELPLINE_TERMS_FILE]
          .filter(filePath => !(filePath in original) && isEmpty(filePath))
          .forEach(filePath => delete next[filePath]);
        return next;
      }),
    );
  };

export const openHelplineTerms = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  dispatch(helplineTermsOpened());
  if (!selectHelplineTermsEditor(getState()).english) {
    dispatch(englishLoaded((await loadPluginStrings('en')).strings));
  }
};

// A term's words; undefined goes back to Aselo's word
export const chooseTerm =
  (id: TermId, words: TermWords | undefined): AppThunk =>
  (dispatch, getState) => {
    const { [id]: _previous, ...others } = selectHelplineTerms(getState());
    dispatch(editTerms(words ? { ...others, [id]: words } : others));
  };

export const openCustomTerm =
  (id: TermId, open: boolean): AppThunk =>
  dispatch =>
    dispatch(customToggled({ id, open }));

// The words found in the helpline's own text, as its terms
export const adoptGuessedTerms = (): AppThunk => (dispatch, getState) => {
  dispatch(editTerms({ ...selectGuessedTerms(getState()), ...selectHelplineTerms(getState()) }));
};

// Aselo staff: the strings written by hand that use a term, made from the terms like the rest
export const replaceHandWritten =
  (id: TermId): AppThunk =>
  (dispatch, getState) => {
    const keys = selectHandWrittenByTerm(getState())[id] ?? [];
    dispatch(editTerms(selectHelplineTerms(getState()), keys));
  };
