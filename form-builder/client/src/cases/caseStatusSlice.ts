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
 * The case statuses editor: the statuses being edited (as rows, since a new status's value
 * follows its name) and the status the preview's case is in. Every change is written to the
 * draft's CaseStatus.json (caseStatuses.ts says what can change).
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { StatusInfo } from '@hrm-form-definitions/formDefinition/types';

import { AppThunk, rootReducer } from '../app/store';
import { editDraftFiles } from '../drafts/draftSlice';
import { Row, toRows } from '../common/SortableRows';
import { CASE_STATUS_FILE, getCaseStatusMap, newStatusValue } from './caseStatuses';

// Rows keep the status's key in the file (usually the same as its value)
type StatusRow = { key: string; status: StatusInfo };

type CaseStatusState = {
  rows: Row<StatusRow>[];
  // The status of the case in the preview
  current: string;
};

const initialState: CaseStatusState = { rows: [], current: 'open' };

const caseStatusSlice = createSlice({
  name: 'caseStatus',
  initialState,
  reducers: {
    caseStatusOpened: (_state, action: PayloadAction<CaseStatusState>) => action.payload,
    rowsChanged: (state, action: PayloadAction<Row<StatusRow>[]>) => {
      state.rows = action.payload;
    },
    currentChanged: (state, action: PayloadAction<string>) => {
      state.current = action.payload;
    },
  },
  selectors: {
    selectCaseStatus: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof caseStatusSlice> {}
}
const injected = caseStatusSlice.injectInto(rootReducer);
export const { selectCaseStatus } = injected.selectors;
const { caseStatusOpened, rowsChanged } = caseStatusSlice.actions;
export const { currentChanged } = caseStatusSlice.actions;

// Starts editing from the draft, with the preview's case in the first status
export const openCaseStatus = (): AppThunk => (dispatch, getState) => {
  const rows = toRows(
    Object.entries(getCaseStatusMap(getState().draft.files)).map(([key, status]) => ({ key, status })),
  );
  dispatch(caseStatusOpened({ rows, current: rows[0]?.value.status.value ?? 'open' }));
};

// The rows as they are now, written to the draft
const write =
  (rows: Row<StatusRow>[]): AppThunk =>
  dispatch => {
    dispatch(rowsChanged(rows));
    dispatch(
      editDraftFiles(files => ({
        ...files,
        [CASE_STATUS_FILE]: Object.fromEntries(rows.map(({ value }) => [value.key, value.status])),
      })),
    );
  };

const update =
  (id: string, change: (status: StatusInfo) => StatusInfo): AppThunk =>
  (dispatch, getState) =>
    dispatch(
      write(
        selectCaseStatus(getState()).rows.map(row =>
          row.id === id ? { ...row, value: { ...row.value, status: change(row.value.status) } } : row,
        ),
      ),
    );

export const reorderStatuses = (rows: Row<StatusRow>[]): AppThunk => write(rows);

export const setStatusColor = (id: string, color: string): AppThunk => update(id, old => ({ ...old, color }));

// Lets a status move to another one, or not
export const setTransition = (id: string, target: string, allowed: boolean): AppThunk =>
  update(id, old => ({
    ...old,
    transitions: allowed ? [...old.transitions, target] : old.transitions.filter(other => other !== target),
  }));

// A new status is saved under a value made from its name; existing ones keep theirs
export const renameStatus =
  (id: string, label: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { rows, current } = selectCaseStatus(state);
    const row = rows.find(candidate => candidate.id === id);
    if (!row) return;
    const { status } = row.value;
    const originalValues = new Set(Object.values(getCaseStatusMap(state.draft.original)).map(old => old.value));
    if (originalValues.has(status.value)) {
      dispatch(update(id, old => ({ ...old, label })));
      return;
    }
    const value = newStatusValue(
      label,
      rows.filter(other => other.id !== id).map(other => other.value.status.value),
    );
    const renamed = (target: string) => (target === status.value ? value : target);
    dispatch(
      write(
        rows.map(candidate =>
          candidate.id === id
            ? {
                ...candidate,
                value: { key: value, status: { ...status, label, value, transitions: status.transitions } },
              }
            : {
                ...candidate,
                value: {
                  ...candidate.value,
                  status: { ...candidate.value.status, transitions: candidate.value.status.transitions.map(renamed) },
                },
              },
        ),
      ),
    );
    if (current === status.value) dispatch(currentChanged(value));
  };

export const addStatus = (): AppThunk => (dispatch, getState) => {
  const { rows } = selectCaseStatus(getState());
  const value = newStatusValue(
    'New status',
    rows.map(row => row.value.status.value),
  );
  const [row] = toRows([
    { key: value, status: { value, label: 'New status', color: 'blue', transitions: ['closed'] } },
  ]);
  dispatch(write([...rows, row]));
};

export const removeStatus =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const { rows } = selectCaseStatus(getState());
    const removed = rows.find(row => row.id === id)?.value.status.value;
    dispatch(
      write(
        rows
          .filter(candidate => candidate.id !== id)
          // Nothing can move to a status that's gone
          .map(candidate => ({
            ...candidate,
            value: {
              ...candidate.value,
              status: {
                ...candidate.value.status,
                transitions: candidate.value.status.transitions.filter(target => target !== removed),
              },
            },
          })),
      ),
    );
  };
