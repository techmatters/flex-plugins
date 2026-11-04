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
 * The open board's recordings (the helpline's, or the shown variant's own folder): loaded when the
 * board opens, when another variant is shown, after every change, and with Refresh. Anyone who can
 * edit the board uploads (to staging); Aselo staff approve, publish and rename them.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { FlowObject } from '@tech-matters/form-builder-shared/flows/model';
import { TEMPLATES_CODE } from '@tech-matters/form-builder-shared/flows/model';
import type { RecordingsList } from '@tech-matters/form-builder-shared/flows/recordings';
import { standardRecordingName } from '@tech-matters/form-builder-shared/flows/recordings';
import type { AppThunk, RootState } from '../app/store';
import { rootReducer } from '../app/store';
import type { BoardClient } from './boardClient';
import {
  boardOpened,
  noticeShown,
  recordingFilesCleared,
  selectBoard,
  selectContent,
  selectRecordingsLibrary,
  selectVariants,
} from './boardSlice';

export type BoardRecordingsState = {
  list?: RecordingsList;
  // Why recordings can't be shown (e.g. not set up yet)
  unavailable?: string;
  // Files being uploaded, approved or published right now
  busy: string[];
  refreshing: boolean;
};

const initialState: BoardRecordingsState = { busy: [], refreshing: false };

const recordingsSlice = createSlice({
  name: 'boardRecordings',
  initialState,
  reducers: {
    refreshStarted: state => {
      state.refreshing = true;
    },
    recordingsLoaded: (state, action: PayloadAction<RecordingsList>) => {
      state.list = action.payload;
      state.unavailable = undefined;
      state.refreshing = false;
    },
    recordingsUnavailable: (state, action: PayloadAction<string>) => {
      state.unavailable = action.payload;
      state.refreshing = false;
    },
    fileBusy: (state, action: PayloadAction<{ fileName: string; busy: boolean }>) => {
      const { fileName, busy } = action.payload;
      state.busy = busy ? [...new Set([...state.busy, fileName])] : state.busy.filter(other => other !== fileName);
    },
    // A change answers with the updated list
    recordingsChanged: (state, action: PayloadAction<RecordingsList>) => {
      state.list = action.payload;
    },
  },
  // Each board starts with none, until its own are loaded
  extraReducers: builder => builder.addCase(boardOpened, () => initialState),
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof recordingsSlice> {}
}

// Added when the store is made (startFlowsListeners)
export const injectRecordingsSlice = () => recordingsSlice.injectInto(rootReducer);

const { refreshStarted, recordingsLoaded, recordingsUnavailable, fileBusy, recordingsChanged } =
  recordingsSlice.actions;

export const selectBoardRecordings = (state: RootState) => state.boardRecordings ?? initialState;

export const loadRecordings =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { board } = selectBoard(getState());
    const library = selectRecordingsLibrary(getState());
    if (!board || !library) return;
    if (board.code === TEMPLATES_CODE) {
      dispatch(recordingsUnavailable('Templates have no recordings: each helpline records its own.'));
      return;
    }
    dispatch(refreshStarted());
    try {
      dispatch(recordingsLoaded(await boardClient.recordings(library)));
    } catch (err) {
      dispatch(recordingsUnavailable((err as Error).message));
    }
  };

// A change to one file (upload, approval, publishing, removal), in the folder shown
const changeRecording =
  (
    fileName: string,
    change: (client: BoardClient, library: string) => Promise<RecordingsList>,
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const library = selectRecordingsLibrary(getState());
    if (!library) return;
    dispatch(fileBusy({ fileName, busy: true }));
    try {
      dispatch(recordingsChanged(await change(boardClient, library)));
    } catch (err) {
      dispatch(noticeShown((err as Error).message));
    } finally {
      dispatch(fileBusy({ fileName, busy: false }));
    }
  };

export const uploadRecording = (fileName: string, file: File) =>
  changeRecording(fileName, (client, library) => client.uploadRecording(library, fileName, file));

export const approveRecording = (fileName: string, approved: boolean) =>
  changeRecording(fileName, (client, library) => client.approveRecording(library, fileName, approved));

export const publishRecording = (fileName: string) =>
  changeRecording(fileName, (client, library) => client.publishRecording(library, fileName));

export const removeRecording = (fileName: string) =>
  changeRecording(fileName, (client, library) => client.removeRecording(library, fileName));

/**
 * Recordings given their standard names (the widget's): each file is copied under the new name, in
 * every folder the board's flows play from (each variant's), and the widgets stop pointing at the
 * old name. A file not uploaded yet just takes the new name.
 */
export const renameRecordings =
  (objectIds: string[], given: Pick<FlowObject, 'id' | 'studioName' | 'message'>[] = []): AppThunk<Promise<void>> =>
  async (dispatch, getState, { boardClient }) => {
    const { board } = selectBoard(getState());
    if (!board) return;
    const variants = selectVariants(getState());
    const content = selectContent(getState());
    const libraries =
      variants.length > 0 ? variants.map(candidate => `${board.code}/f/${candidate.recordingsFolder}`) : [board.code];
    const renamed = new Set<string>();
    for (const id of objectIds) {
      // As just changed (renamed in the settings), or as on the board
      const object =
        given.find(candidate => candidate.id === id) ?? content.objects.find(candidate => candidate.id === id);
      const from = object?.message?.recordingFile;
      if (!object?.studioName || !from) continue;
      const to = standardRecordingName(object.studioName, from);
      try {
        for (const library of libraries) {
          await boardClient.copyRecording(library, from, to).catch((err: Error) => {
            // Not uploaded in that folder: nothing to copy
            if (!/no .* to copy/i.test(err.message)) throw err;
          });
        }
        renamed.add(id);
      } catch (err) {
        dispatch(noticeShown(`${from}: ${(err as Error).message}`));
      }
    }
    dispatch(recordingFilesCleared([...renamed]));
    await dispatch(loadRecordings());
    if (renamed.size > 0) {
      dispatch(
        noticeShown(
          `${renamed.size} recording${
            renamed.size === 1 ? '' : 's'
          } renamed to the standard (copied; the old files are kept).`,
        ),
      );
    }
  };
