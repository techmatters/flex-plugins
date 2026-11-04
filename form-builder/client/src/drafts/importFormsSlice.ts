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
 * Importing a helpline's forms (ImportForms.tsx, Aselo staff): the helpline and branch chosen, its
 * versions in that branch once read, which were imported, and errors. A preview is of one helpline
 * and branch: choosing another one clears it.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { BranchChoice } from '@tech-matters/form-builder-shared';
import { AppThunk, rootReducer } from '../app/store';
import { loadDrafts } from './draftsListSlice';

export type ImportFormsState = {
  code: string;
  branch: string;
  // The helpline's versions in the branch, once read
  versions?: string[];
  imported: string[];
  error?: string;
  working: boolean;
};

const initialState: ImportFormsState = { code: '', branch: '', imported: [], working: false };

const importFormsSlice = createSlice({
  name: 'importForms',
  initialState,
  reducers: {
    // Left (a helpline opened): it starts again next time
    importFormsClosed: () => initialState,
    importChosen: (state, action: PayloadAction<{ code?: string; branch?: string }>) => {
      Object.assign(state, action.payload);
      state.versions = undefined;
      state.imported = [];
      state.error = undefined;
    },
    importStarted: (state) => {
      state.working = true;
      state.error = undefined;
    },
    previewRead: (state, action: PayloadAction<string[]>) => {
      state.working = false;
      state.versions = action.payload;
    },
    versionImported: (state, action: PayloadAction<string>) => {
      state.working = false;
      state.imported.push(action.payload);
    },
    importFailed: (state, action: PayloadAction<string>) => {
      state.working = false;
      state.error = action.payload;
    },
  },
  selectors: {
    selectImportForms: (state) => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof importFormsSlice> {}
}
const injected = importFormsSlice.injectInto(rootReducer);
export const { selectImportForms } = injected.selectors;
const { importStarted, previewRead, versionImported, importFailed } = importFormsSlice.actions;
export const { importFormsClosed, importChosen } = importFormsSlice.actions;

// The flex-plugins branches to suggest (BranchPicker)
export const loadImportBranches =
  (): AppThunk<Promise<BranchChoice[]>> =>
  (_dispatch, _getState, { fetchBranches }) =>
    fetchBranches();

// The chosen helpline's versions in the chosen branch
export const previewImport =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { fetchHelplines }) => {
    const { code, branch } = selectImportForms(getState());
    dispatch(importStarted());
    try {
      const helpline = (await fetchHelplines(branch)).find((candidate) => candidate.code === code);
      if (!helpline) throw new Error(`${branch || 'master'} has no forms for ${code.toUpperCase()}.`);
      dispatch(previewRead(helpline.versions));
    } catch (err) {
      dispatch(importFailed((err as Error).message));
    }
  };

// Imports a version, and shows it in the forms list
export const importVersion =
  (version: string): AppThunk<Promise<void>> =>
  async (dispatch, getState, { draftClient }) => {
    const { code, branch } = selectImportForms(getState());
    dispatch(importStarted());
    try {
      await draftClient.importFromBranch(code, version, branch);
      dispatch(versionImported(version));
      dispatch(loadDrafts());
    } catch (err) {
      dispatch(importFailed((err as Error).message));
    }
  };
