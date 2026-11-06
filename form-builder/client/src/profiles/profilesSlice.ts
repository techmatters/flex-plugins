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
 * The client profiles editor: the profile sections and blocking options being edited (as rows,
 * so they keep their place while their names change), and the unit each option's length is
 * shown in. Every change is written to the draft's profileForms/ files (profiles.ts).
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type {
  ProfileFlagDurationDefinition,
  ProfileSectionDefinition,
} from '@hrm-form-definitions/formDefinition/types';

import { AppThunk, RootState, rootReducer } from '../app/store';
import { editDraftFiles, selectDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import { selectDefinitions } from '../workspace/workspaceSlice';
import { getFeatures } from '../serviceConfig/helplineFeatures';
import { Row, toRows } from '../common/SortableRows';
import { toFieldName, uniqueFieldName } from '../forms/formEditing';
import {
  DURATION_UNITS,
  DurationUnit,
  FLAG_DURATIONS_FILE,
  getFlagDurations,
  getProfileOverview,
  getProfileSections,
  newProfileSection,
  PROFILE_OVERVIEW_FILE,
  PROFILE_SECTIONS_FILE,
  splitDuration,
  toHours,
} from './profiles';

type ProfilesState = {
  sections: Row<ProfileSectionDefinition>[];
  durations: Row<ProfileFlagDurationDefinition>[];
  // The unit each blocking option's length is shown in, by row id
  durationUnits: Record<string, DurationUnit>;
};

const initialState: ProfilesState = { sections: [], durations: [], durationUnits: {} };

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    profilesOpened: (_state, action: PayloadAction<ProfilesState>) => action.payload,
    sectionsChanged: (state, action: PayloadAction<Row<ProfileSectionDefinition>[]>) => {
      state.sections = action.payload;
    },
    durationsChanged: (state, action: PayloadAction<Row<ProfileFlagDurationDefinition>[]>) => {
      state.durations = action.payload;
    },
    durationUnitChanged: (state, action: PayloadAction<{ id: string; unit: DurationUnit }>) => {
      state.durationUnits[action.payload.id] = action.payload.unit;
    },
  },
  selectors: {
    selectProfiles: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof profilesSlice> {}
}
const injected = profilesSlice.injectInto(rootReducer);
export const { selectProfiles } = injected.selectors;
const { profilesOpened, sectionsChanged, durationsChanged, durationUnitChanged } = profilesSlice.actions;

// Names of the sections that existed before this draft: profiles save what's written under them
export const selectOriginalSectionNames = createSelector(
  [selectOriginalFiles],
  originalFiles => new Set(getProfileSections(originalFiles).map(section => section.name)),
);

// From the Features page: profiles may be switched off for this helpline
export const selectProfilesEnabled = (state: RootState) =>
  getFeatures(selectDraftFiles(state), selectDefinitions(state)?.serviceConfigDefaults)?.enableClientProfiles !== false;

// How many of the unit it's shown in an option lasts
export const durationAmount = (hours: number, unit: DurationUnit = 'hours') =>
  hours / DURATION_UNITS.find(candidate => candidate.unit === unit)!.hours;

const unitsOf = (rows: Row<ProfileFlagDurationDefinition>[]) =>
  Object.fromEntries(rows.map(row => [row.id, splitDuration(Number(row.value.durationInHours)).unit]));

// Starts editing the profiles, from the draft
export const openProfiles = (): AppThunk => (dispatch, getState) => {
  const { files } = getState().draft;
  const durations = toRows(getFlagDurations(files));
  dispatch(
    profilesOpened({ sections: toRows(getProfileSections(files)), durations, durationUnits: unitsOf(durations) }),
  );
};

export const writeSections =
  (sections: Row<ProfileSectionDefinition>[]): AppThunk =>
  dispatch => {
    dispatch(sectionsChanged(sections));
    const values = sections.map(row => row.value);
    dispatch(editDraftFiles(files => ({ ...files, [PROFILE_SECTIONS_FILE]: values })));
  };

