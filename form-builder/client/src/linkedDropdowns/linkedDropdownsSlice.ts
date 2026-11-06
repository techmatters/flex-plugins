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
 * The linked dropdowns editors, used by the contact form editor and the webchat form editor:
 * - the answers being edited (LinkedAnswersEditor and its AnswerColumns), until they're saved
 *   back to the fields by the editor that opened them;
 * - a spreadsheet being imported over them (SpreadsheetImport);
 * - the "Add linked dropdowns" wizard (LinkedDropdownsWizard).
 * Only one of each is open at a time. Each opens with what it's given when it mounts and is
 * closed when it unmounts.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';

import { AppThunk, rootReducer } from '../app/store';
import { AnswerNode, chainToTree, getChildrenAtPath, newAnswerNode, updateChildrenAtPath } from './linkedDropdowns';
import { readSpreadsheetFile } from './spreadsheet';

// What's typed in one column of answers
export type ColumnInputs = { search: string; newLabel: string; bulkText?: string; message?: string };
const EMPTY_INPUTS: ColumnInputs = { search: '', newLabel: '' };

type AnswersEditorState = {
  roots: AnswerNode[];
  // The selected answer's id in each column
  selected: string[];
  importing: boolean;
  replacedByImport: boolean;
  changed: boolean;
  // By level; a column starts afresh when the answer it shows the answers under changes
  columns: Record<number, ColumnInputs>;
  // The answer being renamed, and its text so far
  renaming?: { id: string; text: string };
};

type SpreadsheetImportState = {
  pastedText: string;
  rows?: string[][];
  // Where the rows came from (a file name, or the pasted cells)
  source?: string;
  firstRowIsHeader: boolean;
  error?: string;
};

type WizardState = {
  startFrom: 'new' | 'existing';
  // The dropdown already on the form that starts the chain, when starting from one
  rootName: string;
  labels: string[];
  step: 'levels' | 'answers';
  // The answers entered so far, kept when going back to the levels
  roots: AnswerNode[];
};

type LinkedDropdownsState = {
  answers?: AnswersEditorState;
  spreadsheetImport?: SpreadsheetImportState;
  wizard?: WizardState;
};

const initialState: LinkedDropdownsState = {};

// What the column at a level shows the answers under (see LinkedAnswersEditor)
const columnParent = (selected: string[], level: number) => (level === 0 ? 'top' : selected[level - 1] ?? 'none');

// Columns whose parent answer changed start afresh (search, typed answers)
const keepColumnsWithSameParent = (answers: AnswersEditorState, nextSelected: string[]) =>
  Object.fromEntries(
    Object.entries(answers.columns).filter(
      ([level]) => columnParent(answers.selected, Number(level)) === columnParent(nextSelected, Number(level)),
    ),
  );

