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
 * The "Review & submit" / "Review & apply" dialog: what's under way (submitting, applying), what
 * came of it, and what went wrong. Helpline staff submit the draft for review; Aselo staff apply
 * it, or download it as a zip when the builder can't open the PR itself. It starts again each time
 * the dialog opens or closes.
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { ApplyResult } from '@tech-matters/form-builder-shared';

import { AppThunk, RootState, rootReducer } from '../app/store';
import { reviewClosed, reviewOpened, selectDefinitions, selectReviewIssues } from '../workspace/workspaceSlice';
import { applyDraft, selectDraftFiles, selectOriginalFiles, submitDraft } from './draftSlice';
import { summarizeContactFormChanges } from './changes';
import { summarizeSectionChanges } from '../chatsAndCalls/sections';
import { buildChangeLog, downloadExportZip } from './exportZip';

type ReviewState = {
  // The zip was downloaded
  exported: boolean;
  // Submitting or applying is under way
  busy: boolean;
  submitted: boolean;
  applied?: ApplyResult;
  failure?: string;
};

const initialState: ReviewState = { exported: false, busy: false, submitted: false };

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    reviewStarted: state => {
      state.busy = true;
      state.failure = undefined;
    },
    reviewFailed: (state, action: PayloadAction<string>) => {
      state.busy = false;
      state.failure = action.payload;
    },
    reviewSubmitted: state => {
      state.busy = false;
      state.submitted = true;
    },
    reviewApplied: (state, action: PayloadAction<ApplyResult>) => {
      state.busy = false;
      state.applied = action.payload;
    },
    reviewExported: state => {
      state.exported = true;
    },
  },
  extraReducers: builder => {
    // Each time the dialog opens it starts afresh
    builder.addCase(reviewOpened, () => initialState).addCase(reviewClosed, () => initialState);
  },
  selectors: {
    selectReview: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof reviewSlice> {}
}
const injected = reviewSlice.injectInto(rootReducer);
export const { selectReview } = injected.selectors;
const { reviewStarted, reviewFailed, reviewSubmitted, reviewApplied, reviewExported } = reviewSlice.actions;

const selectWebchatDefaultLocale = (state: RootState) => selectDefinitions(state)?.webchat?.defaultLocale;

// What changed, in plain language: contact and case forms, then the other sections
export const selectContactFormSummaries = createSelector(
  [selectOriginalFiles, selectDraftFiles],
  summarizeContactFormChanges,
);
export const selectSectionSummaries = createSelector(
  [selectOriginalFiles, selectDraftFiles, selectWebchatDefaultLocale],
  summarizeSectionChanges,
);

// What the change log and the zip are built from
const exportInputs = (state: RootState) => {
  const { code, version, original: originalFiles, files: draftFiles } = state.draft;
  return {
    code,
    version,
    originalFiles,
    draftFiles,
    warnings: selectReviewIssues(state).filter(issue => issue.severity === 'warning'),
    webchatDefaultLocale: selectWebchatDefaultLocale(state),
  };
};

// Runs a submit or apply, keeping its error to show in the dialog
const run =
  (action: () => Promise<void>): AppThunk<Promise<void>> =>
  async dispatch => {
    dispatch(reviewStarted());
    try {
      await action();
    } catch (err) {
      dispatch(reviewFailed((err as Error).message));
    }
  };

export const submitReview = (): AppThunk<Promise<void>> => dispatch =>
  dispatch(
    run(async () => {
      await dispatch(submitDraft());
      dispatch(reviewSubmitted());
    }),
  );

// The change log becomes the PR description when deployed
export const applyReview = (): AppThunk<Promise<void>> => (dispatch, getState) =>
  dispatch(
    run(async () => {
      const description = buildChangeLog({ ...exportInputs(getState()), target: 'pr' });
      dispatch(reviewApplied(await dispatch(applyDraft(description))));
    }),
  );

export const exportReview = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  await downloadExportZip(exportInputs(getState()));
  dispatch(reviewExported());
};
