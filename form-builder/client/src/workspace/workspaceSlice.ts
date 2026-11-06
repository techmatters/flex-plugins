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
 * The helpline open in the workspace: its files, which screen shows, the dialogs open, and the
 * problems found in its draft (validation, worked out by selectors).
 */
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DefinitionFiles } from '@tech-matters/form-builder-shared';

import type { AppThunk, RootState } from '../app/store';
import { caseSectionTarget, CONTACT_TABS, getCaseSections, isContactTab } from '../common/definitions';
import { validateSections } from '../chatsAndCalls/sections';
import { validateContactTab, ValidationIssue } from '../forms/validation';
import type { PreviewFocus } from '../aseloPreview/FlexDesktopPreview';
import {
  discardDraft,
  draftStarted,
  loadDraft,
  selectChangedPaths,
  selectDraftFiles,
  selectOriginalFiles,
} from '../drafts/draftSlice';

// Which screen is showing in the main area
export type View =
  | { kind: 'contactTab'; tabKey: string }
  | { kind: 'categories' }
  | { kind: 'callTypes' }
  | { kind: 'cannedResponses' }
  | { kind: 'messages' }
  | { kind: 'webchat' }
  | { kind: 'caseStatus' }
  | { kind: 'caseSections' }
  | { kind: 'features' }
  | { kind: 'serviceConfig' }
  | { kind: 'profiles' }
  | { kind: 'caseSection'; sectionKey: string };

export const sameView = (a: View, b: View) => JSON.stringify(a) === JSON.stringify(b);

const FIRST_VIEW: View = { kind: 'contactTab', tabKey: CONTACT_TABS[0].key };

type WorkspaceState = {
  code: string;
  version: string;
  definitions?: DefinitionFiles;
  loading: boolean;
  error?: string;
  view: View;
  // What the full-screen "Try it out" preview opens on, when it's open
  tryItOut?: { focus: PreviewFocus; tab?: string };
  reviewing: boolean;
  // The case section whose Aselo preview is open
  previewingSection?: string;
  // Bumped when the draft's files are replaced (discarded, reloaded), so editors start again from them
  editorRevision: number;
};

const initialState: WorkspaceState = {
  code: '',
  version: '',
  loading: false,
  view: FIRST_VIEW,
  reviewing: false,
  editorRevision: 0,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    helplineRequested: (state, action: PayloadAction<{ code: string; version: string }>) => ({
      ...initialState,
      ...action.payload,
      loading: true,
      editorRevision: state.editorRevision + 1,
    }),
    helplineLoaded: (state, action: PayloadAction<DefinitionFiles>) => {
      state.definitions = action.payload;
      state.loading = false;
    },
    helplineFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    viewSelected: (state, action: PayloadAction<View>) => {
      state.view = action.payload;
    },
    tryItOutOpened: (state, action: PayloadAction<{ focus: PreviewFocus; tab?: string }>) => {
      state.tryItOut = action.payload;
    },
    tryItOutClosed: state => {
      state.tryItOut = undefined;
    },
    reviewOpened: state => {
      state.reviewing = true;
    },
    reviewClosed: state => {
      state.reviewing = false;
    },
    sectionPreviewOpened: (state, action: PayloadAction<string>) => {
      state.previewingSection = action.payload;
    },
    sectionPreviewClosed: state => {
      state.previewingSection = undefined;
    },
    editorsRestarted: state => {
      state.editorRevision += 1;
    },
  },
});

const { helplineRequested, helplineLoaded, helplineFailed, editorsRestarted } = workspaceSlice.actions;
export const {
  viewSelected,
  tryItOutOpened,
  tryItOutClosed,
  reviewOpened,
  reviewClosed,
  sectionPreviewOpened,
  sectionPreviewClosed,
} = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;

export const selectWorkspace = (state: RootState) => state.workspace;
export const selectDefinitions = (state: RootState) => state.workspace.definitions;

// Opens a helpline's forms: its files, then its saved draft
export const openHelpline =
  (code: string, version: string): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { fetchDefinitionFiles }) => {
    dispatch(helplineRequested({ code, version }));
    try {
      const definitions = await fetchDefinitionFiles(code, version);
      dispatch(helplineLoaded(definitions));
      dispatch(draftStarted({ code, version, original: definitions.files }));
      await dispatch(loadDraft());
    } catch (err) {
      dispatch(helplineFailed((err as Error).message));
    }
  };

// Loads the open helpline again (after applying, or when someone else changed the draft)
export const reloadHelpline = (): AppThunk<Promise<void>> => (dispatch, getState) => {
  const { code, version } = getState().workspace;
  return dispatch(openHelpline(code, version));
};

export const discardWorkspaceDraft = (): AppThunk<Promise<void>> => async dispatch => {
  await dispatch(discardDraft());
  dispatch(editorsRestarted());
};

// The forms the draft has: the contact tabs, and each case section's form
export const selectCaseTargets = createSelector([selectDraftFiles], files =>
  getCaseSections(files).map(caseSectionTarget),
);

// Problems in each form: contact tabs by tab key, case section forms by `case:<section key>`
export const selectIssuesByTab = createSelector(
  [selectDraftFiles, selectOriginalFiles, selectCaseTargets],
  (files, originalFiles, caseTargets) =>
    Object.fromEntries([
      ...CONTACT_TABS.map(tab => [tab.key, validateContactTab(files, originalFiles, tab)]),
      ...caseTargets.map(target => [`case:${target.key}`, validateContactTab(files, originalFiles, target)]),
    ]) as Record<string, ValidationIssue[]>,
);

export const selectSectionIssues = createSelector(
  [selectDraftFiles, selectOriginalFiles, (state: RootState) => state.workspace.code],
  (files, originalFiles, code) => validateSections(files, originalFiles, code),
);

// For the review: problems in forms the draft changes (anything blocking always counts), so
// reviewers aren't shown old notes about forms nobody touched
export const selectReviewIssues = createSelector(
  [selectIssuesByTab, selectSectionIssues, selectCaseTargets, selectChangedPaths],
  (issuesByTab, sectionIssues, caseTargets, changedPaths) => {
    const changed = new Set(changedPaths);
    return [
      ...[...CONTACT_TABS, ...caseTargets].flatMap(target => {
        const issues = issuesByTab[isContactTab(target) ? target.key : `case:${target.key}`] ?? [];
        return changed.has(target.filePath) ? issues : issues.filter(issue => issue.severity === 'error');
      }),
      ...sectionIssues,
    ];
  },
);
