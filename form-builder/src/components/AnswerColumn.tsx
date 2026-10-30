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
 * One level of a linked dropdown in the column browser: the answers under whatever is
 * selected in the column to its left. Long lists are searchable and only the first few
 * hundred matches are drawn, so huge lists (tens of thousands of answers) stay fast.
 */
import { useState } from 'react';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnswerNode, countDescendants, newAnswerNode } from '../linkedDropdowns';

const MAX_ROWS_SHOWN = 300;

type Props = {
  label: string;
  // Label of the level to the left, used when nothing is selected there yet
  previousLabel?: string;
  // undefined when nothing is selected in the column to the left
  answers?: AnswerNode[];
  selectedId?: string;
  hasLevelBelow: boolean;
  onSelect: (id: string) => void;
  onChange: (answers: AnswerNode[]) => void;
};

const AnswerRow = ({
  answer,
  selected,
  hasLevelBelow,
  draggable,
  onSelect,
  onRename,
  onRemove,
}: {
  answer: AnswerNode;
  selected: boolean;
  hasLevelBelow: boolean;
  draggable: boolean;
  onSelect: () => void;
  onRename: (label: string) => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: answer.id,
    disabled: !draggable,
  });
  const [editing, setEditing] = useState<string>();

  const finishEditing = () => {
    if (editing !== undefined && editing.trim() && editing !== answer.label) onRename(editing);
    setEditing(undefined);
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={selected ? 'answer-row selected' : 'answer-row'}
    >
      {draggable && (
        <button
          type="button"
          className="drag-handle"
          aria-label={`Drag to reorder ${answer.label}`}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      )}
      {editing === undefined ? (
        <button
          type="button"
          className="answer-label"
          aria-label={
            hasLevelBelow ? `${answer.label}, ${answer.children.length} below` : answer.label
          }
          aria-pressed={selected}
          onClick={onSelect}
        >
          <span>{answer.label}</span>
          {hasLevelBelow && (
            <span className="answer-child-count" aria-hidden="true">
              {answer.children.length} ›
            </span>
          )}
        </button>
      ) : (
        <input
          type="text"
          className="answer-edit"
          value={editing}
          autoFocus
          aria-label="Answer"
          onChange={(e) => setEditing(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') finishEditing();
            if (e.key === 'Escape') setEditing(undefined);
          }}
        />
      )}
      <button
        type="button"
        className="icon-button"
        aria-label={`Rename ${answer.label}`}
        onClick={() => setEditing(answer.label)}
      >
        ✎
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={`Remove ${answer.label}`}
        onClick={onRemove}
      >
        ×
      </button>
    </li>
  );
};

export const AnswerColumn = ({
  label,
  previousLabel,
  answers,
  selectedId,
  hasLevelBelow,
  onSelect,
  onChange,
}: Props) => {
  const [search, setSearch] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [bulkText, setBulkText] = useState<string>();
  const [message, setMessage] = useState<string>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!answers) {
    return (
      <section className="answer-column" aria-label={label}>
        <header className="answer-column-header">
          <strong>{label}</strong>
        </header>
        <p className="muted answer-column-empty">
          Choose a {previousLabel?.toLowerCase()} on the left to see its {label.toLowerCase()}{' '}
          answers.
        </p>
      </section>
    );
  }

  const query = search.trim().toLowerCase();
  const matching = query
    ? answers.filter((answer) => answer.label.toLowerCase().includes(query))
    : answers;
  const shown = matching.slice(0, MAX_ROWS_SHOWN);
  // Reordering a filtered or cut-down list would be confusing, so drag only on the full list
  const draggable = !query && answers.length <= MAX_ROWS_SHOWN;

  const addLabels = (labels: string[]) => {
    const existing = new Set(answers.map((answer) => answer.label.trim().toLowerCase()));
    const toAdd: string[] = [];
    const skipped: string[] = [];
    labels
      .map((text) => text.trim())
      .filter(Boolean)
      .forEach((text) => {
        if (existing.has(text.toLowerCase())) skipped.push(text);
        else {
          existing.add(text.toLowerCase());
          toAdd.push(text);
        }
      });
    if (toAdd.length) onChange([...answers, ...toAdd.map((text) => newAnswerNode(text))]);
    setMessage(skipped.length ? `Already in the list: ${skipped.slice(0, 3).join(', ')}` : undefined);
  };

  const rename = (id: string, text: string) =>
    onChange(
      answers.map((answer) => {
        if (answer.id !== id) return answer;
        // Answers that already existed keep their saved value, so past contacts still match
        return answer.existing
          ? { ...answer, label: text }
          : { ...answer, label: text, value: text.trim() };
      }),
    );

  const remove = (answer: AnswerNode) => {
    const below = countDescendants(answer);
    if (
      below > 0 &&
      !window.confirm(`Remove “${answer.label}” and the ${below} answer(s) under it?`)
    ) {
      return;
    }
    onChange(answers.filter((other) => other.id !== answer.id));
  };

  const sortAlphabetically = () =>
    onChange(
      [...answers].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
    );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = answers.findIndex((answer) => answer.id === active.id);
    const newIndex = answers.findIndex((answer) => answer.id === over.id);
    onChange(arrayMove(answers, oldIndex, newIndex));
  };

  return (
    <section className="answer-column" aria-label={label}>
      <header className="answer-column-header">
        <strong>{label}</strong>
        <span className="muted">{answers.length.toLocaleString()}</span>
        {answers.length > 1 && (
          <button type="button" className="link-button" onClick={sortAlphabetically}>
            Sort A–Z
          </button>
        )}
      </header>

      {answers.length > 10 && (
        <input
          type="search"
          className="answer-search"
          placeholder={`Search ${label.toLowerCase()}`}
          aria-label={`Search ${label}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={shown.map((answer) => answer.id)} strategy={verticalListSortingStrategy}>
          <ul className="answer-list">
            {shown.map((answer) => (
              <AnswerRow
                key={answer.id}
                answer={answer}
                selected={answer.id === selectedId}
                hasLevelBelow={hasLevelBelow}
                draggable={draggable}
                onSelect={() => onSelect(answer.id)}
                onRename={(text) => rename(answer.id, text)}
                onRemove={() => remove(answer)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {matching.length > shown.length && (
        <p className="field-hint">
          Showing {shown.length} of {matching.length.toLocaleString()}. Search to find the others.
        </p>
      )}
      {query && matching.length === 0 && <p className="field-hint">No answers match “{search}”.</p>}

      {bulkText === undefined ? (
        <form
          className="answer-add"
          onSubmit={(e) => {
            e.preventDefault();
            addLabels([newLabel]);
            setNewLabel('');
          }}
        >
          <input
            type="text"
            value={newLabel}
            placeholder={`Add a ${label.toLowerCase()}`}
            aria-label={`Add a ${label}`}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <button type="submit" className="secondary-button" disabled={!newLabel.trim()}>
            Add
          </button>
        </form>
      ) : (
        <div className="bulk-add">
          <textarea
            rows={5}
            value={bulkText}
            autoFocus
            aria-label={`${label} answers, one per line`}
            placeholder="One answer per line"
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="option-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                addLabels(bulkText.split('\n'));
                setBulkText(undefined);
              }}
            >
              Add these
            </button>
            <button type="button" className="link-button" onClick={() => setBulkText(undefined)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {bulkText === undefined && (
        <button type="button" className="link-button answer-paste" onClick={() => setBulkText('')}>
          Paste several at once
        </button>
      )}
      {message && <p className="field-hint">{message}</p>}
    </section>
  );
};
