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
 * A list of rows that can be reordered by dragging their handle (or with the keyboard).
 * Rows carry stable ids so they keep their identity while being edited and moved.
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

export type Row<T> = { id: string; value: T };

let nextRowId = 0;
export const toRows = <T,>(values: T[]): Row<T>[] =>
  values.map((value) => {
    nextRowId += 1;
    return { id: `row-${nextRowId}`, value };
  });

/**
 * Rows kept in step with a list in the draft: edits go through `commit`, which updates the
 * rows and writes the plain values back.
 */
export const useRows = <T,>(initial: T[], write: (values: T[]) => void) => {
  const [rows, setRows] = useState(() => toRows(initial));
  const commit = (next: Row<T>[]) => {
    setRows(next);
    write(next.map((row) => row.value));
  };
  return { rows, commit };
};

const SortableRow = ({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="sortable-row"
    >
      <button
        type="button"
        className="drag-handle"
        aria-label={`Drag to reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="sortable-row-content">{children}</div>
    </li>
  );
};

type Props<T> = {
  rows: Row<T>[];
  labelOf: (value: T) => string;
  onReorder: (rows: Row<T>[]) => void;
  renderRow: (row: Row<T>, index: number) => React.ReactNode;
};

export const SortableRows = <T,>({ rows, labelOf, onReorder, renderRow }: Props<T>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((row) => row.id === active.id);
    const newIndex = rows.findIndex((row) => row.id === over.id);
    onReorder(arrayMove(rows, oldIndex, newIndex));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
        <ul className="sortable-rows">
          {rows.map((row, index) => (
            <SortableRow key={row.id} id={row.id} label={labelOf(row.value)}>
              {renderRow(row, index)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
