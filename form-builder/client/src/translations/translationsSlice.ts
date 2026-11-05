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
 * The translations editor (Aselo staff only): whose text (Aselo's or the webchat's), the language
 * shown, the default text in it (loaded from the plugin's or the webchat app's files), the search
 * and filter, the string being edited, find & replace, and what a spreadsheet import did. Every
 * change is written to the draft: customStrings/Substitutions.json for Aselo's text, the
 * webchat's translations file for the locale for the webchat's (translations.ts).
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';

import { AppThunk, rootReducer, RootState } from '../app/store';
import type { DefinitionFileMap } from '../common/definitions';
import { editDraftFiles, selectDraftFiles } from '../drafts/draftSlice';
import { selectDefinitions } from '../workspace/workspaceSlice';
import { loadPluginStrings } from '../aseloPreview/translations';
import { parseDelimitedText } from '../linkedDropdowns/spreadsheet';
import { baseWebchatStrings, getWebchatLocales, translatedWebchatKeys } from '../webchat/webchat';
import {
  filterTranslationRows,
  findReplacements,
  getTranslationRows,
  helplineLanguages,
  localeFor,
  ownFileOf,
  setTranslation,
  setTranslations,
  Strings,
  TranslationFilter,
  translationsFromSpreadsheet,
  TranslationTarget,
} from './translations';

// Rows shown at first, and added by "Show more" (Aselo has about 700 strings)
const PAGE_SIZE = 100;

type TranslationsState = {
  target: TranslationTarget;
  language: string;
  // Languages added here that have no text of their own yet
  addedLanguages: string[];
  // Aselo's own text in the language shown, from the plugin's files
  aselo?: { locale: string; strings: Strings; translated: string[] };
  search: string;
  filter: TranslationFilter;
  shown: number;
  editingKey?: string;
  findReplace: {
    open: boolean;
    find: string;
    replace: string;
    matchCase: boolean;
    wholeWord: boolean;
    skipped: string[];
  };
  notice?: { kind: 'ok' | 'error'; text: string };
};

const initialFindReplace = { open: false, find: '', replace: '', matchCase: false, wholeWord: true, skipped: [] };

const initialState: TranslationsState = {
  target: 'aselo',
  language: 'en',
  addedLanguages: [],
  search: '',
  filter: 'all',
  shown: PAGE_SIZE,
  findReplace: initialFindReplace,
};

const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    translationsOpened: (_state, action: PayloadAction<{ target: TranslationTarget; language: string }>) => ({
      ...initialState,
      ...action.payload,
    }),
    languageChosen: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      state.aselo = undefined;
      state.editingKey = undefined;
      state.shown = PAGE_SIZE;
      state.findReplace.skipped = [];
      state.notice = undefined;
    },
    languageAdded: (state, action: PayloadAction<string>) => {
      if (!state.addedLanguages.includes(action.payload)) state.addedLanguages.push(action.payload);
    },
    aseloTextLoaded: (state, action: PayloadAction<NonNullable<TranslationsState['aselo']>>) => {
      state.aselo = action.payload;
    },
    searchChanged: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.shown = PAGE_SIZE;
    },
    filterChanged: (state, action: PayloadAction<TranslationFilter>) => {
      state.filter = action.payload;
      state.shown = PAGE_SIZE;
    },
    moreShown: state => {
      state.shown += PAGE_SIZE;
    },
    editingToggled: (state, action: PayloadAction<string>) => {
      state.editingKey = state.editingKey === action.payload ? undefined : action.payload;
    },
    findReplaceChanged: (state, action: PayloadAction<Partial<TranslationsState['findReplace']>>) => {
      const { skipped, ...rest } = action.payload;
      // A different search: everything found counts again
      const isNewSearch = Object.keys(rest).some(key => key !== 'open');
      state.findReplace = {
        ...state.findReplace,
        ...rest,
        skipped: skipped ?? (isNewSearch ? [] : state.findReplace.skipped),
      };
    },
    replacementSkipped: (state, action: PayloadAction<string>) => {
      const { skipped } = state.findReplace;
      state.findReplace.skipped = skipped.includes(action.payload)
        ? skipped.filter(key => key !== action.payload)
        : [...skipped, action.payload];
    },
    replaced: (state, action: PayloadAction<number>) => {
      state.findReplace = { ...initialFindReplace, open: true };
      state.notice = { kind: 'ok', text: `Replaced in ${action.payload} string${action.payload === 1 ? '' : 's'}.` };
    },
    noticeShown: (state, action: PayloadAction<TranslationsState['notice']>) => {
      state.notice = action.payload;
    },
  },
  selectors: {
    selectTranslations: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof translationsSlice> {}
}
const injected = translationsSlice.injectInto(rootReducer);
export const { selectTranslations } = injected.selectors;
const { translationsOpened, languageChosen, languageAdded, aseloTextLoaded, replaced, noticeShown } =
  translationsSlice.actions;
