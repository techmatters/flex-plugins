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
 * The operating hours editor (Aselo staff only): the schedule (main or an office) and channel
 * shown, what the helpline's Studio flows ask for (loaded from the server, for the checks), the
 * public holidays being added, and "Check a time". The hours themselves are in the draft
 * (account-scoped/operatingInfo.json, operatingHours.ts).
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import {
  OPERATING_INFO_FILE,
  type OperatingHoursUsage,
  type OperatingInfo,
  type OperatingSchedule,
  type OperatingShift,
} from '@tech-matters/form-builder-shared';

import { AppThunk, rootReducer, RootState } from '../app/store';
import { editDraftFiles, selectDraftFiles } from '../drafts/draftSlice';
import { selectWorkspace } from '../workspace/workspaceSlice';
import { selectActingAsStaff } from '../app/sessionSlice';
import {
  copyDay,
  emptyWeek,
  getOperatingInfo,
  MAIN,
  newOperatingInfo,
  operatingHoursIssues,
  publicHolidays,
  scheduleOf,
  splitOvernight,
  withSchedule,
} from './operatingHours';

type OperatingHoursState = {
  // '' for the main schedule, or an office's name
  office: string;
  channel?: string;
  usage: { status: 'idle' | 'loading' | 'loaded' | 'error'; usages: OperatingHoursUsage[]; error?: string };
  holidayImport: { country: string; region: string; year: number; status: 'idle' | 'loading'; notice?: string };
  check: { date: string; time: string; channel?: string; office: string };
};

const today = () => new Date().toISOString().slice(0, 10);

const initialState = (): OperatingHoursState => ({
  office: MAIN,
  usage: { status: 'idle', usages: [] },
  holidayImport: { country: '', region: '', year: new Date().getFullYear(), status: 'idle' },
  check: { date: today(), time: '12:00', office: MAIN },
});