const linkedDropdownsSlice = createSlice({
  name: 'linkedDropdowns',
  initialState,
  reducers: {
    answersEditorOpened: (state, action: PayloadAction<AnswerNode[]>) => {
      state.answers = {
        roots: action.payload,
        selected: [],
        importing: false,
        replacedByImport: false,
        changed: false,
        columns: {},
      };
    },
    answersEditorClosed: state => {
      state.answers = undefined;
    },
    answerSelected: (state, action: PayloadAction<{ level: number; id: string }>) => {
      if (!state.answers) return;
      const { level, id } = action.payload;
      const selected = [...state.answers.selected.slice(0, level), id];
      state.answers.columns = keepColumnsWithSameParent(state.answers, selected);
      state.answers.selected = selected;
    },
    // The answers in one column (under the answers selected to its left)
    levelChanged: (state, action: PayloadAction<{ level: number; answers: AnswerNode[] }>) => {
      if (!state.answers) return;
      const { level, answers } = action.payload;
      state.answers.roots = updateChildrenAtPath(
        state.answers.roots,
        state.answers.selected.slice(0, level),
        () => answers,
      );
      state.answers.changed = true;
    },
    columnInputsChanged: (state, action: PayloadAction<{ level: number; inputs: Partial<ColumnInputs> }>) => {
      if (!state.answers) return;
      const { level, inputs } = action.payload;
      state.answers.columns[level] = { ...EMPTY_INPUTS, ...state.answers.columns[level], ...inputs };
    },
    renamingChanged: (state, action: PayloadAction<{ id: string; text: string } | undefined>) => {
      if (state.answers) state.answers.renaming = action.payload;
    },
    importToggled: (state, action: PayloadAction<boolean>) => {
      if (state.answers) state.answers.importing = action.payload;
    },
    // Everything is replaced with what was imported
    answersImported: (state, action: PayloadAction<AnswerNode[]>) => {
      if (!state.answers) return;
      state.answers.columns = keepColumnsWithSameParent(state.answers, []);
      state.answers.roots = action.payload;
      state.answers.selected = [];
      state.answers.replacedByImport = true;
      state.answers.changed = true;
      state.answers.importing = false;
    },
    spreadsheetImportOpened: state => {
      state.spreadsheetImport = { pastedText: '', firstRowIsHeader: true };
    },
    spreadsheetImportClosed: state => {
      state.spreadsheetImport = undefined;
    },
    spreadsheetImportChanged: (state, action: PayloadAction<Partial<SpreadsheetImportState>>) => {
      if (state.spreadsheetImport) state.spreadsheetImport = { ...state.spreadsheetImport, ...action.payload };
    },
    wizardOpened: (state, action: PayloadAction<{ rootName: string }>) => {
      state.wizard = {
        startFrom: 'new',
        rootName: action.payload.rootName,
        labels: ['', ''],
        step: 'levels',
        roots: [],
      };
    },
    wizardClosed: state => {
      state.wizard = undefined;
    },
    wizardChanged: (state, action: PayloadAction<Partial<WizardState>>) => {
      if (state.wizard) state.wizard = { ...state.wizard, ...action.payload };
    },
  },
  selectors: {
    selectAnswersEditor: state => state.answers,
    selectSpreadsheetImport: state => state.spreadsheetImport,
    selectWizard: state => state.wizard,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof linkedDropdownsSlice> {}
}
const injected = linkedDropdownsSlice.injectInto(rootReducer);
export const { selectAnswersEditor, selectSpreadsheetImport, selectWizard } = injected.selectors;
const { levelChanged } = linkedDropdownsSlice.actions;
export const {
  answersEditorOpened,
  answersEditorClosed,
  answerSelected,
  columnInputsChanged,
  renamingChanged,
  importToggled,
  answersImported,
  spreadsheetImportOpened,
  spreadsheetImportClosed,
  spreadsheetImportChanged,
  wizardOpened,
  wizardClosed,
  wizardChanged,
} = linkedDropdownsSlice.actions;

/**
 * Answers in one column
 */

// The answers shown in a column: undefined when nothing is selected in the column to its left
export const answersAtLevel = (answers: AnswersEditorState, level: number) =>
  level === 0 || answers.selected[level - 1]
    ? getChildrenAtPath(answers.roots, answers.selected.slice(0, level))
    : undefined;

const updateLevel =
  (level: number, update: (answers: AnswerNode[]) => AnswerNode[]): AppThunk =>
  (dispatch, getState) => {
    const answers = selectAnswersEditor(getState());
    const current = answers && answersAtLevel(answers, level);
    if (current) dispatch(levelChanged({ level, answers: update(current) }));
  };

// Adds answers to a column, skipping ones already there, and says which were skipped
const addAnswers =
  (level: number, labels: string[]): AppThunk =>
  (dispatch, getState) => {
    const answers = selectAnswersEditor(getState());
    const current = answers && answersAtLevel(answers, level);
    if (!current) return;
    const existing = new Set(current.map(answer => answer.label.trim().toLowerCase()));
    const toAdd: string[] = [];
    const skipped: string[] = [];
    labels
      .map(text => text.trim())
      .filter(Boolean)
      .forEach(text => {
        if (existing.has(text.toLowerCase())) skipped.push(text);
        else {
          existing.add(text.toLowerCase());
          toAdd.push(text);
        }
      });
    if (toAdd.length)
      dispatch(levelChanged({ level, answers: [...current, ...toAdd.map(text => newAnswerNode(text))] }));
    dispatch(
      columnInputsChanged({
        level,
        inputs: { message: skipped.length ? `Already in the list: ${skipped.slice(0, 3).join(', ')}` : undefined },
      }),
    );
  };

// What's typed in the column's "Add a ..." box
export const addTypedAnswer =
  (level: number): AppThunk =>
  (dispatch, getState) => {
    const newLabel = selectAnswersEditor(getState())?.columns[level]?.newLabel ?? '';
    dispatch(addAnswers(level, [newLabel]));
    dispatch(columnInputsChanged({ level, inputs: { newLabel: '' } }));
  };

// What's pasted in the column, one per line, then the box closes
export const addPastedAnswers =
  (level: number): AppThunk =>
  (dispatch, getState) => {
    const bulkText = selectAnswersEditor(getState())?.columns[level]?.bulkText ?? '';
    dispatch(addAnswers(level, bulkText.split('\n')));
    dispatch(columnInputsChanged({ level, inputs: { bulkText: undefined } }));
  };

// The answer being renamed gets its new text (if there is one), and renaming ends
export const finishRenaming =
  (level: number): AppThunk =>
  (dispatch, getState) => {
    const renaming = selectAnswersEditor(getState())?.renaming;
    if (!renaming) return;
    const { id, text } = renaming;
    dispatch(renamingChanged(undefined));
    dispatch(
      updateLevel(level, answers =>
        answers.map(answer => {
          if (answer.id !== id || !text.trim() || text === answer.label) return answer;
          // Answers that already existed keep their saved value, so past contacts still match
          return answer.existing ? { ...answer, label: text } : { ...answer, label: text, value: text.trim() };
        }),
      ),
    );
  };

export const removeAnswer = (level: number, id: string): AppThunk =>
  updateLevel(level, answers => answers.filter(other => other.id !== id));

export const sortAnswers = (level: number): AppThunk =>
  updateLevel(level, answers =>
    [...answers].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
  );

export const moveAnswer = (level: number, activeId: string, overId: string): AppThunk =>
  updateLevel(level, answers => {
    const oldIndex = answers.findIndex(answer => answer.id === activeId);
    const newIndex = answers.findIndex(answer => answer.id === overId);
    const moved = [...answers];
    moved.splice(newIndex, 0, ...moved.splice(oldIndex, 1));
    return moved;
  });

/**
 * Importing from a spreadsheet
 */

// A first row that repeats the level names is treated as column headings
const looksLikeHeader = (row: string[] | undefined, levelLabels: string[]) =>
  Boolean(
    row &&
      levelLabels.some((label, index) =>
        String(row[index] ?? '')
          .trim()
          .toLowerCase()
          .includes(label.trim().toLowerCase().split(' ')[0]),
      ),
  );

export const acceptSpreadsheetRows =
  (rows: string[][], source: string, levelLabels: string[]): AppThunk =>
  dispatch =>
    dispatch(
      spreadsheetImportChanged({
        rows,
        source,
        firstRowIsHeader: looksLikeHeader(rows[0], levelLabels),
        error: undefined,
      }),
    );

export const readSpreadsheet =
  (file: File, levelLabels: string[]): AppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(acceptSpreadsheetRows(await readSpreadsheetFile(file), file.name, levelLabels));
    } catch (err) {
      dispatch(spreadsheetImportChanged({ error: `Couldn't read ${file.name}: ${(err as Error).message}` }));
    }
  };

/**
 * The wizard
 */

// To the answers; starting from an existing dropdown, its answers become the first column
export const wizardToAnswers =
  (existingRoot: FormItemJsonDefinition | undefined, referenceData: Record<string, unknown>): AppThunk =>
  (dispatch, getState) => {
    const wizard = selectWizard(getState());
    if (!wizard) return;
    const roots =
      existingRoot && wizard.roots.length === 0 ? chainToTree([existingRoot], referenceData).roots : wizard.roots;
    dispatch(wizardChanged({ roots, step: 'answers' }));
  };
