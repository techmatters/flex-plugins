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
 *
 * The answers and what's typed in the column live in linkedDropdownsSlice.ts.
 */
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

import { useAppDispatch, useAppSelector } from '../app/store';
import { AnswerNode, countDescendants } from '../linkedDropdowns/linkedDropdowns';
import {
  addPastedAnswers,
  addTypedAnswer,
  answerSelected,
  answersAtLevel,
  ColumnInputs,
  columnInputsChanged,
  finishRenaming,
  moveAnswer,
  removeAnswer,
  renamingChanged,
  selectAnswersEditor,
  sortAnswers,
} from '../linkedDropdowns/linkedDropdownsSlice';

const MAX_ROWS_SHOWN = 300;

type Props = {
  // 0 for the top level
  level: number;
  label: string;
  // Label of the level to the left, used when nothing is selected there yet
  previousLabel?: string;
  hasLevelBelow: boolean;
};

const AnswerRow = ({
  answer,
  selected,
  hasLevelBelow,
  draggable,
  editing,
  onSelect,
  onStartRename,
  onEdit,
  onFinishEditing,
  onCancelEditing,
  onRemove,
}: {
  answer: AnswerNode;
  selected: boolean;
  hasLevelBelow: boolean;
  draggable: boolean;
  // The new name being typed, while it's being renamed
  editing?: string;
  onSelect: () => void;
  onStartRename: () => void;
  onEdit: (text: string) => void;
  onFinishEditing: () => void;
  onCancelEditing: () => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: answer.id,
    disabled: !draggable,
  });

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
          // eslint-disable-next-line react/jsx-props-no-spreading -- dnd-kit's drag handle props
          {...attributes}
          // eslint-disable-next-line react/jsx-props-no-spreading -- dnd-kit's drag handle props
          {...listeners}
        >
          ⋮⋮
        </button>
      )}
      {editing === undefined ? (
        <button
          type="button"
          className="answer-label"
          aria-label={hasLevelBelow ? `${answer.label}, ${answer.children.length} below` : answer.label}
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
          // eslint-disable-next-line jsx-a11y/no-autofocus -- it appears when the person asks for it, ready to type in
          autoFocus
          aria-label="Answer"
          onChange={e => onEdit(e.target.value)}
          onBlur={onFinishEditing}
          onKeyDown={e => {
            if (e.key === 'Enter') onFinishEditing();
            if (e.key === 'Escape') onCancelEditing();
          }}
        />
      )}
      <button type="button" className="icon-button" aria-label={`Rename ${answer.label}`} onClick={onStartRename}>
        ✎
      </button>
      <button type="button" className="icon-button" aria-label={`Remove ${answer.label}`} onClick={onRemove}>
        ×
      </button>
    </li>
  );
};

export const AnswerColumn = ({ level, label, previousLabel, hasLevelBelow }: Props) => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectAnswersEditor);
  // undefined when nothing is selected in the column to the left
  const answers = editor && answersAtLevel(editor, level);
  const selectedId = editor?.selected[level];
  const renaming = editor?.renaming;
  const { search, newLabel, bulkText, message } = editor?.columns[level] ?? { search: '', newLabel: '' };
  const setInputs = (inputs: Partial<ColumnInputs>) => dispatch(columnInputsChanged({ level, inputs }));

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
          Choose a {previousLabel?.toLowerCase()} on the left to see its {label.toLowerCase()} answers.
        </p>
      </section>
    );
  }

  const query = search.trim().toLowerCase();
  const matching = query ? answers.filter(answer => answer.label.toLowerCase().includes(query)) : answers;
  const shown = matching.slice(0, MAX_ROWS_SHOWN);
  // Reordering a filtered or cut-down list would be confusing, so drag only on the full list
  const draggable = !query && answers.length <= MAX_ROWS_SHOWN;

  const remove = (answer: AnswerNode) => {
    const below = countDescendants(answer);
    if (below > 0 && !window.confirm(`Remove “${answer.label}” and the ${below} answer(s) under it?`)) {
      return;
    }
    dispatch(removeAnswer(level, answer.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    dispatch(moveAnswer(level, String(active.id), String(over.id)));
  };

  return (
    <section className="answer-column" aria-label={label}>
      <header className="answer-column-header">
        <strong>{label}</strong>
        <span className="muted">{answers.length.toLocaleString()}</span>
        {answers.length > 1 && (
          <button type="button" className="link-button" onClick={() => dispatch(sortAnswers(level))}>
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
          onChange={e => setInputs({ search: e.target.value })}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={shown.map(answer => answer.id)} strategy={verticalListSortingStrategy}>
          <ul className="answer-list">
            {shown.map(answer => (
              <AnswerRow
                key={answer.id}
                answer={answer}
                selected={answer.id === selectedId}
                hasLevelBelow={hasLevelBelow}
                draggable={draggable}
                editing={renaming?.id === answer.id ? renaming.text : undefined}
                onSelect={() => dispatch(answerSelected({ level, id: answer.id }))}
                onStartRename={() => dispatch(renamingChanged({ id: answer.id, text: answer.label }))}
                onEdit={text => dispatch(renamingChanged({ id: answer.id, text }))}
                onFinishEditing={() => dispatch(finishRenaming(level))}
                onCancelEditing={() => dispatch(renamingChanged(undefined))}
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
          onSubmit={e => {
            e.preventDefault();
            dispatch(addTypedAnswer(level));
          }}
        >
          <input
            type="text"
            value={newLabel}
            placeholder={`Add a ${label.toLowerCase()}`}
            aria-label={`Add a ${label}`}
            onChange={e => setInputs({ newLabel: e.target.value })}
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
            // eslint-disable-next-line jsx-a11y/no-autofocus -- it appears when the person asks for it, ready to type in
            autoFocus
            aria-label={`${label} answers, one per line`}
            placeholder="One answer per line"
            onChange={e => setInputs({ bulkText: e.target.value })}
          />
          <div className="option-actions">
            <button type="button" className="secondary-button" onClick={() => dispatch(addPastedAnswers(level))}>
              Add these
            </button>
            <button type="button" className="link-button" onClick={() => setInputs({ bulkText: undefined })}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {bulkText === undefined && (
        <button type="button" className="link-button answer-paste" onClick={() => setInputs({ bulkText: '' })}>
          Paste several at once
        </button>
      )}
      {message && <p className="field-hint">{message}</p>}
    </section>
  );
};
