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
 * The canned responses editor: the responses being edited (as rows, so they keep their identity
 * while being edited and moved), what's pasted from a spreadsheet, and the message picked in the
 * preview. Every change is written to CannedResponses.json.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import { AppThunk, rootReducer } from '../app/store';
import { editDraftFiles } from '../drafts/draftSlice';
import { Row, toRows } from '../common/SortableRows';
import { parseDelimitedText } from '../linkedDropdowns/spreadsheet';
import { CANNED_RESPONSES_FILE, getCannedResponses } from './sections';

export type CannedResponse = { label: string; text: string };

export type CannedResponsesState = {
  rows: Row<CannedResponse>[];
  // Two columns pasted from a spreadsheet
  pasteText?: string;
  // The message the preview's dropdown put in the message box
  previewMessage: string;
};

const initialState: CannedResponsesState = { rows: [], previewMessage: '' };

const cannedResponsesSlice = createSlice({
  name: 'cannedResponses',
  initialState,
  reducers: {
    cannedResponsesOpened: (_state, action: PayloadAction<Row<CannedResponse>[]>) => ({
      ...initialState,
      rows: action.payload,
    }),
    rowsChanged: (state, action: PayloadAction<Row<CannedResponse>[]>) => {
      state.rows = action.payload;
    },
    pasteTextChanged: (state, action: PayloadAction<string | undefined>) => {
      state.pasteText = action.payload;
    },
    previewMessageChanged: (state, action: PayloadAction<string>) => {
      state.previewMessage = action.payload;
    },
  },
  selectors: {
    selectCannedResponses: (state) => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof cannedResponsesSlice> {}
}
const injected = cannedResponsesSlice.injectInto(rootReducer);
export const { selectCannedResponses } = injected.selectors;
const { cannedResponsesOpened, rowsChanged } = cannedResponsesSlice.actions;
export const { pasteTextChanged, previewMessageChanged } = cannedResponsesSlice.actions;

// Starts editing from the draft
export const openCannedResponses = (): AppThunk => (dispatch, getState) => {
  dispatch(cannedResponsesOpened(toRows(getCannedResponses(getState().draft.files) as CannedResponse[])));
};

// The rows as they are now, written to the draft
const write =
  (rows: Row<CannedResponse>[]): AppThunk =>
  (dispatch) => {
    dispatch(rowsChanged(rows));
    dispatch(editDraftFiles((files) => ({ ...files, [CANNED_RESPONSES_FILE]: rows.map((row) => row.value) })));
  };

export const reorderResponses = (rows: Row<CannedResponse>[]): AppThunk => write(rows);

export const updateResponse =
  (id: string, changes: Partial<CannedResponse>): AppThunk =>
  (dispatch, getState) =>
    dispatch(
      write(
        selectCannedResponses(getState()).rows.map((row) =>
          row.id === id ? { ...row, value: { ...row.value, ...changes } } : row,
        ),
      ),
    );

export const addResponse = (): AppThunk => (dispatch, getState) =>
  dispatch(write([...selectCannedResponses(getState()).rows, ...toRows([{ label: '', text: '' }])]));

export const removeResponse =
  (id: string): AppThunk =>
  (dispatch, getState) =>
    dispatch(write(selectCannedResponses(getState()).rows.filter((row) => row.id !== id)));

// Two columns pasted from a spreadsheet: name, then text. Then the box closes
export const addPastedResponses = (): AppThunk => (dispatch, getState) => {
  const { rows, pasteText } = selectCannedResponses(getState());
  const added = parseDelimitedText(pasteText ?? '')
    .map(([label = '', text = '']) => ({ label: label.trim(), text: text.trim() }))
    .filter((response) => response.label || response.text);
  dispatch(write([...rows, ...toRows(added)]));
  dispatch(pasteTextChanged(undefined));
};
