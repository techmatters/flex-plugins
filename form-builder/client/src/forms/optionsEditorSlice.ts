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
 * The answers editors of dropdowns and multiple choice lists (OptionsEditor), by editor: each
 * answer's id (for drag and drop), which answers already existed, which have their own saved
 * value, and what's being pasted. The answers themselves belong to the field being edited:
 * each change works out the field's next answers and returns them, for the OptionsEditor to
 * pass on to whoever edits the field (the contact form editor, the webchat form editor).
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { SelectOption } from '@hrm-form-definitions/formDefinition/types';
import { AppThunk, RootState, rootReducer } from '../app/store';
import { isBlankOption } from './formEditing';

export type OptionsEditorState = {
  // Stable ids for drag and drop, kept in step with the answers (not counting a blank first one)
  ids: string[];
  // Rows that were already saved answers when the editor opened (decided once per row)
  existingIds: string[];
  // New answers whose saved value was set on purpose, so it no longer follows their text
  customValueIds: string[];
  showValues: boolean;
  // Answers being pasted, one per line
  bulkText?: string;
};

const optionsEditorSlice = createSlice({
  name: 'optionsEditor',
  initialState: {} as Record<string, OptionsEditorState>,
  reducers: {
    optionsEditorOpened: (state, action: PayloadAction<{ editorId: string; editor: OptionsEditorState }>) => {
      state[action.payload.editorId] = action.payload.editor;
    },
    optionsEditorClosed: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
    optionsEditorChanged: (
      state,
      action: PayloadAction<{ editorId: string; changes: Partial<OptionsEditorState> }>,
    ) => {
      const { editorId, changes } = action.payload;
      if (state[editorId]) state[editorId] = { ...state[editorId], ...changes };
    },
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof optionsEditorSlice> {}
}
optionsEditorSlice.injectInto(rootReducer);
const { optionsEditorOpened, optionsEditorChanged } = optionsEditorSlice.actions;
export const { optionsEditorClosed } = optionsEditorSlice.actions;

export const selectOptionsEditor = (state: RootState, editorId: string): OptionsEditorState | undefined =>
  state.optionsEditor?.[editorId];

export const showValuesToggled =
  (editorId: string): AppThunk =>
  (dispatch, getState) =>
    dispatch(
      optionsEditorChanged({
        editorId,
        changes: { showValues: !selectOptionsEditor(getState(), editorId)?.showValues },
      }),
    );

export const bulkTextChanged = (editorId: string, bulkText: string | undefined) =>
  optionsEditorChanged({ editorId, changes: { bulkText } });

/**
 * Answers pasted in one go, one per line. A line can be "saved value;text" when the two differ
 * ("00;0"), or two spreadsheet columns in the same order; otherwise the text is also the value.
 */
export const parsePastedAnswers = (text: string): SelectOption[] =>
  text
    .split(/\r?\n/)
    .filter(line => line.trim())
    .map(line => {
      const separator = line.includes('\t') ? '\t' : ';';
      const [first, ...rest] = line.split(separator);
      const label = rest.join(separator).trim();
      return label ? { value: first.trim(), label } : { value: first.trim(), label: first.trim() };
    })
    .filter(option => option.label);

// A blank first answer ("nothing chosen yet") isn't edited here, but is kept first
export const splitBlankOption = (options: SelectOption[]) => {
  const hasBlankFirst = options.length > 0 && isBlankOption(options[0], 0);
  return {
    blankOption: hasBlankFirst ? options[0] : undefined,
    editableOptions: hasBlankFirst ? options.slice(1) : options,
  };
};

const withBlank = (options: SelectOption[], editable: SelectOption[]) => {
  const { blankOption } = splitBlankOption(options);
  return blankOption ? [blankOption, ...editable] : editable;
};

let nextOptionId = 0;
const newOptionId = () => {
  nextOptionId += 1;
  return `option-${nextOptionId}`;
};

// Opens an answers editor on a field's answers
export const openOptionsEditor =
  (editorId: string, options: SelectOption[], originalValues: Set<string>): AppThunk =>
  dispatch => {
    const { editableOptions } = splitBlankOption(options);
    const ids = editableOptions.map(newOptionId);
    dispatch(
      optionsEditorOpened({
        editorId,
        editor: {
          ids,
          existingIds: ids.filter((_, index) => originalValues.has(String(editableOptions[index].value))),
          customValueIds: [],
          // Shown from the start when any answer is saved under something other than its text
          showValues: editableOptions.some(option => String(option.value) !== String(option.label).trim()),
        },
      }),
    );
  };

// Each change below returns the field's answers after it (undefined if the editor isn't open)

export const changeOptionLabel =
  (editorId: string, options: SelectOption[], index: number, label: string): AppThunk<SelectOption[] | undefined> =>
  (_dispatch, getState) => {
    const editor = selectOptionsEditor(getState(), editorId);
    if (!editor) return undefined;
    const { editableOptions } = splitBlankOption(options);
    return withBlank(
      options,
      editableOptions.map((option, i) => {
        if (i !== index) return option;
        // New answers are saved as their text (unless given their own value); existing ones keep theirs
        const id = editor.ids[index];
        const keepsValue = editor.existingIds.includes(id) || editor.customValueIds.includes(id);
        return keepsValue ? { ...option, label } : { value: label.trim(), label };
      }),
    );
  };

export const changeOptionValue =
  (editorId: string, options: SelectOption[], index: number, value: string): AppThunk<SelectOption[] | undefined> =>
  (dispatch, getState) => {
    const editor = selectOptionsEditor(getState(), editorId);
    if (!editor) return undefined;
    const id = editor.ids[index];
    if (!editor.customValueIds.includes(id)) {
      dispatch(optionsEditorChanged({ editorId, changes: { customValueIds: [...editor.customValueIds, id] } }));
    }
    const { editableOptions } = splitBlankOption(options);
    return withBlank(
      options,
      editableOptions.map((option, i) => (i === index ? { ...option, value } : option)),
    );
  };

export const removeOption =
  (editorId: string, options: SelectOption[], index: number): AppThunk<SelectOption[] | undefined> =>
  (dispatch, getState) => {
    const editor = selectOptionsEditor(getState(), editorId);
    if (!editor) return undefined;
    dispatch(optionsEditorChanged({ editorId, changes: { ids: editor.ids.filter((_, i) => i !== index) } }));
    const { editableOptions } = splitBlankOption(options);
    return withBlank(
      options,
      editableOptions.filter((_, i) => i !== index),
    );
  };

export const addOptions =
  (editorId: string, options: SelectOption[], added: SelectOption[]): AppThunk<SelectOption[] | undefined> =>
  (dispatch, getState) => {
    const editor = selectOptionsEditor(getState(), editorId);
    if (!editor) return undefined;
    const addedIds = added.map(newOptionId);
    // Answers pasted with their own saved value keep it when their text is edited
    const custom = addedIds.filter((_, i) => String(added[i].value) !== String(added[i].label).trim());
    dispatch(
      optionsEditorChanged({
        editorId,
        changes: {
          ids: [...editor.ids, ...addedIds],
          ...(custom.length > 0 ? { customValueIds: [...editor.customValueIds, ...custom], showValues: true } : {}),
        },
      }),
    );
    return withBlank(options, [...splitBlankOption(options).editableOptions, ...added]);
  };

// What's pasted, then the box closes
export const addPastedOptions =
  (editorId: string, options: SelectOption[]): AppThunk<SelectOption[] | undefined> =>
  (dispatch, getState) => {
    const added = parsePastedAnswers(selectOptionsEditor(getState(), editorId)?.bulkText ?? '');
    const next = added.length ? dispatch(addOptions(editorId, options, added)) : undefined;
    dispatch(bulkTextChanged(editorId, undefined));
    return next;
  };

export const moveOption =
  (editorId: string, options: SelectOption[], activeId: string, overId: string): AppThunk<SelectOption[] | undefined> =>
  (dispatch, getState) => {
    const editor = selectOptionsEditor(getState(), editorId);
    if (!editor) return undefined;
    const oldIndex = editor.ids.indexOf(activeId);
    const newIndex = editor.ids.indexOf(overId);
    const move = <T>(list: T[]) => {
      const moved = [...list];
      moved.splice(newIndex, 0, ...moved.splice(oldIndex, 1));
      return moved;
    };
    dispatch(optionsEditorChanged({ editorId, changes: { ids: move(editor.ids) } }));
    return withBlank(options, move(splitBlankOption(options).editableOptions));
  };
