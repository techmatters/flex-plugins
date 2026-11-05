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
 * The Permissions section: the helpline's HRM permissions file in the draft (changed by Aselo
 * staff), and which groups that aren't used are shown anyway.
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { PermissionCondition } from '@tech-matters/form-builder-shared';

import { AppThunk, rootReducer } from '../app/store';
import { editDraftFiles, selectDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import { getPermissionRules, permissionIssues, summarizePermissionChanges } from './permissions';

// Groups hidden because the helpline doesn't use them, shown anyway
type PermissionsState = { shownAnyway: { cases: boolean; profiles: boolean } };

const initialState = (): PermissionsState => ({ shownAnyway: { cases: false, profiles: false } });

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    permissionsOpened: () => initialState(),
    shownAnyway: (state, action: PayloadAction<'cases' | 'profiles'>) => {
      state.shownAnyway[action.payload] = true;
    },
  },
  selectors: {
    selectPermissionsEditor: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof permissionsSlice> {}
}
const injected = permissionsSlice.injectInto(rootReducer);
export const { selectPermissionsEditor } = injected.selectors;
export const { permissionsOpened, shownAnyway } = permissionsSlice.actions;

export const selectPermissionRules = createSelector([selectDraftFiles], getPermissionRules);

export const selectPermissionIssues = createSelector([selectPermissionRules], current =>
  current ? permissionIssues(current.rules) : [],
);

// What this draft changes, one line per action
export const selectPermissionChanges = createSelector(
  [selectOriginalFiles, selectPermissionRules],
  (original, current) =>
    current ? summarizePermissionChanges(getPermissionRules(original)?.rules, current.rules) : [],
);

// One action's ways to be allowed, changed
export const setActionRule =
  (actionKey: string, ways: PermissionCondition[][]): AppThunk =>
  dispatch =>
    dispatch(
      editDraftFiles(files => {
        const current = getPermissionRules(files);
        if (!current) return files;
        return { ...files, [current.filePath]: { ...current.rules, [actionKey]: ways } };
      }),
    );
