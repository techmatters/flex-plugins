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
 * Each answer has a label (what counselors see) and a value (what's saved and reported).
 * New answers are saved as their label. Answers that already existed keep their saved value
 * when relabelled, so past contacts and reports stay consistent.
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
  onLabelChange,
  onRemove,
}: {
  id: string;
  option: SelectOption;
  isExisting: boolean;
  staffMode: boolean;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const showSavedValue = staffMode && isExisting && String(option.value) !== option.label;
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
        {showSavedValue && <span className="field-hint">Saved as “{String(option.value)}”</span>}
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
        // New answers are saved as their text; existing ones keep their saved value
        return existingIds.has(ids[index]) ? { ...option, label } : { value: label.trim(), label };
      }),
    );

  const remove = (index: number) => {
    setIds(ids.filter((_, i) => i !== index));
    emit(editableOptions.filter((_, i) => i !== index));
  };

  const addOptions = (labels: string[]) => {
    setIds([...ids, ...labels.map(newOptionId)]);
    emit([...editableOptions, ...labels.map((label) => ({ value: label.trim(), label }))]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    setIds(arrayMove(ids, oldIndex, newIndex));
    emit(arrayMove(editableOptions, oldIndex, newIndex));
  };

  const addBulk = () => {
    const labels = (bulkText ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (labels.length) addOptions(labels);
    setBulkText(undefined);
  };

  return (
    <div className="options-editor">
      {blankOption && (
        <p className="field-hint">
          The dropdown starts empty until the counselor picks an answer.
        </p>
      )}
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
                onLabelChange={(label) => updateLabel(index, label)}
                onRemove={() => remove(index)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {bulkText === undefined ? (
        <div className="option-actions">
          <button type="button" className="secondary-button" onClick={() => addOptions([''])}>
            + Add an answer
          </button>
          <button type="button" className="link-button" onClick={() => setBulkText('')}>
            Paste several at once
          </button>
        </div>
      ) : (
        <div className="bulk-add">
          <label className="field">
            <span className="field-label">One answer per line</span>
            <textarea
              rows={6}
              value={bulkText}
              autoFocus
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'Spanish\nFrench\nPortuguese'}
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
