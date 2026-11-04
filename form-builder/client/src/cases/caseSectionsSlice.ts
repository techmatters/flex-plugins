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
 * The case sections editor: the order the sections are listed in (as rows of section keys, so
 * they can be dragged) and the name typed for a new section. The sections' names, texts and
 * settings are edited straight in the draft (caseSections.ts says which files hold what).
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { DefinitionFileMap } from '../common/definitions';
import { getCaseSections, getForm } from '../common/definitions';
import { AppThunk, RootState, rootReducer } from '../app/store';
import { editDraftFiles } from '../drafts/draftSlice';
import { Row, toRows } from '../common/SortableRows';
import {
  addCaseSection,
  baseLanguageOf,
  CASE_SECTIONS_FILE,
  getSectionLayout,
  removeCaseSection,
  SectionLayout,
  setSectionLayout,
  setSubstitution,
} from './caseSections';

export type CaseSectionsState = {
  // Section keys, in the order they're listed
  rows: Row<string>[];
  // The name typed for a new section
  newLabel: string;
};

const initialState: CaseSectionsState = { rows: [], newLabel: '' };

const caseSectionsSlice = createSlice({
  name: 'caseSections',
  initialState,
  reducers: {
    caseSectionsOpened: (_state, action: PayloadAction<Row<string>[]>) => ({ ...initialState, rows: action.payload }),
    rowsChanged: (state, action: PayloadAction<Row<string>[]>) => {
      state.rows = action.payload;
    },
    newLabelChanged: (state, action: PayloadAction<string>) => {
      state.newLabel = action.payload;
    },
  },
  selectors: {
    selectCaseSections: state => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof caseSectionsSlice> {}
}
const injected = caseSectionsSlice.injectInto(rootReducer);
export const { selectCaseSections } = injected.selectors;
const { caseSectionsOpened, rowsChanged } = caseSectionsSlice.actions;
export const { newLabelChanged } = caseSectionsSlice.actions;

const sectionsFile = (files: DefinitionFileMap) =>
  (files[CASE_SECTIONS_FILE] ?? {}) as Record<string, { label: string; formPath: string }>;

// The helpline's own wording goes under its base language (e.g. 'en' for 'en-US')
const languageOf = (state: RootState) => baseLanguageOf(state.workspace.definitions?.helplineLanguage);

// Starts editing from the draft
export const openCaseSections = (): AppThunk => (dispatch, getState) => {
  dispatch(caseSectionsOpened(toRows(getCaseSections(getState().draft.files).map(section => section.key))));
};

export const reorderSections =
  (rows: Row<string>[]): AppThunk =>
  dispatch => {
    dispatch(rowsChanged(rows));
    dispatch(
      editDraftFiles(files => {
        const current = sectionsFile(files);
        let updated: DefinitionFileMap = {
          ...files,
          [CASE_SECTIONS_FILE]: Object.fromEntries(rows.map(row => [row.value, current[row.value]])),
        };
        // The case page sorts by caseHomeOrder, so number them in the new order
        rows.forEach((row, index) => {
          updated = setSectionLayout(updated, row.value, {
            ...getSectionLayout(updated, row.value),
            caseHomeOrder: index + 1,
          });
        });
        return updated;
      }),
    );
  };

// A section named as typed, with a form to start from (see addCaseSection)
export const addSection = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const label = selectCaseSections(state).newLabel.trim();
  if (!label) return;
  const { files, key } = addCaseSection(state.draft.files, label, languageOf(state));
  dispatch(editDraftFiles(() => files));
  dispatch(rowsChanged([...selectCaseSections(state).rows, ...toRows([key])]));
  dispatch(newLabelChanged(''));
};

export const removeSection =
  (key: string): AppThunk =>
  (dispatch, getState) => {
    dispatch(editDraftFiles(files => removeCaseSection(files, key)));
    dispatch(rowsChanged(selectCaseSections(getState()).rows.filter(row => row.value !== key)));
  };

export const renameSection = (key: string, label: string): AppThunk =>
  editDraftFiles(files => ({
    ...files,
    [CASE_SECTIONS_FILE]: { ...sectionsFile(files), [key]: { ...sectionsFile(files)[key], label } },
  }));

// A text from the helpline's translations, e.g. the section's heading or add button
export const setSectionText =
  (textKey: string, text: string): AppThunk =>
  (dispatch, getState) => {
    const language = languageOf(getState());
    dispatch(editDraftFiles(files => setSubstitution(files, language, textKey, text)));
  };

const updateLayout = (key: string, change: (layout: SectionLayout) => SectionLayout): AppThunk =>
  editDraftFiles(files => setSectionLayout(files, key, change(getSectionLayout(files, key))));

export const setSectionLocation = (key: string, caseHomeLocation: 'list' | 'timeline'): AppThunk =>
  updateLayout(key, layout => ({ ...layout, caseHomeLocation }));

// Shows or hides a field in the section's list, keeping the form's order
export const togglePreviewField = (key: string, name: string): AppThunk =>
  editDraftFiles(files => {
    const layout = getSectionLayout(files, key);
    const current = layout.previewFields ?? [];
    const formPath = sectionsFile(files)[key]?.formPath;
    const formFieldNames = ((formPath && getForm(files, formPath)) || []).map(item => item.name);
    return setSectionLayout(files, key, {
      ...layout,
      previewFields: current.includes(name)
        ? current.filter(other => other !== name)
        : formFieldNames.filter(other => other === name || current.includes(other)),
    });
  });
