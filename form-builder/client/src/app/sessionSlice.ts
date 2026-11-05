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
 * Who's signed in, the helplines they can open, and whether Aselo staff are looking at the app
 * as helpline staff do.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { HelplineSummary, Me } from '@tech-matters/form-builder-shared';

import type { AppThunk, RootState } from './store';

type SessionState = {
  user?: Me;
  helplines: HelplineSummary[];
  error?: string;
  viewAsHelplineStaff: boolean;
};

const initialState: SessionState = { helplines: [], viewAsHelplineStaff: false };

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionLoaded: (state, action: PayloadAction<{ user: Me; helplines: HelplineSummary[] }>) => {
      state.user = action.payload.user;
      state.helplines = action.payload.helplines;
    },
    sessionFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    viewAsHelplineStaffSet: (state, action: PayloadAction<boolean>) => {
      state.viewAsHelplineStaff = action.payload;
    },
  },
});

const { sessionFailed } = sessionSlice.actions;
export const { sessionLoaded } = sessionSlice.actions;
export const { viewAsHelplineStaffSet } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;

export const selectUser = (state: RootState) => state.session.user;
export const selectIsAseloStaff = (state: RootState) => state.session.user?.role === 'aselo-staff';
// Aselo staff, unless they're viewing the app as helpline staff
export const selectActingAsStaff = (state: RootState) =>
  selectIsAseloStaff(state) && !state.session.viewAsHelplineStaff;

// Who's signed in and their helplines (forms are opened from the list: DraftsList)
export const loadSession = (): AppThunk<Promise<void>> => async (dispatch, _getState, services) => {
  try {
    const [user, helplines] = await Promise.all([services.draftClient.me(), services.fetchHelplines()]);
    dispatch(sessionLoaded({ user, helplines }));
  } catch (err) {
    dispatch(sessionFailed((err as Error).message));
  }
};
