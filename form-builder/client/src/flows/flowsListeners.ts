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
 * The Contact flows area's slices, added to the store when it's made, and what follows changes to
 * the open board:
 * - undo snapshots, taken when the canvas stops changing (not while something is being dragged);
 * - saving, a moment after the last change (one save at a time; none after a conflict), and a
 *   save that failed tried again a little later, a few times;
 * - the status, back to "In progress" when the design changes;
 * - tested paths, forgotten when something on them changes;
 * - recordings, read again when another variant (another recordings folder) is shown;
 * - the helpline's choices, read again when the area is shown again (e.g. after adding a skill in
 *   Routing).
 */
import { STATUS_AFTER_CHANGE } from '@tech-matters/form-builder-shared/designStatus';

import type { AppListenerStartListening, RootState } from '../app/store';
import {
  boardSaved,
  historySnapshotTaken,
  injectBoardSlice,
  loadHelplineChoices,
  saveBoard,
  saveFailed,
  saveRetriesReset,
  saveStateChanged,
  selectBoard,
  selectCanvasContent,
  selectCanvasJson,
  selectContentJson,
  selectDesign,
  selectDragging,
  selectReadOnly,
  selectRecordingsLibrary,
  selectValidPaths,
  statusChanged,
  testedPathsKept,
} from './boardSlice';
import { injectFlowsSlice } from './flowsSlice';
import { injectRecordingsSlice, loadRecordings } from './recordingsSlice';
import { injectSimulatorSlice } from './simulatorSlice';

const HISTORY_DELAY_MS = 300;
const AUTOSAVE_DELAY_MS = 1200;

// The same board, still open (not another one, nor this one loaded again)
const sameBoard = (current: RootState, previous: RootState) =>
  Boolean(selectBoard(current).board) && selectBoard(current).opened === selectBoard(previous).opened;

export const startFlowsListeners = (startListening: AppListenerStartListening) => {
  injectFlowsSlice();
  injectBoardSlice();
  injectRecordingsSlice();
  injectSimulatorSlice();

  // Undo and redo: a snapshot once the canvas has been still for a moment
  startListening({
    predicate: (_action, current, previous) =>
      selectCanvasJson(current) !== selectCanvasJson(previous) || selectDragging(current) !== selectDragging(previous),
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();
      if (selectDragging(listenerApi.getState())) return;
      await listenerApi.delay(HISTORY_DELAY_MS);
      listenerApi.dispatch(historySnapshotTaken());
    },
  });

  // Saving a moment after the last change (and again after a save, for changes made meanwhile)
  startListening({
    predicate: (action, current, previous) =>
      boardSaved.match(action) ||
      selectContentJson(current) !== selectContentJson(previous) ||
      selectDragging(current) !== selectDragging(previous),
    effect: async (_action, listenerApi) => {
      const state = listenerApi.getState();
      const board = selectBoard(state);
      if (!board.board || selectReadOnly(state) || board.conflict) return;
      if (selectContentJson(state) === board.savedJson) return;
      if (board.saveState !== 'saving' && board.saveState !== 'unsaved') {
        listenerApi.dispatch(saveStateChanged('unsaved'));
      }
      // A newer change restarts the wait
      listenerApi.cancelActiveListeners();
      if (selectDragging(state)) return;
      await listenerApi.delay(AUTOSAVE_DELAY_MS);
      // Someone's editing: a failed save gets its retries again
      listenerApi.dispatch(saveRetriesReset());
      await listenerApi.dispatch(saveBoard());
    },
  });

  // A failed save is tried again a little later, a few times (the server may be back by then)
  startListening({
    actionCreator: saveFailed,
    effect: async (_action, listenerApi) => {
      const { saveState, failedSaves, opened } = selectBoard(listenerApi.getState());
      if (saveState !== 'retrying') return;
      listenerApi.cancelActiveListeners();
      const delays = listenerApi.extra.saveRetryDelaysMs;
      await listenerApi.delay(delays[Math.min(failedSaves, delays.length) - 1] ?? 0);
      // Unless an edit's save already went through, or another board was opened
      const now = selectBoard(listenerApi.getState());
      if (now.saveState !== 'retrying' || now.opened !== opened) return;
      await listenerApi.dispatch(saveBoard());
    },
  });

  // Every change goes through the canvas, so a change to the design (not to comments or stickies)
  // is seen here, and means the board is being worked on again
  startListening({
    predicate: (_action, current, previous) =>
      sameBoard(current, previous) && selectDesign(current) !== selectDesign(previous),
    effect: (_action, listenerApi) => {
      if (!selectReadOnly(listenerApi.getState())) listenerApi.dispatch(statusChanged(STATUS_AFTER_CHANGE));
    },
  });

  // A change on a tested path means it has to be tested again
  startListening({
    predicate: (_action, current, previous) =>
      selectCanvasContent(current) !== selectCanvasContent(previous) ||
      selectBoard(current).testedPaths !== selectBoard(previous).testedPaths,
    effect: (_action, listenerApi) => {
      const state = listenerApi.getState();
      const valid = selectValidPaths(state);
      if (
        selectBoard(state).board &&
        !selectReadOnly(state) &&
        valid.length !== selectBoard(state).testedPaths.length
      ) {
        listenerApi.dispatch(testedPathsKept(valid));
      }
    },
  });

  // The recordings of the board opened, or of the variant now shown
  startListening({
    predicate: (_action, current, previous) =>
      Boolean(selectBoard(current).board) &&
      (!sameBoard(current, previous) || selectRecordingsLibrary(current) !== selectRecordingsLibrary(previous)),
    effect: async (_action, listenerApi) => {
      await listenerApi.dispatch(loadRecordings());
    },
  });

  // The helpline's choices, read again whenever the board is shown again
  startListening({
    predicate: (_action, current, previous) => current.app.area === 'flows' && previous.app.area !== 'flows',
    effect: async (_action, listenerApi) => {
      await listenerApi.dispatch(loadHelplineChoices());
    },
  });
};
