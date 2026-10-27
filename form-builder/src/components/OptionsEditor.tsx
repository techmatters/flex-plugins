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
import { useState } from 'react';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SelectOption } from '@hrm-form-definitions/formDefinition/types';
import { isBlankOption } from '../formEditing';

/**
 * Answers pasted in one go, one per line. A line can be "saved value;text" when the two differ
 * ("00;0"), or two spreadsheet columns in the same order; otherwise the text is also the value.
 */
export const parsePastedAnswers = (text: string): SelectOption[] =>
  text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const separator = line.includes('\t') ? '\t' : ';';
      const [first, ...rest] = line.split(separator);
      const label = rest.join(separator).trim();
      return label ? { value: first.trim(), label } : { value: first.trim(), label: first.trim() };
    })
    .filter((option) => option.label);

type Props = {
  options: SelectOption[];
  // Values of the answers as they were before editing; these values are never changed
  originalValues: Set<string>;
  staffMode: boolean;
  onChange: (options: SelectOption[]) => void;
};

let nextOptionId = 0;
const newOptionId = () => {
  nextOptionId += 1;
  return `option-${nextOptionId}`;
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
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="option-row"
    >
      <button
        type="button"
        className="drag-handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="option-inputs">
        <input
          type="text"
          value={option.label}
          aria-label="Answer"
          placeholder="Type an answer"
          onChange={(e) => onLabelChange(e.target.value)}
        />
        {showValues && (
          <label className="option-value">
            <span className="field-hint">Saved as</span>
            {canEditValue ? (
              <input
                type="text"
                value={String(option.value)}
                aria-label="Saved value"
                onChange={(e) => onValueChange(e.target.value)}
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
  const hasBlankFirst = options.length > 0 && isBlankOption(options[0], 0);
  const blankOption = hasBlankFirst ? options[0] : undefined;
  const editableOptions = hasBlankFirst ? options.slice(1) : options;

  // Stable ids for drag and drop, kept in step with editableOptions
  const [ids, setIds] = useState(() => editableOptions.map(newOptionId));
  // Rows that were already saved answers when the editor opened (decided once per row)
  const [existingIds] = useState(
    () =>
      new Set(
        ids.filter((_, index) => originalValues.has(String(editableOptions[index].value))),
      ),
  );
  // New answers whose saved value was set on purpose, so it no longer follows their text
  const [customValueIds, setCustomValueIds] = useState<Set<string>>(() => new Set());
  // Shown from the start when any answer is saved under something other than its text
  const [showValues, setShowValues] = useState(() =>
    editableOptions.some((option) => String(option.value) !== String(option.label).trim()),
  );
  const [bulkText, setBulkText] = useState<string>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const emit = (nextEditable: SelectOption[]) =>
    onChange(blankOption ? [blankOption, ...nextEditable] : nextEditable);

  const updateLabel = (index: number, label: string) =>
    emit(
      editableOptions.map((option, i) => {
        if (i !== index) return option;
        // New answers are saved as their text (unless given their own value); existing ones keep theirs
        const keepsValue = existingIds.has(ids[index]) || customValueIds.has(ids[index]);
        return keepsValue ? { ...option, label } : { value: label.trim(), label };
      }),
    );

  const updateValue = (index: number, value: string) => {
    setCustomValueIds(new Set(customValueIds).add(ids[index]));
    emit(editableOptions.map((option, i) => (i === index ? { ...option, value } : option)));
  };

  const remove = (index: number) => {
    setIds(ids.filter((_, i) => i !== index));
    emit(editableOptions.filter((_, i) => i !== index));
  };

  const addOptions = (added: SelectOption[]) => {
    const addedIds = added.map(newOptionId);
    setIds([...ids, ...addedIds]);
    // Answers pasted with their own saved value keep it when their text is edited
    const custom = addedIds.filter((_, i) => String(added[i].value) !== String(added[i].label).trim());
    if (custom.length > 0) {
      setCustomValueIds(new Set([...customValueIds, ...custom]));
      setShowValues(true);
    }
    emit([...editableOptions, ...added]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    setIds(arrayMove(ids, oldIndex, newIndex));
    emit(arrayMove(editableOptions, oldIndex, newIndex));
  };

  const addBulk = () => {
    const added = parsePastedAnswers(bulkText ?? '');
    if (added.length) addOptions(added);
    setBulkText(undefined);
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
        <button type="button" className="link-button" onClick={() => setShowValues(!showValues)}>
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
                isExisting={existingIds.has(ids[index])}
                staffMode={staffMode}
                showValues={showValues}
                onLabelChange={(label) => updateLabel(index, label)}
                onValueChange={(value) => updateValue(index, value)}
                onRemove={() => remove(index)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {bulkText === undefined ? (
        <div className="option-actions">
          <button type="button" className="secondary-button" onClick={() => addOptions([{ value: '', label: '' }])}>
            + Add an answer
          </button>
          <button type="button" className="link-button" onClick={() => setBulkText('')}>
            Paste several at once
          </button>
        </div>
      ) : (
        <div className="bulk-add">
          <label className="field">
            <span className="field-label">Answers to add</span>
            <span className="field-hint">
              One answer per line. When the saved value differs from the text, write the saved value
              first, then a semicolon, then the text: <code>00;0</code>. You can also paste two
              columns from a spreadsheet: saved value, then text.
            </span>
            <textarea
              rows={6}
              value={bulkText}
              autoFocus
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'Spanish\nFrench\n00;0'}
            />
          </label>
          <div className="option-actions">
            <button type="button" className="secondary-button" onClick={addBulk}>
              Add these answers
            </button>
            <button type="button" className="link-button" onClick={() => setBulkText(undefined)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
