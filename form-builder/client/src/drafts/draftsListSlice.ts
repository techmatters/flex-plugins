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
 * The forms to work on, for the start page: the versions Aselo staff imported (from master or a
 * branch) and the drafts in progress. Aselo staff get every helpline's, helpline staff their own.
 * Those submitted for review come first, then the latest changed.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DraftSummary } from '@tech-matters/form-builder-shared';
import type { AppThunk, RootState } from '../app/store';

export type DraftsListState = {
  // Undefined while loading
  drafts?: DraftSummary[];
  // The helpline shown ('' for all)
  helpline: string;
};

const initialState: DraftsListState = { helpline: '' };

const keyOf = (draft: Pick<DraftSummary, 'code' | 'version'>) => `${draft.code}/${draft.version}`;

const draftsListSlice = createSlice({
  name: 'draftsList',
  initialState,
  reducers: {
    // Listed again from the start (when the start page opens, and after an import)
    draftsRequested: () => initialState,
    draftsListed: (state, action: PayloadAction<DraftSummary[]>) => {
      state.drafts = action.payload;
    },
    draftRemoved: (state, action: PayloadAction<Pick<DraftSummary, 'code' | 'version'>>) => {
      state.drafts = state.drafts?.filter((draft) => keyOf(draft) !== keyOf(action.payload));
    },
    helplineFilterChanged: (state, action: PayloadAction<string>) => {
      state.helpline = action.payload;
    },
  },
});

const { draftsRequested, draftsListed, draftRemoved } = draftsListSlice.actions;
export const { helplineFilterChanged } = draftsListSlice.actions;
export const draftsListReducer = draftsListSlice.reducer;

const submittedFirst = (a: DraftSummary, b: DraftSummary) =>
  a.meta.status === b.meta.status
    ? b.meta.updatedAt.localeCompare(a.meta.updatedAt)
    : a.meta.status === 'submitted'
      ? -1
      : 1;

export const selectDrafts = (state: RootState) => state.draftsList.drafts;
export const selectHelplineFilter = (state: RootState) => state.draftsList.helpline;

export const loadDrafts = (): AppThunk<Promise<void>> => async (dispatch, _getState, { draftClient }) => {
  dispatch(draftsRequested());
  try {
    dispatch(draftsListed([...(await draftClient.list())].sort(submittedFirst)));
  } catch {
    dispatch(draftsListed([]));
  }
};

// Aselo staff: off the list (with its changes, if any)
export const removeDraft =
  (draft: Pick<DraftSummary, 'code' | 'version'>): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { draftClient }) => {
    await draftClient.remove(draft.code, draft.version);
    dispatch(draftRemoved({ code: draft.code, version: draft.version }));
  };