export const { searchChanged, filterChanged, moreShown, editingToggled, findReplaceChanged, replacementSkipped } =
  translationsSlice.actions;

const selectHelplineLanguage = (state: RootState) => selectDefinitions(state)?.helplineLanguage;
const selectWebchatDefaultLocale = (state: RootState) => selectDefinitions(state)?.webchat?.defaultLocale ?? 'en-US';

// Whether the helpline has a webchat, so its text can be translated here too
export const selectHasWebchat = (state: RootState) => Boolean(selectDefinitions(state)?.webchat);

// The webchat's languages: a translations file per locale, the default first
const webchatLanguages = (files: DefinitionFileMap, defaultLocale: string) => {
  const locales = getWebchatLocales(files, defaultLocale);
  return locales.includes(defaultLocale) ? locales : [defaultLocale, ...locales];
};

const languagesOf = (state: RootState, target: TranslationTarget) =>
  target === 'aselo'
    ? helplineLanguages(selectDraftFiles(state), selectHelplineLanguage(state))
    : webchatLanguages(selectDraftFiles(state), selectWebchatDefaultLocale(state));

// The helpline's languages, then the ones added here
export const selectLanguages = createSelector(
  [
    selectDraftFiles,
    selectHelplineLanguage,
    selectWebchatDefaultLocale,
    (state: RootState) => selectTranslations(state).target,
    (state: RootState) => selectTranslations(state).addedLanguages,
  ],
  (files, helplineLanguage, defaultLocale, target, added) => [
    ...new Set([
      ...(target === 'aselo' ? helplineLanguages(files, helplineLanguage) : webchatLanguages(files, defaultLocale)),
      ...added,
    ]),
  ],
);

// Every string in the language shown (none until Aselo's text has loaded)
export const selectTranslationRows = createSelector(
  [
    selectDraftFiles,
    (state: RootState) => selectTranslations(state).language,
    (state: RootState) => selectTranslations(state).aselo,
    (state: RootState) => selectTranslations(state).target,
  ],
  (files, language, aselo, target) => (aselo ? getTranslationRows(files, language, aselo, target) : []),
);

export const selectVisibleTranslationRows = createSelector(
  [
    selectTranslationRows,
    (state: RootState) => selectTranslations(state).filter,
    (state: RootState) => selectTranslations(state).search,
  ],
  filterTranslationRows,
);

// What find & replace would change, in every string of the language (not only those shown)
export const selectReplacements = createSelector(
  [selectTranslationRows, (state: RootState) => selectTranslations(state).findReplace],
  (rows, { find, replace, matchCase, wholeWord }) => findReplacements(rows, find, replace, { matchCase, wholeWord }),
);

/**
 * Writes the helpline's text for the language shown (Substitutions.json, or the webchat's file
 * for the locale); a file the helpline didn't have, emptied again, isn't created
 */
const editOwnText =
  (updater: (files: DefinitionFileMap) => DefinitionFileMap): AppThunk =>
  (dispatch, getState) => {
    const { target, language } = selectTranslations(getState());
    const filePath = ownFileOf(target, language);
    const hadFile = filePath in getState().draft.original;
    dispatch(
      editDraftFiles(files => {
        const { [filePath]: own, ...rest } = updater(files);
        const isEmpty = !own || Object.keys(own as object).length === 0;
        return isEmpty && !hadFile ? rest : { ...rest, [filePath]: own ?? {} };
      }),
    );
  };

