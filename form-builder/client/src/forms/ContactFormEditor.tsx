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
 * Drag-and-drop editor for one form: a contact form tab or a case section's form. The form
 * is shown in its two Aselo columns; fields can be dragged within and between columns, and
 * clicking one opens its settings.
 *
 * What's edited and how lives in formEditorSlice.ts: every change is written straight back to
 * the draft (the form's JSON file, plus LayoutDefinitions.json when the column split moves).
 */
import { useEffect } from 'react';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
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
import { type FormTarget, getReferenceData, isContactTab } from '../common/definitions';
import { isSameJson } from '../drafts/changes';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectIssuesByTab, selectWorkspace } from '../workspace/workspaceSlice';
import { useReviewContext } from '../workspace/useReviewContext';
import {
  addField,
  addFieldMenuToggled,
  chainEditorToggled,
  COLUMN_KEYS,
  ColumnKey,
  createChain,
  dragCancelled,
  dragStarted,
  Entry,
  fieldDraggedOver,
  fieldSelected,
  finishDrag,
  issuesKeyOf,
  linkedWizardToggled,
  openFormEditor,
  saveChainAnswers,
  selectFormEditor,
  selectOriginalFieldsByName,
} from './formEditorSlice';
import { FieldPreview } from './FieldPreview';
import { FieldSettings } from './FieldSettings';
import { AddFieldMenu } from './AddFieldMenu';
import { LinkedAnswersEditor } from '../linkedDropdowns/LinkedAnswersEditor';
import { LinkedDropdownsWizard } from '../linkedDropdowns/LinkedDropdownsWizard';
import { ReviewPanel } from '../reviews/ReviewPanel';
import { ApprovalIcon, FlagIcon } from '../reviews/ReviewIcons';
import {
  approvalState,
  fieldFingerprint,
  fieldTargetOf,
  flagKinds,
  formTargetOf,
  SIDES,
  threadsOn,
} from '../reviews/formReviews';

// What a field card shows of its review: each side's approval, and its open flags
type CardReview = {
  approvals: Partial<Record<'helpline' | 'aselo', 'approved' | 'changed'>>;
  flags: ReturnType<typeof flagKinds>;
};

const noop = () => undefined;

