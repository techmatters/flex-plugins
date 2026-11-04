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
 * Edits the answers of a dropdown or multiple choice list.
 *
 * Each answer has a label (what counselors see) and a value (what's saved and reported). They're
 * usually the same, but don't have to be (e.g. "0" saved as "00").
 * - New answers are saved as their label, unless someone sets a different saved value.
 * - Answers that already existed keep their saved value when relabelled, so past contacts and
 *   reports stay consistent. Only Aselo staff can change it.
 */
import { useEffect, useId } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SelectOption } from '@hrm-form-definitions/formDefinition/types';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  addOptions,
  addPastedOptions,
  bulkTextChanged,
  changeOptionLabel,
  changeOptionValue,
  moveOption,
  openOptionsEditor,
  optionsEditorClosed,
  removeOption,
  selectOptionsEditor,
  showValuesToggled,
  splitBlankOption,
} from './optionsEditorSlice';

export { parsePastedAnswers } from './optionsEditorSlice';

type Props = {
  options: SelectOption[];
  // Values of the answers as they were before editing; these values are never changed
  originalValues: Set<string>;
  staffMode: boolean;
  onChange: (options: SelectOption[]) => void;
};

const OptionRow = ({
  id,
  option,
  isExisting,
  staffMode,
  showValues,
  onLabelChange,
  onValueChange,
  onRemove,
}: {
  id: string;
  option: SelectOption;
  isExisting: boolean;
  staffMode: boolean;
  showValues: boolean;
  onLabelChange: (label: string) => void;
  onValueChange: (value: string) => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  // Saved values of existing answers are what past contacts hold: only Aselo staff change them
  const canEditValue = !isExisting || staffMode;
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="option-row">
      <button type="button" className="drag-handle" aria-label="Drag to reorder" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <div className="option-inputs">
        <input
          type="text"
          value={option.label}
          aria-label="Answer"
          placeholder="Type an answer"
          onChange={e => onLabelChange(e.target.value)}
        />
        {showValues && (
          <label className="option-value">
            <span className="field-hint">Saved as</span>
            {canEditValue ? (
              <input
                type="text"
                value={String(option.value)}
                aria-label="Saved value"
                onChange={e => onValueChange(e.target.value)}
              />
            ) : (
              <span className="option-value-locked">“{String(option.value)}”</span>
            )}
          </label>
        )}
      </div>
      <button type="button" className="icon-button" aria-label="Remove answer" onClick={onRemove}>
        ×
      </button>
    </li>
  );
};

export const OptionsEditor = ({ options, originalValues, staffMode, onChange }: Props) => {
  const dispatch = useAppDispatch();
  // Each answers editor on screen has its own state in the store (see optionsEditorSlice.ts)
  const editorId = useId();
  const editor = useAppSelector(state => selectOptionsEditor(state, editorId));
  const { blankOption, editableOptions } = splitBlankOption(options);

  // Starts from the answers it opens with, and is forgotten when it goes away
  useEffect(() => {
    dispatch(openOptionsEditor(editorId, options, originalValues));
    return () => {
      dispatch(optionsEditorClosed(editorId));
    };
  }, [dispatch, editorId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!editor) return null;
  const { ids, existingIds, showValues, bulkText } = editor;

  const emit = (next: SelectOption[] | undefined) => {
    if (next) onChange(next);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    emit(dispatch(moveOption(editorId, options, String(active.id), String(over.id))));
  };

  return (
    <div className="options-editor">
      {blankOption && (
        <p className="field-hint">
          The dropdown starts empty until the counselor picks an answer
          {String(blankOption.value) === ''
            ? ' (it has to be answered).'
            : ` (if it's left empty, it's saved as “${String(blankOption.value)}”).`}
        </p>
      )}
      <div className="option-actions">
        <button type="button" className="link-button" onClick={() => dispatch(showValuesToggled(editorId))}>
          {showValues ? 'Hide saved values' : 'Show saved values'}
        </button>
        {showValues && (
          <span className="field-hint">
            Each answer is saved and reported as its saved value, usually the same as its text.
            {staffMode
              ? ' Past contacts and reports use the saved values of existing answers: change them only if you mean to.'
              : ' Existing answers keep theirs.'}
          </span>
        )}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="option-list">
            {editableOptions.map((option, index) => (
              <OptionRow
                key={ids[index]}
                id={ids[index]}
                option={option}
                isExisting={existingIds.includes(ids[index])}
                staffMode={staffMode}
                showValues={showValues}
                onLabelChange={label => emit(dispatch(changeOptionLabel(editorId, options, index, label)))}
                onValueChange={value => emit(dispatch(changeOptionValue(editorId, options, index, value)))}
                onRemove={() => emit(dispatch(removeOption(editorId, options, index)))}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {bulkText === undefined ? (
        <div className="option-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => emit(dispatch(addOptions(editorId, options, [{ value: '', label: '' }])))}
          >
            + Add an answer
          </button>
          <button type="button" className="link-button" onClick={() => dispatch(bulkTextChanged(editorId, ''))}>
            Paste several at once
          </button>
        </div>
      ) : (
        <div className="bulk-add">
          <label className="field">
            <span className="field-label">Answers to add</span>
            <span className="field-hint">
              One answer per line. When the saved value differs from the text, write the saved value first, then a
              semicolon, then the text: <code>00;0</code>. You can also paste two columns from a spreadsheet: saved
              value, then text.
            </span>
            <textarea
              rows={6}
              value={bulkText}
              autoFocus
              onChange={e => dispatch(bulkTextChanged(editorId, e.target.value))}
              placeholder={'Spanish\nFrench\n00;0'}
            />
          </label>
          <div className="option-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => emit(dispatch(addPastedOptions(editorId, options)))}
            >
              Add these answers
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => dispatch(bulkTextChanged(editorId, undefined))}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
