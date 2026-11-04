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
 * The issue categories editor: the categories being edited (as rows, since names can change
 * while editing), which one is open, and what's typed to paste several subcategories. Every
 * change is written to the draft's IssueCategorizationTab.json (categories.ts), except while two
 * categories share a name (names are the file's keys).
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { CategoriesDefinition } from '@hrm-form-definitions/formDefinition/types';
import { AppThunk, rootReducer } from '../app/store';
import { editDraftFiles } from '../drafts/draftSlice';
import { Row, toRows } from '../common/SortableRows';
import type { SelectedCategories } from '../aseloPreview/AseloCategories';
import { CATEGORY_COLORS, getHelplineCategories, setHelplineCategories, Subcategory } from './categories';

// Names can change while editing, so rows carry ids
export type CategoryValue = {
  name: string;
  // The name it was loaded with, for categories that existed before this draft
  originalName?: string;
  // Everything else on the category (color, and anything the editor doesn't know about)
  entry: Omit<CategoriesDefinition['categories'][string], 'subcategories'>;
  subcategories: Row<Subcategory>[];
};

export type CategoriesState = {
  // The helpline whose categories are shown (a file can hold several)
  helpline?: string;
  rows: Row<CategoryValue>[];
  // Subcategories that existed before this draft, by row id (their names are locked)
  existingSubIds: string[];
  openId?: string;
  // Subcategories being pasted into a category, one per line
  bulk?: { id: string; text: string };
  // What's ticked in the preview
  previewSelected: SelectedCategories;
};

const initialState: CategoriesState = { rows: [], existingSubIds: [], previewSelected: {} };

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    categoriesOpened: (_state, action: PayloadAction<Omit<CategoriesState, 'previewSelected'>>) => ({
      ...initialState,
      ...action.payload,
    }),
    rowsChanged: (state, action: PayloadAction<Row<CategoryValue>[]>) => {
      state.rows = action.payload;
    },
    categoryToggled: (state, action: PayloadAction<string>) => {
      state.openId = state.openId === action.payload ? undefined : action.payload;
    },
    bulkChanged: (state, action: PayloadAction<{ id: string; text: string } | undefined>) => {
      state.bulk = action.payload;
    },
    previewSelectedChanged: (state, action: PayloadAction<SelectedCategories>) => {
      state.previewSelected = action.payload;
    },
  },
  selectors: {
    selectCategories: (state) => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof categoriesSlice> {}
}
const injected = categoriesSlice.injectInto(rootReducer);
export const { selectCategories } = injected.selectors;
const { categoriesOpened, rowsChanged } = categoriesSlice.actions;
export const { categoryToggled, bulkChanged, previewSelectedChanged } = categoriesSlice.actions;

const toCategoryRows = (
  definition: CategoriesDefinition | undefined,
  original: CategoriesDefinition | undefined,
): Row<CategoryValue>[] =>
  toRows(
    Object.entries(definition?.categories ?? {}).map(([name, { subcategories, ...entry }]) => ({
      name,
      originalName: original?.categories[name] ? name : undefined,
      entry,
      subcategories: toRows(subcategories ?? []),
    })),
  );

// Names are keys in the file, so nothing is saved while two categories share one
export const hasDuplicateNames = (rows: Row<CategoryValue>[]) =>
  new Set(rows.map((row) => row.value.name)).size < rows.length;

const uniqueName = (base: string, taken: string[]) => {
  let name = base;
  for (let n = 2; taken.includes(name); n += 1) name = `${base} ${n}`;
  return name;
};

// Starts editing a helpline's categories, from the draft
export const openCategories =
  (helpline: string | undefined): AppThunk =>
  (dispatch, getState) => {
    const { files, original: originalFiles } = getState().draft;
    if (!helpline) {
      dispatch(categoriesOpened({ rows: [], existingSubIds: [] }));
      return;
    }
    const original = getHelplineCategories(originalFiles, helpline);
    const rows = toCategoryRows(getHelplineCategories(files, helpline), original);
    const existingSubIds = rows.flatMap(({ value }) =>
      value.subcategories
        .filter((sub) =>
          original?.categories[value.originalName ?? '']?.subcategories.some((old) => old.label === sub.value.label),
        )
        .map((sub) => sub.id),
    );
    dispatch(categoriesOpened({ helpline, rows, existingSubIds }));
  };

