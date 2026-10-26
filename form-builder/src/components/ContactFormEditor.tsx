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
 * Drag-and-drop editor for one contact form tab. The form is shown in its two Aselo columns;
 * fields can be dragged within and between columns, and clicking one opens its settings.
 *
 * Every change is written straight back to the draft: the tab's JSON file, plus
 * LayoutDefinitions.json when the column split moves.
 */
import { useMemo, useRef, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useDroppable,
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
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import type { ContactTab, DefinitionFileMap } from '../definitions';
import {
  getContactSplitFormAt,
  getForm,
  getReferenceData,
  LAYOUT_FILE,
  splitIntoColumns,
} from '../definitions';
import {
  applyColumnSplit,
  createField,
  detectBlankOptionValue,
  FieldType,
} from '../formEditing';
import { isSameJson } from '../changes';
import type { ValidationIssue } from '../validation';
import { FieldPreview } from './FieldPreview';
import { FieldSettings } from './FieldSettings';
import { AddFieldMenu } from './AddFieldMenu';

type ColumnKey = 'left' | 'right';
const COLUMN_KEYS: ColumnKey[] = ['left', 'right'];

// Editor-only wrapper: a stable id for drag and drop and selection (field names can change)
type Entry = { id: string; item: FormItemJsonDefinition };
type Columns = Record<ColumnKey, Entry[]>;

type Props = {
  tab: ContactTab;
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  issues: ValidationIssue[];
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

let nextEntryId = 0;
const toEntry = (item: FormItemJsonDefinition): Entry => {
  nextEntryId += 1;
  return { id: `field-${nextEntryId}`, item };
};

const noop = () => {};

const FieldCard = ({
  entry,
  referenceData,
  status,
  hasError,
}: {
  entry: Entry;
  referenceData: Record<string, unknown>;
  status?: 'new' | 'edited';
  hasError: boolean;
}) => (
  <>
    <div className="field-card-badges">
      {hasError && <span className="badge badge-error">Needs attention</span>}
      {status === 'new' && <span className="badge badge-new">New</span>}
      {status === 'edited' && <span className="badge badge-edited">Edited</span>}
    </div>
    {/* The preview is just a picture of the field; clicks go to the card */}
    <div className="field-card-preview" aria-hidden="true">
      <FieldPreview item={entry.item} referenceData={referenceData} value="" onChange={noop} />
    </div>
  </>
);

const SortableFieldCard = ({
  entry,
  selected,
  onSelect,
  ...cardProps
}: {
  entry: Entry;
  selected: boolean;
  onSelect: () => void;
  referenceData: Record<string, unknown>;
  status?: 'new' | 'edited';
  hasError: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        'field-card',
        selected ? 'selected' : '',
        isDragging ? 'dragging' : '',
        cardProps.hasError ? 'has-error' : '',
      ].join(' ')}
      onClick={onSelect}
      {...attributes}
      {...listeners}
      aria-label={`${entry.item.label || entry.item.name}. Click to edit, or drag to move.`}
    >
      <FieldCard entry={entry} {...cardProps} />
    </div>
  );
};

const Column = ({ id, children }: { id: ColumnKey; children: React.ReactNode }) => {
  // Lets fields be dropped into an empty column
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="editor-column">
      {children}
    </div>
  );
};

