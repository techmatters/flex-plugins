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
 * The drafts in progress, for the start page: Aselo staff get every helpline's, helpline staff
 * their own. Those submitted for review come first, then the latest changed.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DraftSummary } from '@tech-matters/form-builder-shared';

import type { AppThunk, RootState } from '../app/store';

type DraftsListState = { drafts?: DraftSummary[] };

const draftsListSlice = createSlice({
  name: 'draftsList',
  initialState: {} as DraftsListState,
  reducers: {
    draftsListed: (state, action: PayloadAction<DraftSummary[]>) => {
      state.drafts = action.payload;
    },
  },
});

const { draftsListed } = draftsListSlice.actions;
export const draftsListReducer = draftsListSlice.reducer;

const submittedFirst = (a: DraftSummary, b: DraftSummary) => {
  if (a.meta.status === b.meta.status) return b.meta.updatedAt.localeCompare(a.meta.updatedAt);
  return a.meta.status === 'submitted' ? -1 : 1;
};

export const selectDrafts = (state: RootState) => state.draftsList.drafts;

export const loadDrafts =
  (): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { draftClient }) => {
    try {
      dispatch(draftsListed([...(await draftClient.list())].sort(submittedFirst)));
    } catch {
      dispatch(draftsListed([]));
    }
  };
