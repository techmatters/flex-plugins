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
 * The form editor (a contact form tab or a case section's form): the form's fields in its two
 * Aselo columns, the selected field, the add-field menu, the linked dropdowns wizard and the
 * linked dropdowns whose answers are being edited.
 *
 * Every change is written straight back to the draft: the form's JSON file, plus
 * LayoutDefinitions.json when the column split moves (and ReferenceData.json for big lists of
 * linked answers).
 */
import { createSelector, createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { FormItemJsonDefinition, SelectOption } from '@hrm-form-definitions/formDefinition/types';

import { AppThunk, RootState, rootReducer } from '../app/store';
import { editDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import {
  type DefinitionFileMap,
  describeDefinitionFile,
  type FormTarget,
  getForm,
  getReferenceData,
  getSplitFormAt,
  isContactTab,
  LAYOUT_FILE,
  REFERENCE_DATA_FILE,
  splitIntoColumns,
} from '../common/definitions';
import { isSameJson } from '../drafts/changes';
import { baseLanguageOf, setSubstitution } from '../cases/caseSections';
import {
  AnswerNode,
  applyChainOptions,
  chainToTree,
  ChainTree,
  createChainFields,
  findReferenceKeyUsers,
  makeKeyValuesUnique,
  treeToChainOptions,
} from '../linkedDropdowns/linkedDropdowns';
import {
  applyColumnSplit,
  blankOptionValueFor,
  changeFieldType,
  createField,
  FieldType,
  setFieldRequired,
  toFieldName,
  uniqueFieldName,
  updateField,
} from './formEditing';

export type ColumnKey = 'left' | 'right';
export const COLUMN_KEYS: ColumnKey[] = ['left', 'right'];

// Editor-only wrapper: a stable id for drag and drop and selection (field names can change)
export type Entry = { id: string; item: FormItemJsonDefinition };
type Columns = Record<ColumnKey, Entry[]>;

// Linked dropdowns whose answers are being edited
type EditingChain = {
  names: string[];
  fields: FormItemJsonDefinition[];
  tree: ChainTree;
  notes: string[];
};

type FormEditorState = {
  // The form open, and the editors' revision it was opened at (see workspaceSlice)
  target?: FormTarget;
  revision?: number;
  // Whether the form had its own column split before this draft
  hadExplicitSplit: boolean;
  columns: Columns;
  selectedId?: string;
  // The field being dragged, and the columns as they were before (restored if the drag is cancelled)
  drag?: { activeId: string; columnsBefore: Columns };
  // The column whose "Add a field" menu is open
  addingTo?: ColumnKey;
  // Column where the "Add linked dropdowns" wizard will put the new fields
  linkedWizardColumn?: ColumnKey;
  editingChain?: EditingChain;
};

const initialState: FormEditorState = { hadExplicitSplit: false, columns: { left: [], right: [] } };

const findColumn = (columns: Columns, id: string): ColumnKey | undefined => {
  if (id === 'left' || id === 'right') return id;
  return COLUMN_KEYS.find(key => columns[key].some(entry => entry.id === id));
};

const formEditorSlice = createSlice({
  name: 'formEditor',
  initialState,
  reducers: {
    formOpened: (
      _state,
      action: PayloadAction<Pick<FormEditorState, 'target' | 'revision' | 'hadExplicitSplit' | 'columns'>>,
    ) => ({ ...initialState, ...action.payload }),
    columnsChanged: (state, action: PayloadAction<Columns>) => {
      state.columns = action.payload;
    },
    fieldSelected: (state, action: PayloadAction<string | undefined>) => {
      state.selectedId = action.payload;
    },
    dragStarted: (state, action: PayloadAction<string>) => {
      state.drag = { activeId: action.payload, columnsBefore: state.columns };
    },
    // Moving into the other column happens while dragging, so the preview updates live
    fieldDraggedOver: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      const from = findColumn(state.columns, activeId);
      const to = findColumn(state.columns, overId);
      if (!from || !to || from === to) return;
      const moving = state.columns[from].find(entry => entry.id === activeId);
      if (!moving) return;
      const overIndex = state.columns[to].findIndex(entry => entry.id === overId);
      const insertAt = overIndex >= 0 ? overIndex : state.columns[to].length;
      state.columns[from] = state.columns[from].filter(entry => entry.id !== activeId);
      state.columns[to].splice(insertAt, 0, moving);
    },
    dragCancelled: state => {
      if (state.drag) state.columns = state.drag.columnsBefore;
      state.drag = undefined;
    },
    dragEnded: state => {
      state.drag = undefined;
    },
    addFieldMenuToggled: (state, action: PayloadAction<ColumnKey | undefined>) => {
      state.addingTo = action.payload;
    },
    linkedWizardToggled: (state, action: PayloadAction<ColumnKey | undefined>) => {
      state.addingTo = undefined;
      state.linkedWizardColumn = action.payload;
    },
    chainEditorToggled: (state, action: PayloadAction<EditingChain | undefined>) => {
      state.editingChain = action.payload;
    },
  },
  selectors: {
    selectFormEditor: state => state,
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof formEditorSlice> {}
}
const injected = formEditorSlice.injectInto(rootReducer);
export const { selectFormEditor } = injected.selectors;
const { formOpened, columnsChanged, dragEnded } = formEditorSlice.actions;
export const {
  fieldSelected,
  dragStarted,
  fieldDraggedOver,
  dragCancelled,
  addFieldMenuToggled,
  linkedWizardToggled,
  chainEditorToggled,
} = formEditorSlice.actions;

// Every field in the form, left column first
export const selectFormItems = createSelector([(state: RootState) => selectFormEditor(state).columns], columns =>
  [...columns.left, ...columns.right].map(entry => entry.item),
);

export const selectSelectedEntry = (state: RootState) => {
  const { columns, selectedId } = selectFormEditor(state);
  return [...columns.left, ...columns.right].find(entry => entry.id === selectedId);
};

// The open form's fields as they were before this draft, by name
export const selectOriginalFieldsByName = createSelector(
  [selectOriginalFiles, (state: RootState) => selectFormEditor(state).target?.filePath],
  (originalFiles, filePath) =>
    new Map((filePath ? getForm(originalFiles, filePath) ?? [] : []).map(item => [item.name, item])),
);

// Where a form's problems are in selectIssuesByTab
export const issuesKeyOf = (target: FormTarget) => (isContactTab(target) ? target.key : `case:${target.key}`);

let nextEntryId = 0;
const toEntry = (item: FormItemJsonDefinition): Entry => {
  nextEntryId += 1;
  return { id: `field-${nextEntryId}`, item };
};

// Starts editing a form, from the draft (the editor owns the column layout while it's open)
export const openFormEditor =
  (target: FormTarget, revision: number): AppThunk =>
  (dispatch, getState) => {
    const { files, original } = getState().draft;
    const [left, right] = splitIntoColumns(getForm(files, target.filePath) ?? [], getSplitFormAt(files, target));
    dispatch(
      formOpened({
        target,
        revision,
        hadExplicitSplit: getSplitFormAt(original, target) !== undefined,
        columns: { left: left.map(toEntry), right: right.map(toEntry) },
      }),
    );
  };

// The columns as they are now, written to the draft with any other files that changed with them
const commit =
  (next: Columns, otherFiles: DefinitionFileMap = {}): AppThunk =>
  (dispatch, getState) => {
    dispatch(columnsChanged(next));
    const { target, hadExplicitSplit } = selectFormEditor(getState());
    if (!target) return;
    const items = [...next.left, ...next.right].map(entry => entry.item);
    dispatch(
      editDraftFiles(current => {
        const files = { ...current, ...otherFiles };
        const currentLayout = (files[LAYOUT_FILE] ?? {}) as Record<string, unknown>;
        const layout = applyColumnSplit(
          currentLayout,
          target.layoutPath,
          next.left.length,
          items.length,
          hadExplicitSplit,
        );
        const layoutChanged = !isSameJson(layout, currentLayout);
        return {
          ...files,
          [target.filePath]: items,
          ...(layoutChanged ? { [LAYOUT_FILE]: layout } : {}),
        };
      }),
    );
  };

// Dropped: reordered within its column (moving between columns already happened while dragging)
export const finishDrag =
  (activeId: string, overId?: string): AppThunk =>
  (dispatch, getState) => {
    const { columns } = selectFormEditor(getState());
    dispatch(dragEnded());
    const column = findColumn(columns, activeId);
    let next = columns;
    if (overId !== undefined && column && findColumn(columns, overId) === column) {
      const oldIndex = columns[column].findIndex(entry => entry.id === activeId);
      const overIndex = columns[column].findIndex(entry => entry.id === overId);
      const newIndex = overIndex >= 0 ? overIndex : columns[column].length - 1;
      if (oldIndex !== newIndex) {
        const moved = [...columns[column]];
        moved.splice(newIndex, 0, ...moved.splice(oldIndex, 1));
        next = { ...columns, [column]: moved };
      }
    }
    dispatch(commit(next));
  };

const mapEntry = (columns: Columns, id: string, update: (entry: Entry) => Entry | undefined): Columns => ({
  left: columns.left.flatMap(entry => (entry.id === id ? update(entry) ?? [] : [entry])),
  right: columns.right.flatMap(entry => (entry.id === id ? update(entry) ?? [] : [entry])),
});

export const addField =
  (column: ColumnKey, type: FieldType): AppThunk =>
  (dispatch, getState) => {
    const { columns } = selectFormEditor(getState());
    const entry = toEntry(
      createField(
        type,
        selectFormItems(getState()).map(item => item.name),
      ),
    );
    dispatch(commit({ ...columns, [column]: [...columns[column], entry] }));
    dispatch(addFieldMenuToggled(undefined));
    dispatch(fieldSelected(entry.id));
  };

const changeSelectedField =
  (item: FormItemJsonDefinition): AppThunk =>
  (dispatch, getState) => {
    const { columns, selectedId } = selectFormEditor(getState());
    if (!selectedId) return;
    dispatch(commit(mapEntry(columns, selectedId, entry => ({ ...entry, item }))));
  };

// The selected field changed with the editing rules of formEditing.ts
const updateSelectedField =
  (update: (item: FormItemJsonDefinition, state: RootState) => FormItemJsonDefinition): AppThunk =>
  (dispatch, getState) => {
    const entry = selectSelectedEntry(getState());
    if (entry) dispatch(changeSelectedField(update(entry.item, getState())));
  };

// A new field's saved name follows its label, until someone sets the name by hand
const autoFieldNameOf = (state: RootState, label: string) => {
  const { columns, selectedId } = selectFormEditor(state);
  const otherNames = [...columns.left, ...columns.right]
    .filter(entry => entry.id !== selectedId)
    .map(entry => entry.item.name);
  return uniqueFieldName(toFieldName(label), otherNames);
};

export const changeFieldLabel = (label: string): AppThunk =>
  updateSelectedField((item, state) => {
    const isNew = !selectOriginalFieldsByName(state).has(item.name);
    const nameFollowsLabel = isNew && item.name === autoFieldNameOf(state, item.label);
    return updateField(item, nameFollowsLabel ? { label, name: autoFieldNameOf(state, label) } : { label });
  });

export const changeFieldName = (name: string): AppThunk =>
  updateSelectedField(item => updateField(item, { name: name.trim() }));

/**
 * The help box (description) shows under the field. Its parts can be translation keys (as in AS);
 * those are edited as the helpline's own wording (isKey: whether the part is one, which the
 * component knows once the translations have loaded). The rest is text in the form; emptying
 * both parts of a box written in the form removes it.
 */
export const changeFieldDescription =
  (part: 'title' | 'content', text: string, isKey: boolean): AppThunk =>
  (dispatch, getState) => {
    const item = selectSelectedEntry(getState())?.item;
    const description = item?.description as { title?: string; content?: string } | undefined;
    const stored = description?.[part];
    if (isKey && stored) {
      dispatch(setTranslation(stored, text));
      return;
    }
    const next = { title: description?.title ?? '', content: description?.content ?? '', [part]: text };
    dispatch(
      updateSelectedField(current =>
        updateField(current, { description: next.title.trim() || next.content.trim() ? next : undefined }),
      ),
    );
  };

export const changeSelectedFieldType = (type: FieldType): AppThunk =>
  updateSelectedField(item => changeFieldType(item, type));

export const setSelectedFieldRequired = (required: boolean): AppThunk =>
  updateSelectedField(item => setFieldRequired(item, required));

export const setSelectedFieldOptions = (options: SelectOption[]): AppThunk =>
  updateSelectedField(item => updateField(item, { options }));

export const setSelectedFieldPII = (isPII: boolean): AppThunk =>
  updateSelectedField(item => updateField(item, { isPII }));

export const removeSelectedField = (): AppThunk => (dispatch, getState) => {
  const { columns, selectedId } = selectFormEditor(getState());
  if (!selectedId) return;
  dispatch(commit(mapEntry(columns, selectedId, () => undefined)));
  dispatch(fieldSelected(undefined));
};

// Sets the helpline's own wording for a translation key (customStrings/Substitutions.json)
const setTranslation =
  (key: string, text: string): AppThunk =>
  (dispatch, getState) => {
    const helplineLanguage = getState().workspace.definitions?.helplineLanguage;
    dispatch(editDraftFiles(files => setSubstitution(files, baseLanguageOf(helplineLanguage), key, text)));
  };

/**
 * Linked dropdowns
 */

// Turns edited answers into the chain's field options (and ReferenceData.json if needed)
const buildChain = (
  draftFiles: DefinitionFileMap,
  fields: FormItemJsonDefinition[],
  roots: AnswerNode[],
  tree: Pick<ChainTree, 'rootBlankOption' | 'unusedLists'>,
  replacedByImport: boolean,
) => {
  const unique = makeKeyValuesUnique(roots, fields.length, { fixExisting: replacedByImport });
  const options = treeToChainOptions(
    unique.roots,
    fields.length,
    tree.rootBlankOption,
    // An import replaces everything, including lists that could never show
    replacedByImport ? [] : tree.unusedLists,
  );
  const result = applyChainOptions(fields, options, draftFiles);
  return {
    fields: result.fields,
    otherFiles: result.referenceData ? { [REFERENCE_DATA_FILE]: result.referenceData } : {},
  };
};

// Opens the answers of a set of linked dropdowns, with what the user should know before editing them
export const openChainEditor =
  (names: string[]): AppThunk =>
  (dispatch, getState) => {
    const { target } = selectFormEditor(getState());
    const draftFiles = getState().draft.files;
    const formItems = selectFormItems(getState());
    const fields = names.map(name => formItems.find(item => item.name === name)!);
    const tree = chainToTree(fields, getReferenceData(draftFiles));
    const notes: string[] = [];
    fields.forEach(field => {
      const key = (field as { optionsReferenceKey?: string }).optionsReferenceKey;
      if (!key) return;
      const others = findReferenceKeyUsers(draftFiles, key, filePath =>
        describeDefinitionFile(draftFiles, filePath),
      ).filter(user => !(user.filePath === target?.filePath && user.fieldName === field.name));
      if (others.length > 0) {
        notes.push(
          `The “${field.label}” answers are shared with ${others
            .map(other => other.description)
            .join(', ')}. Changes here change them there too.`,
        );
      }
    });
    if (tree.sharedValues.length > 0) {
      notes.push(
        `${tree.sharedValues.length} answer(s) share a name with another answer at the same level (e.g. “${tree.sharedValues[0]}”), so they show the same answers below them. To give each its own list, download as Excel and import it again.`,
      );
    }
    if (tree.unusedLists.length > 0) {
      notes.push(
        `${tree.unusedLists.length} list(s) of answers are filed under an answer that doesn't exist (e.g. “${tree.unusedLists[0].key}”), so counselors never see them. They're kept as they are unless you import from a spreadsheet.`,
      );
    }
    dispatch(chainEditorToggled({ names, fields, tree, notes }));
  };

export const saveChainAnswers =
  (roots: AnswerNode[], replacedByImport: boolean): AppThunk =>
  (dispatch, getState) => {
    const { editingChain, columns } = selectFormEditor(getState());
    if (!editingChain) return;
    const { fields, otherFiles } = buildChain(
      getState().draft.files,
      editingChain.fields,
      roots,
      editingChain.tree,
      replacedByImport,
    );
    const byName = new Map(fields.map(field => [field.name, field]));
    const updateEntries = (entries: Entry[]) =>
      entries.map(entry => {
        const updated = byName.get(entry.item.name);
        return updated ? { ...entry, item: updated } : entry;
      });
    dispatch(commit({ left: updateEntries(columns.left), right: updateEntries(columns.right) }, otherFiles));
    dispatch(chainEditorToggled(undefined));
  };

// Adds the dropdowns made in the wizard, or the follow-up dropdowns under an existing one
export const createChain =
  (levelLabels: string[], roots: AnswerNode[], existingTop?: FormItemJsonDefinition): AppThunk =>
  (dispatch, getState) => {
    const { columns, linkedWizardColumn } = selectFormEditor(getState());
    if (!linkedWizardColumn) return;
    const draftFiles = getState().draft.files;
    const newFields = createChainFields(
      levelLabels,
      selectFormItems(getState()).map(item => item.name),
      existingTop,
    );
    const rootBlankOption = existingTop
      ? chainToTree([existingTop], getReferenceData(draftFiles)).rootBlankOption
      : { value: blankOptionValueFor(false), label: '' };
    const { fields, otherFiles } = buildChain(
      draftFiles,
      newFields,
      roots,
      { rootBlankOption, unusedLists: [] },
      false,
    );
    const [top, ...dependents] = fields.map(toEntry);

    let next: Columns;
    let selectedId: string | undefined;
    if (existingTop) {
      // Follow-up dropdowns go straight under the question they depend on
      const topColumn = COLUMN_KEYS.find(key => columns[key].some(entry => entry.item.name === existingTop.name))!;
      const index = columns[topColumn].findIndex(entry => entry.item.name === existingTop.name);
      const updated = [...columns[topColumn]];
      updated.splice(index, 1, { ...updated[index], item: top.item }, ...dependents);
      next = { ...columns, [topColumn]: updated };
      selectedId = dependents[0]?.id;
    } else {
      next = { ...columns, [linkedWizardColumn]: [...columns[linkedWizardColumn], top, ...dependents] };
      selectedId = top.id;
    }
    dispatch(fieldSelected(selectedId));
    dispatch(commit(next, otherFiles));
    dispatch(linkedWizardToggled(undefined));
  };