const operatingHoursSlice = createSlice({
  name: 'operatingHours',
  initialState,
  reducers: {
    operatingHoursOpened: () => initialState(),
    scheduleChosen: (state, action: PayloadAction<string>) => {
      state.office = action.payload;
      state.channel = undefined;
    },
    channelChosen: (state, action: PayloadAction<string | undefined>) => {
      state.channel = action.payload;
    },
    usageChanged: (state, action: PayloadAction<OperatingHoursState['usage']>) => {
      state.usage = action.payload;
    },
    holidayImportChanged: (state, action: PayloadAction<Partial<OperatingHoursState['holidayImport']>>) => {
      state.holidayImport = { ...state.holidayImport, ...action.payload };
    },
    checkChanged: (state, action: PayloadAction<Partial<OperatingHoursState['check']>>) => {
      state.check = { ...state.check, ...action.payload };
    },
  },
  selectors: {
    selectOperatingHoursEditor: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof operatingHoursSlice> {}
}
const injected = operatingHoursSlice.injectInto(rootReducer);
export const { selectOperatingHoursEditor } = injected.selectors;
const { operatingHoursOpened, usageChanged } = operatingHoursSlice.actions;
export const { scheduleChosen, channelChosen, checkChanged, holidayImportChanged } = operatingHoursSlice.actions;

export const selectOperatingInfo = createSelector([selectDraftFiles], getOperatingInfo);

// The schedule shown (main or an office), and its channel shown (the first, until one is chosen)
export const selectShownSchedule = createSelector(
  [selectOperatingInfo, (state: RootState) => selectOperatingHoursEditor(state)],
  (info, { office, channel }) => {
    const schedule = info && scheduleOf(info, office);
    const channels = Object.keys(schedule?.operatingHours ?? {});
    return { schedule, channels, channel: channel && channels.includes(channel) ? channel : channels[0] };
  },
);

export const selectOperatingHoursIssues = createSelector(
  [selectOperatingInfo, (state: RootState) => selectOperatingHoursEditor(state).usage.usages],
  (info, usages) => (info ? operatingHoursIssues(info, usages) : []),
);

// Writes the operating hours; a helpline without them gets the file when they're set up
const editInfo =
  (updater: (info: OperatingInfo) => OperatingInfo | undefined): AppThunk =>
  dispatch =>
    dispatch(
      editDraftFiles(files => {
        const info = getOperatingInfo(files);
        if (!info) return files;
        const next = updater(info);
        const { [OPERATING_INFO_FILE]: _old, ...rest } = files;
        return next ? { ...rest, [OPERATING_INFO_FILE]: next } : rest;
      }),
    );

// The schedule shown, changed
const editSchedule =
  (updater: (schedule: OperatingSchedule) => OperatingSchedule): AppThunk =>
  (dispatch, getState) => {
    const { office } = selectOperatingHoursEditor(getState());
    dispatch(
      editInfo(info => {
        const schedule = scheduleOf(info, office);
        return schedule ? withSchedule(info, office, updater(schedule)) : info;
      }),
    );
  };

// What the helpline's Studio flows ask for, to check the hours against
const loadOperatingHoursUsage =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { fetchOperatingHoursUsage }) => {
    const { code } = selectWorkspace(getState());
    if (!code) return;
    dispatch(usageChanged({ status: 'loading', usages: [] }));
    try {
      dispatch(usageChanged({ status: 'loaded', usages: await fetchOperatingHoursUsage(code) }));
    } catch (err) {
      dispatch(usageChanged({ status: 'error', usages: [], error: (err as Error).message }));
    }
  };

// What the flows ask for is read for Aselo staff (who change the hours)
export const openOperatingHours = (): AppThunk => (dispatch, getState) => {
  dispatch(operatingHoursOpened());
  if (selectActingAsStaff(getState())) dispatch(loadOperatingHoursUsage());
};

/**
 * A helpline without operating hours gets them: a time zone, and the channels its flows already
 * check (closed every day until hours are set)
 */
export const setUpOperatingHours =
  (timezone: string): AppThunk =>
  (dispatch, getState) => {
    const channels = [
      ...new Set(
        selectOperatingHoursEditor(getState())
          .usage.usages.filter(usage => !usage.dynamic && usage.channel)
          .map(usage => usage.channel!),
      ),
    ];
    dispatch(editDraftFiles(files => ({ ...files, [OPERATING_INFO_FILE]: newOperatingInfo(timezone, channels) })));
  };

export const setTimezone =
  (timezone: string): AppThunk =>
  dispatch =>
    dispatch(editSchedule(schedule => ({ ...schedule, timezone })));

// A channel, closed every day to start with, or with the hours of another
export const addChannel =
  (channel: string, copyFrom?: string): AppThunk =>
  dispatch => {
    const name = channel.trim();
    if (!name) return;
    dispatch(
      editSchedule(schedule => ({
        ...schedule,
        operatingHours: {
          ...schedule.operatingHours,
          [name]: copyFrom ? structuredClone(schedule.operatingHours[copyFrom]) : emptyWeek(),
        },
      })),
    );
    dispatch(channelChosen(name));
  };

export const removeChannel =
  (channel: string): AppThunk =>
  dispatch => {
    dispatch(
      editSchedule(schedule => {
        const { [channel]: _removed, ...operatingHours } = schedule.operatingHours;
        return { ...schedule, operatingHours };
      }),
    );
    dispatch(channelChosen(undefined));
  };

// A day's shifts for the channel shown
export const setShifts =
  (channel: string, day: string, shifts: OperatingShift[]): AppThunk =>
  dispatch =>
    dispatch(
      editSchedule(schedule => ({
        ...schedule,
        operatingHours: {
          ...schedule.operatingHours,
          [channel]: { ...schedule.operatingHours[channel], [day]: shifts },
        },
      })),
    );

export const splitShiftOvernight =
  (channel: string, day: string, index: number): AppThunk =>
  dispatch =>
    dispatch(
      editSchedule(schedule => ({
        ...schedule,
        operatingHours: {
          ...schedule.operatingHours,
          [channel]: splitOvernight(schedule.operatingHours[channel], day, index),
        },
      })),
    );

export const copyDayTo =
  (channel: string, from: string, to: string[]): AppThunk =>
  dispatch =>
    dispatch(
      editSchedule(schedule => ({
        ...schedule,
        operatingHours: { ...schedule.operatingHours, [channel]: copyDay(schedule.operatingHours[channel], from, to) },
      })),
    );

// The channel's hours for every channel of the schedule
export const applyHoursToAllChannels =
  (channel: string): AppThunk =>
  dispatch =>
    dispatch(
      editSchedule(schedule => ({
        ...schedule,
        operatingHours: Object.fromEntries(
          Object.keys(schedule.operatingHours).map(each => [each, structuredClone(schedule.operatingHours[channel])]),
        ),
      })),
    );

export const setHoliday =
  (key: string, name: string | undefined): AppThunk =>
  dispatch =>
    dispatch(
      editSchedule(schedule => {
        const { [key]: _old, ...holidays } = schedule.holidays;
        return { ...schedule, holidays: name === undefined ? holidays : { ...holidays, [key]: name } };
      }),
    );

export const removePastHolidays =
  (todayIso: string): AppThunk =>
  dispatch =>
    dispatch(
      editSchedule(schedule => ({
        ...schedule,
        holidays: Object.fromEntries(
          Object.entries(schedule.holidays).filter(([key]) => {
            const [month, day, year] = key.split('/');
            return `${year}-${month}-${day}` >= todayIso;
          }),
        ),
      })),
    );

// A country's (or region's) public holidays for a year, added to the schedule shown
export const addPublicHolidays = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { country, region, year } = selectOperatingHoursEditor(getState()).holidayImport;
  if (!country) return;
  dispatch(holidayImportChanged({ status: 'loading', notice: undefined }));
  const found = await publicHolidays(country, region || undefined, year);
  const count = Object.keys(found).length;
  dispatch(editSchedule(schedule => ({ ...schedule, holidays: { ...schedule.holidays, ...found } })));
  dispatch(
    holidayImportChanged({
      status: 'idle',
      notice:
        count > 0 ? `Added ${count} public holiday${count === 1 ? '' : 's'} for ${year}.` : 'No public holidays found.',
    }),
  );
};

// An office: another schedule a flow can ask for, starting as a copy of the main one (or empty)
export const addOffice =
  (name: string, copyMain: boolean): AppThunk =>
  dispatch => {
    const office = name.trim();
    if (!office) return;
    dispatch(
      editInfo(info => {
        const main = scheduleOf(info, MAIN)!;
        const schedule: OperatingSchedule = copyMain
          ? structuredClone(main)
          : { timezone: main.timezone, holidays: {}, operatingHours: {} };
        return { ...info, offices: { ...info.offices, [office]: schedule } };
      }),
    );
    dispatch(scheduleChosen(office));
  };

export const removeOffice =
  (office: string): AppThunk =>
  dispatch => {
    dispatch(
      editInfo(info => {
        const { [office]: _removed, ...offices } = info.offices ?? {};
        const { offices: _all, ...main } = info;
        return Object.keys(offices).length > 0 ? { ...main, offices } : main;
      }),
    );
    dispatch(scheduleChosen(MAIN));
  };