export const writeDurations =
  (durations: Row<ProfileFlagDurationDefinition>[]): AppThunk =>
  dispatch => {
    dispatch(durationsChanged(durations));
    const values = durations.map(row => row.value);
    dispatch(editDraftFiles(files => ({ ...files, [FLAG_DURATIONS_FILE]: values })));
  };

export const updateSection =
  (id: string, change: Partial<ProfileSectionDefinition>): AppThunk =>
  (dispatch, getState) => {
    const originalNames = selectOriginalSectionNames(getState());
    const { sections } = selectProfiles(getState());
    dispatch(
      writeSections(
        sections.map(row => {
          if (row.id !== id) return row;
          const next = { ...row.value, ...change };
          // A new section's saved name follows its title
          if (change.label !== undefined && !originalNames.has(row.value.name)) {
            next.name = uniqueFieldName(
              toFieldName(change.label) || 'section',
              sections.filter(other => other.id !== id).map(other => other.value.name),
            );
          }
          return { ...row, value: next };
        }),
      ),
    );
  };

export const addSection = (): AppThunk => (dispatch, getState) => {
  const { sections } = selectProfiles(getState());
  const name = uniqueFieldName(
    'newSection',
    sections.map(row => row.value.name),
  );
  dispatch(writeSections([...sections, ...toRows([newProfileSection('New section', name)])]));
};

export const removeSection =
  (id: string): AppThunk =>
  (dispatch, getState) =>
    dispatch(writeSections(selectProfiles(getState()).sections.filter(row => row.id !== id)));

export const updateDuration =
  (id: string, change: Partial<ProfileFlagDurationDefinition>): AppThunk =>
  (dispatch, getState) =>
    dispatch(
      writeDurations(
        selectProfiles(getState()).durations.map(row =>
          row.id === id ? { ...row, value: { ...row.value, ...change } } : row,
        ),
      ),
    );

// Changes what an option's amount counts, keeping the amount
export const setDurationUnit =
  (id: string, unit: DurationUnit): AppThunk =>
  (dispatch, getState) => {
    const { durations, durationUnits } = selectProfiles(getState());
    const row = durations.find(candidate => candidate.id === id);
    if (!row) return;
    const amount = durationAmount(Number(row.value.durationInHours), durationUnits[id]);
    dispatch(durationUnitChanged({ id, unit }));
    dispatch(
      updateDuration(id, { durationInHours: String(Math.round(toHours(Number.isInteger(amount) ? amount : 1, unit))) }),
    );
  };

// Sets an option's length from the amount typed, in the unit it's shown in
export const setDurationAmount =
  (id: string, amount: number): AppThunk =>
  (dispatch, getState) => {
    const unit = selectProfiles(getState()).durationUnits[id] ?? 'hours';
    dispatch(updateDuration(id, { durationInHours: String(Math.round(toHours(amount, unit))) }));
  };

// A new blocking option, with a length no other option has
export const addDuration = (): AppThunk => (dispatch, getState) => {
  const { durations } = selectProfiles(getState());
  const taken = new Set(durations.map(row => Number(row.value.durationInHours)));
  let hours = 24;
  while (taken.has(hours)) hours += 24;
  const added = toRows([{ flag: 'blocked', label: `Block (${hours / 24} days)`, durationInHours: String(hours) }]);
  added.forEach(row => dispatch(durationUnitChanged({ id: row.id, unit: splitDuration(hours).unit })));
  dispatch(writeDurations([...durations, ...added]));
};

export const removeDuration =
  (id: string): AppThunk =>
  (dispatch, getState) =>
    dispatch(writeDurations(selectProfiles(getState()).durations.filter(row => row.id !== id)));

export const setOverviewIsPII =
  (key: string, isPII: boolean): AppThunk =>
  dispatch =>
    dispatch(
      editDraftFiles(files => ({
        ...files,
        [PROFILE_OVERVIEW_FILE]: {
          ...getProfileOverview(files),
          [key]: { ...getProfileOverview(files)?.[key], isPII },
        },
      })),
    );