/**
 * The default text in the language shown: Aselo's, in the helpline's locale when it's that
 * language, or the webchat app's for the locale
 */
const loadAseloText = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { target, language } = selectTranslations(getState());
  if (target === 'webchat') {
    dispatch(
      aseloTextLoaded({
        locale: language,
        strings: baseWebchatStrings(language),
        translated: translatedWebchatKeys(language),
      }),
    );
    return;
  }
  const locale = localeFor(language, selectHelplineLanguage(getState()));
  const loaded = await loadPluginStrings(locale);
  // Only if what's shown hasn't changed in the meantime
  const current = selectTranslations(getState());
  if (current.target === target && current.language === language) dispatch(aseloTextLoaded({ locale, ...loaded }));
};

// Starts the editor again, on Aselo's text (or the webchat's) in the helpline's own language
export const openTranslations =
  (target: TranslationTarget = 'aselo'): AppThunk =>
  (dispatch, getState) => {
    const [first] = languagesOf(getState(), target);
    dispatch(translationsOpened({ target, language: first }));
    dispatch(loadAseloText());
  };

export const chooseLanguage =
  (language: string): AppThunk =>
  dispatch => {
    dispatch(languageChosen(language));
    dispatch(loadAseloText());
  };

/**
 * A language the helpline doesn't have text for yet: Aselo's text is by language ("pt"), the
 * webchat's by locale ("es-CL", as its files are named)
 */
export const addLanguage =
  (code: string): AppThunk =>
  (dispatch, getState) => {
    const isWebchat = selectTranslations(getState()).target === 'webchat';
    const typed = code.trim();
    const language = isWebchat ? typed : typed.toLowerCase().split('-')[0];
    const valid = isWebchat ? /^[a-z]{2,3}([-_][A-Za-z]{2,4})?$/.test(language) : /^[a-z]{2,3}$/.test(language);
    if (!valid) {
      dispatch(
        noticeShown({
          kind: 'error',
          text: isWebchat
            ? 'Use the locale’s code, e.g. es-CL or fr-CA.'
            : 'Use the language’s two-letter code, e.g. es, fr or pt.',
        }),
      );
      return;
    }
    dispatch(languageAdded(language));
    dispatch(chooseLanguage(language));
  };

// The helpline's text for a string; undefined (or Aselo's own text) goes back to Aselo's
export const editTranslation =
  (key: string, text: string | undefined): AppThunk =>
  (dispatch, getState) => {
    const { language, target } = selectTranslations(getState());
    const row = selectTranslationRows(getState()).find(candidate => candidate.key === key);
    dispatch(editOwnText(files => setTranslation(files, language, key, text, row?.aseloText, target)));
  };

export const applyReplacements = (): AppThunk => (dispatch, getState) => {
  const { language, target, findReplace } = selectTranslations(getState());
  const chosen = selectReplacements(getState()).filter(replacement => !findReplace.skipped.includes(replacement.key));
  if (chosen.length === 0) return;
  dispatch(
    editOwnText(files =>
      setTranslations(
        files,
        language,
        chosen.map(({ key, after, aseloText }) => ({ key, text: after, aseloText })),
        target,
      ),
    ),
  );
  dispatch(replaced(chosen.length));
};

// A spreadsheet (CSV, or cells pasted from Excel or Google Sheets) as exported, filled in
export const importSpreadsheet =
  (text: string): AppThunk =>
  (dispatch, getState) => {
    const { language, target } = selectTranslations(getState());
    const { changes, error } = translationsFromSpreadsheet(parseDelimitedText(text), selectTranslationRows(getState()));
    if (error) {
      dispatch(noticeShown({ kind: 'error', text: error }));
      return;
    }
    if (changes.length > 0) dispatch(editOwnText(files => setTranslations(files, language, changes, target)));
    dispatch(
      noticeShown({
        kind: 'ok',
        text:
          changes.length > 0
            ? `${changes.length} string${changes.length === 1 ? '' : 's'} updated from the spreadsheet.`
            : 'The spreadsheet has no changes from what’s here.',
      }),
    );
  };

export const dismissNotice = (): AppThunk => dispatch => dispatch(noticeShown(undefined));
