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
 * The call types editor: the "close without a form" buttons being edited (as rows, since a new
 * button's name follows its label) and what's typed to paste several. The "open the form"
 * buttons are edited straight in the draft. Every change is written to CallTypeButtons.json.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { CallTypeButtonsEntry } from '@hrm-form-definitions/formDefinition/types';
import { AppThunk, RootState, rootReducer } from '../app/store';
import { editDraftFiles } from '../drafts/draftSlice';
import { Row, toRows } from '../common/SortableRows';
import { toFieldName, uniqueFieldName } from '../forms/formEditing';
import { CALL_TYPE_BUTTONS_FILE, getCallTypeButtons } from './sections';

export type CallTypesState = {
  nonDataRows: Row<CallTypeButtonsEntry>[];
  // Button texts being pasted, one per line
  bulkText?: string;
};

const initialState: CallTypesState = { nonDataRows: [] };

const callTypesSlice = createSlice({
  name: 'callTypes',
  initialState,
  reducers: {
    callTypesOpened: (_state, action: PayloadAction<Row<CallTypeButtonsEntry>[]>) => ({
      ...initialState,
      nonDataRows: action.payload,
    }),
    nonDataRowsChanged: (state, action: PayloadAction<Row<CallTypeButtonsEntry>[]>) => {
      state.nonDataRows = action.payload;
    },
    bulkTextChanged: (state, action: PayloadAction<string | undefined>) => {
      state.bulkText = action.payload;
    },
  },
  selectors: {
    selectCallTypes: state => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof callTypesSlice> {}
}
const injected = callTypesSlice.injectInto(rootReducer);
export const { selectCallTypes } = injected.selectors;
const { callTypesOpened, nonDataRowsChanged } = callTypesSlice.actions;
export const { bulkTextChanged } = callTypesSlice.actions;

const NEW_CALLER_LABEL = 'Someone calling about another person';

const dataButtonsOf = (state: RootState) =>
  getCallTypeButtons(state.draft.files).filter(button => button.category === 'data');

// Names of the buttons the helpline already had: contacts are saved with them
const originalButtonNames = (state: RootState) =>
  new Set(getCallTypeButtons(state.draft.original).map(button => button.name));

// Starts editing from the draft
export const openCallTypes = (): AppThunk => (dispatch, getState) => {
  const buttons = getCallTypeButtons(getState().draft.files);
  dispatch(callTypesOpened(toRows(buttons.filter(button => button.category === 'non-data'))));
};

// Both kinds of buttons as they are now, written to the draft
const write =
  (data: CallTypeButtonsEntry[], nonDataRows: Row<CallTypeButtonsEntry>[]): AppThunk =>
  dispatch => {
    dispatch(nonDataRowsChanged(nonDataRows));
    dispatch(
      editDraftFiles(files => ({
        ...files,
        [CALL_TYPE_BUTTONS_FILE]: [...data, ...nonDataRows.map(row => row.value)],
      })),
    );
  };

const writeNonData =
  (nonDataRows: Row<CallTypeButtonsEntry>[]): AppThunk =>
  (dispatch, getState) =>
    dispatch(write(dataButtonsOf(getState()), nonDataRows));

export const setDataLabel =
  (name: string, label: string): AppThunk =>
  (dispatch, getState) =>
    dispatch(
      write(
        dataButtonsOf(getState()).map(button => (button.name === name ? { ...button, label } : button)),
        selectCallTypes(getState()).nonDataRows,
      ),
    );

// Adds or removes the "someone calling about another person" button (which adds the Caller tab)
export const toggleCaller = (): AppThunk => (dispatch, getState) => {
  const dataButtons = dataButtonsOf(getState());
  const next = dataButtons.some(button => button.name === 'caller')
    ? dataButtons.filter(button => button.name !== 'caller')
    : [...dataButtons, { type: 'button' as const, name: 'caller', label: NEW_CALLER_LABEL, category: 'data' as const }];
  dispatch(write(next, selectCallTypes(getState()).nonDataRows));
};

const takenNames = (state: RootState) => [
  ...dataButtonsOf(state).map(button => button.name),
  ...selectCallTypes(state).nonDataRows.map(row => row.value.name),
];

export const addNonDataButtons =
  (labels: string[]): AppThunk =>
  (dispatch, getState) => {
    const names = takenNames(getState());
    const added = labels
      .map(label => label.trim())
      .filter(Boolean)
      .map((label): CallTypeButtonsEntry => {
        const name = uniqueFieldName(toFieldName(label), names);
        names.push(name);
        return { type: 'button', name, label, category: 'non-data' };
      });
    dispatch(writeNonData([...selectCallTypes(getState()).nonDataRows, ...toRows(added)]));
  };

// What's pasted, one per line, then the box closes
export const addPastedButtons = (): AppThunk => (dispatch, getState) => {
  dispatch(addNonDataButtons((selectCallTypes(getState()).bulkText ?? '').split('\n')));
  dispatch(bulkTextChanged(undefined));
};

export const renameNonData =
  (id: string, label: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const originalNames = originalButtonNames(state);
    const taken = takenNames(state);
    dispatch(
      writeNonData(
        selectCallTypes(state).nonDataRows.map(row => {
          if (row.id !== id) return row;
          const isNew = !originalNames.has(row.value.name);
          // A new button's name follows its label; an existing one keeps its name
          const others = taken.filter(name => name !== row.value.name);
          const name = isNew ? uniqueFieldName(toFieldName(label), others) : row.value.name;
          return { ...row, value: { ...row.value, label, name } };
        }),
      ),
    );
  };

export const removeNonData =
  (id: string): AppThunk =>
  (dispatch, getState) =>
    dispatch(writeNonData(selectCallTypes(getState()).nonDataRows.filter(row => row.id !== id)));

export const reorderNonData = (rows: Row<CallTypeButtonsEntry>[]): AppThunk => writeNonData(rows);