export const ContactFormEditor = ({
  tab,
  draftFiles,
  originalFiles,
  staffMode,
  issues,
  onChangeFiles,
}: Props) => {
  const originalForm = useMemo(
    () => getForm(originalFiles, tab.filePath) ?? [],
    [originalFiles, tab.filePath],
  );
  const originalByName = useMemo(
    () => new Map(originalForm.map((item) => [item.name, item])),
    [originalForm],
  );
  const hadExplicitSplit = getContactSplitFormAt(originalFiles, tab) !== undefined;
  const referenceData = getReferenceData(draftFiles);
  const blankOptionValue = useMemo(
    () => detectBlankOptionValue([originalForm]),
    [originalForm],
  );

  // The editor owns the column layout while it's open; it's built once from the draft
  const [columns, setColumns] = useState<Columns>(() => {
    const form = getForm(draftFiles, tab.filePath) ?? [];
    const [left, right] = splitIntoColumns(form, getContactSplitFormAt(draftFiles, tab));
    return { left: left.map(toEntry), right: right.map(toEntry) };
  });
  const [selectedId, setSelectedId] = useState<string>();
  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const [addingTo, setAddingTo] = useState<ColumnKey>();
  const columnsBeforeDrag = useRef<Columns>();

  const allEntries = [...columns.left, ...columns.right];
  const selectedEntry = allEntries.find((entry) => entry.id === selectedId);
  const activeEntry = allEntries.find((entry) => entry.id === activeId);
  const fieldsWithErrors = new Set(
    issues.filter((issue) => issue.severity === 'error').map((issue) => issue.fieldName),
  );

  const statusOf = (entry: Entry): 'new' | 'edited' | undefined => {
    const original = originalByName.get(entry.item.name);
    if (!original) return 'new';
    return isSameJson(original, entry.item) ? undefined : 'edited';
  };

  // Writes the columns back to the draft files
  const commit = (next: Columns) => {
    setColumns(next);
    const items = [...next.left, ...next.right].map((entry) => entry.item);
    onChangeFiles((files) => {
      const currentLayout = (files[LAYOUT_FILE] ?? {}) as Record<string, unknown>;
      const layout = applyColumnSplit(
        currentLayout,
        ['contact', tab.layoutKey],
        next.left.length,
        items.length,
        hadExplicitSplit,
      );
      const layoutChanged = !isSameJson(layout, currentLayout);
      return {
        ...files,
        [tab.filePath]: items,
        ...(layoutChanged ? { [LAYOUT_FILE]: layout } : {}),
      };
    });
  };

  const findColumn = (id: UniqueIdentifier): ColumnKey | undefined => {
    if (id === 'left' || id === 'right') return id;
    return COLUMN_KEYS.find((key) => columns[key].some((entry) => entry.id === id));
  };

  const sensors = useSensors(
    // A small movement threshold so a plain click still selects the field
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    columnsBeforeDrag.current = columns;
    setActiveId(active.id);
  };

  // Moving into the other column happens while dragging, so the preview updates live
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = findColumn(active.id);
    const to = findColumn(over.id);
    if (!from || !to || from === to) return;
    setColumns((current) => {
      const moving = current[from].find((entry) => entry.id === active.id);
      if (!moving) return current;
      const overIndex = current[to].findIndex((entry) => entry.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : current[to].length;
      return {
        ...current,
        [from]: current[from].filter((entry) => entry.id !== active.id),
        [to]: [...current[to].slice(0, insertAt), moving, ...current[to].slice(insertAt)],
      };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(undefined);
    const column = findColumn(active.id);
    let next = columns;
    if (over && column && findColumn(over.id) === column) {
      const oldIndex = columns[column].findIndex((entry) => entry.id === active.id);
      const overIndex = columns[column].findIndex((entry) => entry.id === over.id);
      const newIndex = overIndex >= 0 ? overIndex : columns[column].length - 1;
      if (oldIndex !== newIndex) {
        next = { ...columns, [column]: arrayMove(columns[column], oldIndex, newIndex) };
      }
    }
    commit(next);
  };

  const handleDragCancel = () => {
    setActiveId(undefined);
    if (columnsBeforeDrag.current) setColumns(columnsBeforeDrag.current);
  };

  const mapEntry = (id: string, update: (entry: Entry) => Entry | undefined): Columns => ({
    left: columns.left.flatMap((entry) => (entry.id === id ? (update(entry) ?? []) : [entry])),
    right: columns.right.flatMap((entry) => (entry.id === id ? (update(entry) ?? []) : [entry])),
  });

  const addField = (column: ColumnKey, type: FieldType) => {
    const entry = toEntry(
      createField(
        type,
        allEntries.map((existing) => existing.item.name),
        blankOptionValue,
      ),
    );
    commit({ ...columns, [column]: [...columns[column], entry] });
    setAddingTo(undefined);
    setSelectedId(entry.id);
  };

  const formIsEmpty = allEntries.length === 0;

  return (
    <div className="editor">
      <section className="panel editor-canvas">
        <h2>
          {tab.title} <span className="muted count">{allEntries.length} fields</span>
        </h2>
        <p className="muted editor-hint">
          Click a field to change it. Drag fields to reorder them or move them to the other
          column.
        </p>
        {formIsEmpty && (
          <p className="muted">
            This form has no fields, so counselors don't see this tab. Add a field to start using
            it.
          </p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="two-columns">
            {COLUMN_KEYS.map((columnKey) => (
              <SortableContext
                key={columnKey}
                id={columnKey}
                items={columns[columnKey].map((entry) => entry.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column id={columnKey}>
                  {columns[columnKey].map((entry) => (
                    <SortableFieldCard
                      key={entry.id}
                      entry={entry}
                      selected={entry.id === selectedId}
                      onSelect={() => setSelectedId(entry.id)}
                      referenceData={referenceData}
                      status={statusOf(entry)}
                      hasError={fieldsWithErrors.has(entry.item.name)}
                    />
                  ))}
                  {addingTo === columnKey ? (
                    <AddFieldMenu
                      onAdd={(type) => addField(columnKey, type)}
                      onCancel={() => setAddingTo(undefined)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="add-field-button"
                      onClick={() => setAddingTo(columnKey)}
                    >
                      + Add a field
                    </button>
                  )}
                </Column>
              </SortableContext>
            ))}
          </div>
          <DragOverlay>
            {activeEntry && (
              <div className="field-card drag-overlay">
                <FieldCard
                  entry={activeEntry}
                  referenceData={referenceData}
                  status={statusOf(activeEntry)}
                  hasError={false}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </section>

      <aside className="panel editor-settings">
        {selectedEntry ? (
          <FieldSettings
            // Remount per field (and type) so local state like option ids starts fresh
            key={`${selectedEntry.id}-${selectedEntry.item.type}`}
            tab={tab}
            item={selectedEntry.item}
            originalItem={originalByName.get(selectedEntry.item.name)}
            otherNames={allEntries
              .filter((entry) => entry.id !== selectedEntry.id)
              .map((entry) => entry.item.name)}
            draftFiles={draftFiles}
            staffMode={staffMode}
            blankOptionValue={blankOptionValue}
            issues={issues.filter((issue) => issue.fieldName === selectedEntry.item.name)}
            onChange={(item) => commit(mapEntry(selectedEntry.id, (entry) => ({ ...entry, item })))}
            onRemove={() => {
              commit(mapEntry(selectedEntry.id, () => undefined));
              setSelectedId(undefined);
            }}
            onClose={() => setSelectedId(undefined)}
          />
        ) : (
          <div className="settings-empty">
            <h3>Field settings</h3>
            <p className="muted">Click any field on the left to change its question, answers or
              whether it's required.</p>
            <p className="muted">
              Changes are saved as a draft in this browser automatically. Nothing reaches Aselo
              until you export and the Aselo team applies it.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};
