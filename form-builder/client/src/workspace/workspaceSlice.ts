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
import { ASELO_PEOPLE_CODE, Person } from '@tech-matters/form-builder-shared/flows/model';

import type { AppThunk, RootState } from '../app/store';
import { caseSectionTarget, CONTACT_TABS, getCaseSections, isContactTab } from '../common/definitions';
import { validateSections } from '../chatsAndCalls/sections';
import { validateContactTab, ValidationIssue } from '../forms/validation';
import type { PreviewFocus } from '../aseloPreview/FlexDesktopPreview';
import { getFeatures } from '../serviceConfig/helplineFeatures';
import { checkFormSelectorFlag } from '../formSelector/formSelector';
import type { FormView } from '../reviews/formReviews';
import {
  discardDraft,
  draftStarted,
  loadDraft,
  saveBeforeLeaving,
  selectChangedPaths,
  selectDraftFiles,
  selectOriginalFiles,
} from '../drafts/draftSlice';

// Which screen is showing in the main area (FormView: a contact tab, or a case section's form)
export type View =
  | FormView
  | { kind: 'categories' }
  | { kind: 'callTypes' }
  | { kind: 'cannedResponses' }
  | { kind: 'messages' }
  | { kind: 'webchat' }
  | { kind: 'formSelector' }
  | { kind: 'caseStatus' }
  | { kind: 'caseSections' }
  | { kind: 'features' }
  | { kind: 'serviceConfig' }
  | { kind: 'translations' }
  | { kind: 'profiles' };

export const sameView = (a: View, b: View) => JSON.stringify(a) === JSON.stringify(b);

const FIRST_VIEW: View = { kind: 'contactTab', tabKey: CONTACT_TABS[0].key };

type WorkspaceState = {
  code: string;
  version: string;
  // The flex-plugins branch the forms are read from ('' for the default; a version imported from a
  // branch, ImportForms)
  branch: string;
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
  // Who flags on the forms can be for: the helpline's people and the Aselo team (the flow designer's lists)
  people: Person[];
};

const initialState: WorkspaceState = {
  code: '',
  version: '',
  branch: '',
  loading: false,
  view: FIRST_VIEW,
  reviewing: false,
  editorRevision: 0,
  people: [],
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    helplineRequested: (state, action: PayloadAction<{ code: string; version: string; branch: string }>) => ({
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
    // Back to the Forms start page
    helplineClosed: state => ({ ...initialState, editorRevision: state.editorRevision + 1 }),
    peopleLoaded: (state, action: PayloadAction<{ code: string; people: Person[] }>) => {
      // Only while that helpline is still open
      if (state.code === action.payload.code) state.people = action.payload.people;
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

const { helplineRequested, helplineLoaded, helplineFailed, helplineClosed, peopleLoaded, editorsRestarted } =
  workspaceSlice.actions;
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
export const selectPeople = (state: RootState) => state.workspace.people;

// Who flags can be for: the helpline's people and the Aselo team, each person once. A list that
// can't be read is left out.
const loadPeople =
  (code: string): AppThunk<Promise<void>> =>
  async (dispatch, _getState, services) => {
    const load = services.loadPeople;
    if (!load) return;
    const lists = await Promise.all([code, ASELO_PEOPLE_CODE].map(list => load(list).catch((): Person[] => [])));
    const seen = new Set<string>();
    const people = lists.flat().filter(person => {
      const key = person.email ?? person.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    dispatch(peopleLoaded({ code, people }));
  };

// Opens a helpline's forms, from the default branch or the flex-plugins branch given: its files,
// then its saved draft. What's still waiting in the helpline open before is saved first.
export const openHelpline =
  (code: string, version: string, branch = ''): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { fetchDefinitionFiles }) => {
    const saving = dispatch(saveBeforeLeaving());
    if (saving) await saving;
    dispatch(helplineRequested({ code, version, branch }));
    dispatch(loadPeople(code)).catch(() => undefined);
    try {
      const definitions = await fetchDefinitionFiles(code, version, branch);
      dispatch(helplineLoaded(definitions));
      dispatch(draftStarted({ code, version, original: definitions.files, source: definitions.source }));
      await dispatch(loadDraft());
    } catch (err) {
      dispatch(helplineFailed((err as Error).message));
    }
  };

// Loads the open helpline again (after applying, or when someone else changed the draft)
export const reloadHelpline = (): AppThunk<Promise<void>> => (dispatch, getState) => {
  const { code, version, branch } = getState().workspace;
  return dispatch(openHelpline(code, version, branch));
};

// Back to the Forms start page, saving what's still waiting
export const closeHelpline = (): AppThunk<Promise<void>> => async dispatch => {
  const saving = dispatch(saveBeforeLeaving());
  dispatch(helplineClosed());
  await saving;
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

// Whether answers fill in the contact with PrepopulateMappings.json (else PrepopulateKeys.json)
export const selectUsePrepopulateMappings = (state: RootState) => {
  const definitions = selectDefinitions(state);
  return (
    getFeatures(selectDraftFiles(state), definitions?.serviceConfigDefaults)?.usePrepopulateMappings ??
    definitions?.featureFlags?.use_prepopulate_mappings === true
  );
};

export const selectSectionIssues = createSelector(
  [selectDraftFiles, selectOriginalFiles, (state: RootState) => state.workspace.code, selectUsePrepopulateMappings],
  (files, originalFiles, code, usePrepopulateMappings) => [
    ...validateSections(files, originalFiles, code),
    ...checkFormSelectorFlag(originalFiles, files, usePrepopulateMappings),
  ],
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