// The rows as they are now, and written to the draft (with any other change to the definition)
const write =
  (rows: Row<CategoryValue>[], changes: Partial<CategoriesDefinition> = {}): AppThunk =>
  (dispatch, getState) => {
    dispatch(rowsChanged(rows));
    const { helpline } = selectCategories(getState());
    if (!helpline || hasDuplicateNames(rows)) return;
    dispatch(
      editDraftFiles((files) =>
        setHelplineCategories(files, helpline, {
          ...getHelplineCategories(files, helpline),
          ...changes,
          categories: Object.fromEntries(
            rows.map(({ value }) => [value.name, { ...value.entry, subcategories: value.subcategories.map((sub) => sub.value) }]),
          ) as CategoriesDefinition['categories'],
        }),
      ),
    );
  };

const updateCategory =
  (id: string, update: (value: CategoryValue) => CategoryValue): AppThunk =>
  (dispatch, getState) =>
    dispatch(write(selectCategories(getState()).rows.map((row) => (row.id === id ? { ...row, value: update(row.value) } : row))));

export const setMaxSelections =
  (maxSelections: number): AppThunk =>
  (dispatch, getState) =>
    dispatch(write(selectCategories(getState()).rows, { maxSelections }));

export const reorderCategories = (rows: Row<CategoryValue>[]): AppThunk => write(rows);

export const renameCategory = (id: string, name: string): AppThunk => updateCategory(id, (value) => ({ ...value, name }));

export const setCategoryColor = (id: string, color: string): AppThunk =>
  updateCategory(id, (value) => ({ ...value, entry: { ...value.entry, color } }));

export const addCategory = (): AppThunk => (dispatch, getState) => {
  const { rows } = selectCategories(getState());
  const [row] = toRows([
    {
      name: uniqueName(
        'New category',
        rows.map((candidate) => candidate.value.name),
      ),
      entry: { color: CATEGORY_COLORS[rows.length % CATEGORY_COLORS.length] },
      subcategories: toRows([{ label: 'Other' }]),
    },
  ]);
  dispatch(write([...rows, row]));
  dispatch(categoryToggled(row.id));
};

export const removeCategory =
  (id: string): AppThunk =>
  (dispatch, getState) =>
    dispatch(write(selectCategories(getState()).rows.filter((row) => row.id !== id)));

export const addSubcategories = (id: string, labels: string[]): AppThunk =>
  updateCategory(id, (value) => {
    const taken = value.subcategories.map((sub) => sub.value.label);
    const added = labels
      .map((label) => label.trim())
      .filter((label) => label && !taken.includes(label))
      .filter((label, index, all) => all.indexOf(label) === index);
    return { ...value, subcategories: [...value.subcategories, ...toRows(added.map((label) => ({ label })))] };
  });

// A new subcategory, named so it doesn't repeat one
export const addSubcategory =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const category = selectCategories(getState()).rows.find((row) => row.id === id);
    const taken = category?.value.subcategories.map((sub) => sub.value.label) ?? [];
    dispatch(addSubcategories(id, [uniqueName('New subcategory', taken)]));
  };

// What's pasted, one per line, then the box closes
export const addPastedSubcategories = (): AppThunk => (dispatch, getState) => {
  const { bulk } = selectCategories(getState());
  if (!bulk) return;
  dispatch(addSubcategories(bulk.id, bulk.text.split('\n')));
  dispatch(bulkChanged(undefined));
};

export const reorderSubcategories = (id: string, subcategories: Row<Subcategory>[]): AppThunk =>
  updateCategory(id, (value) => ({ ...value, subcategories }));

export const setSubcategory = (id: string, subId: string, sub: Subcategory): AppThunk =>
  updateCategory(id, (value) => ({
    ...value,
    subcategories: value.subcategories.map((candidate) => (candidate.id === subId ? { ...candidate, value: sub } : candidate)),
  }));

export const removeSubcategory = (id: string, subId: string): AppThunk =>
  updateCategory(id, (value) => ({
    ...value,
    subcategories: value.subcategories.filter((candidate) => candidate.id !== subId),
  }));