const FieldCard = ({
  entry,
  referenceData,
  status,
  hasError,
  review,
}: {
  entry: Entry;
  referenceData: Record<string, unknown>;
  status?: 'new' | 'edited';
  hasError: boolean;
  review?: CardReview;
}) => (
  <>
    <div className="field-card-badges">
      {review && SIDES.map(side => <ApprovalIcon key={side} side={side} state={review.approvals[side]} />)}
      {review?.flags.map(kind => (
        <FlagIcon key={kind} kind={kind} />
      ))}
      {hasError && <span className="badge badge-error">Needs attention</span>}
      {status === 'new' && <span className="badge badge-new">New</span>}
      {status === 'edited' && <span className="badge badge-edited">Edited</span>}
      {entry.item.description && <span className="badge badge-help">Help box</span>}
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
  review?: CardReview;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- dnd-kit's attributes make it a focusable button
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
      // eslint-disable-next-line react/jsx-props-no-spreading -- dnd-kit's drag handle props
      {...attributes}
      // eslint-disable-next-line react/jsx-props-no-spreading -- dnd-kit's drag handle props
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

export const ContactFormEditor = ({ tab }: { tab: FormTarget }) => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const { editorRevision } = useAppSelector(selectWorkspace);
  const issues = useAppSelector(selectIssuesByTab)[issuesKeyOf(tab)] ?? [];
  const originalByName = useAppSelector(selectOriginalFieldsByName);
  const { target, revision, columns, selectedId, drag, addingTo, linkedWizardColumn, editingChain } =
    useAppSelector(selectFormEditor);
  const referenceData = getReferenceData(draftFiles);
  // Reviewing the form (formReviews.ts): approvals and flags on its fields
  const reviewContext = useReviewContext();
  const review = reviewContext && {
    ...reviewContext,
    formTarget: formTargetOf(
      isContactTab(tab) ? { kind: 'contactTab', tabKey: tab.key } : { kind: 'caseSection', sectionKey: tab.key },
    ),
  };

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded,
  // reloaded). Keyed on the form's file rather than the target object, which is rebuilt on edits.
  useEffect(() => {
    dispatch(openFormEditor(tab, editorRevision));
  }, [dispatch, tab.filePath, editorRevision]);

  const sensors = useSensors(
    // A small movement threshold so a plain click still selects the field
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Until it's open, the editor still holds the previous form
  if (target?.filePath !== tab.filePath || revision !== editorRevision) return null;

  const allEntries = [...columns.left, ...columns.right];
  const selectedEntry = allEntries.find(entry => entry.id === selectedId);
  const activeEntry = allEntries.find(entry => entry.id === drag?.activeId);
  const fieldsWithErrors = new Set(issues.filter(issue => issue.severity === 'error').map(issue => issue.fieldName));
  const formItems = allEntries.map(entry => entry.item);

  const reviewOfCard = (entry: Entry): CardReview | undefined => {
    if (!review) return undefined;
    const fieldTarget = fieldTargetOf(review.formTarget, entry.item.name);
    const fingerprint = fieldFingerprint(entry.item);
    return {
      approvals: Object.fromEntries(
        SIDES.map(side => [side, approvalState(review.approvals, side, fieldTarget, fingerprint)]),
      ),
      flags: flagKinds(threadsOn(review.threads, fieldTarget)),
    };
  };

  const statusOf = (entry: Entry): 'new' | 'edited' | undefined => {
    const original = originalByName.get(entry.item.name);
    if (!original) return 'new';
    return isSameJson(original, entry.item) ? undefined : 'edited';
  };

  const handleDragStart = ({ active }: DragStartEvent) => dispatch(dragStarted(String(active.id)));

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (over) dispatch(fieldDraggedOver({ activeId: String(active.id), overId: String(over.id) }));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) =>
    dispatch(finishDrag(String(active.id), over ? String(over.id) : undefined));

  const formIsEmpty = allEntries.length === 0;

  return (
    <div className="editor">
      <section className="panel editor-canvas">
        <h2>
          {tab.title} <span className="muted count">{allEntries.length} fields</span>
        </h2>
        <p className="muted editor-hint">
          Click a field to change it. Drag fields to reorder them or move them to the other column.
        </p>
        {formIsEmpty && (
          <p className="muted">
            This form has no fields, so counselors don&apos;t see this tab. Add a field to start using it.
          </p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => dispatch(dragCancelled())}
        >
          <div className="two-columns">
            {COLUMN_KEYS.map(columnKey => (
              <SortableContext
                key={columnKey}
                id={columnKey}
                items={columns[columnKey].map(entry => entry.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column id={columnKey}>
                  {columns[columnKey].map(entry => (
                    <SortableFieldCard
                      key={entry.id}
                      entry={entry}
                      selected={entry.id === selectedId}
                      onSelect={() => dispatch(fieldSelected(entry.id))}
                      referenceData={referenceData}
                      status={statusOf(entry)}
                      hasError={fieldsWithErrors.has(entry.item.name)}
                      review={reviewOfCard(entry)}
                    />
                  ))}
                  {addingTo === columnKey ? (
                    <AddFieldMenu
                      onAdd={type => dispatch(addField(columnKey, type))}
                      onAddLinked={() => dispatch(linkedWizardToggled(columnKey))}
                      onCancel={() => dispatch(addFieldMenuToggled(undefined))}
                    />
                  ) : (
                    <button
                      type="button"
                      className="add-field-button"
                      onClick={() => dispatch(addFieldMenuToggled(columnKey))}
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
        {selectedEntry && review && (
          <ReviewPanel
            key={selectedEntry.id}
            review={review}
            target={fieldTargetOf(review.formTarget, selectedEntry.item.name)}
            fingerprint={fieldFingerprint(selectedEntry.item)}
            what="field"
            title={`Review: ${selectedEntry.item.label || selectedEntry.item.name}`}
          />
        )}
        {selectedEntry ? (
          <FieldSettings
            // Remount per field (and type) so local state like option ids starts fresh
            key={`${selectedEntry.id}-${selectedEntry.item.type}`}
          />
        ) : (
          <div className="settings-empty">
            <h3>Field settings</h3>
            <p className="muted">
              Click any field on the left to change its question, answers or whether it&apos;s required.
            </p>
            <p className="muted">
              Changes are saved as a draft automatically. Nothing reaches Aselo until the Aselo team reviews and applies
              it.
            </p>
          </div>
        )}
      </aside>

      {linkedWizardColumn && (
        <LinkedDropdownsWizard
          formItems={formItems}
          referenceData={referenceData}
          onCreate={(levelLabels, roots, existingTop) => dispatch(createChain(levelLabels, roots, existingTop))}
          onCancel={() => dispatch(linkedWizardToggled(undefined))}
        />
      )}

      {editingChain && (
        <LinkedAnswersEditor
          title={`Answers for ${editingChain.fields.map(field => field.label || field.name).join(' → ')}`}
          levelLabels={editingChain.fields.map(field => field.label || field.name)}
          initialRoots={editingChain.tree.roots}
          notes={editingChain.notes}
          saveLabel="Save answers"
          downloadName={`${tab.key}-${editingChain.names.join('-')}.xlsx`}
          onSave={(roots, { replacedByImport }) => dispatch(saveChainAnswers(roots, replacedByImport))}
          onCancel={() => dispatch(chainEditorToggled(undefined))}
        />
      )}
    </div>
  );
};
