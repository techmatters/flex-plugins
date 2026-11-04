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
 * Edits all the answers of a set of linked dropdowns, one column per level, like a file
 * browser: pick an answer on the left to see and edit the answers under it on the right.
 * Answers can also be replaced from a spreadsheet, or downloaded to edit in Excel.
 *
 * The answers being edited live in linkedDropdownsSlice.ts until they're saved: the editor that
 * opened this one gets them in onSave.
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { AnswerNode, countByLevel, treeToRows } from './linkedDropdowns';
import {
  answersEditorClosed,
  answersEditorOpened,
  answersImported,
  importToggled,
  selectAnswersEditor,
} from './linkedDropdownsSlice';
import { downloadExcel } from './spreadsheet';
import { AnswerColumn } from '../forms/AnswerColumn';
import { SpreadsheetImport } from './SpreadsheetImport';

type Props = {
  title: string;
  levelLabels: string[];
  initialRoots: AnswerNode[];
  // Things the user should know before editing (shared lists, existing data quirks)
  notes?: string[];
  saveLabel: string;
  downloadName: string;
  onSave: (roots: AnswerNode[], options: { replacedByImport: boolean }) => void;
  // Wizard only: go back a step, keeping the answers entered so far
  onBack?: (roots: AnswerNode[]) => void;
  onCancel: () => void;
};

export const LinkedAnswersEditor = ({
  title,
  levelLabels,
  initialRoots,
  notes = [],
  saveLabel,
  downloadName,
  onSave,
  onBack,
  onCancel,
}: Props) => {
  const dispatch = useAppDispatch();
  const answers = useAppSelector(selectAnswersEditor);

  // Starts with the answers it's given, and is closed when it goes away
  useEffect(() => {
    dispatch(answersEditorOpened(initialRoots));
    return () => {
      dispatch(answersEditorClosed());
    };
  }, [dispatch]);

  if (!answers) return null;
  const { roots, selected, importing, replacedByImport, changed } = answers;
  const depth = levelLabels.length;
  const counts = countByLevel(roots, depth);

  const cancel = () => {
    if (!changed || window.confirm('Close without saving your changes to these answers?')) {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="linked-editor-title">
        <div className="modal-header">
          <h2 id="linked-editor-title">{title}</h2>
          <button type="button" className="link-button" onClick={cancel}>
            Close
          </button>
        </div>

        {importing ? (
          <SpreadsheetImport
            levelLabels={levelLabels}
            currentRoots={roots}
            onImport={imported => dispatch(answersImported(imported))}
            onCancel={() => dispatch(importToggled(false))}
          />
        ) : (
          <>
            <div className="linked-toolbar">
              <p className="muted">
                Pick an answer to see the answers under it. Changes here are saved to your draft when you click “
                {saveLabel}”.
              </p>
              <button type="button" className="secondary-button" onClick={() => dispatch(importToggled(true))}>
                Import from a spreadsheet
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={counts[0] === 0}
                onClick={() => downloadExcel(levelLabels, treeToRows(roots), downloadName)}
              >
                Download as Excel
              </button>
            </div>

            {notes.length > 0 && (
              <ul className="issue-list">
                {notes.map(note => (
                  <li key={note} className="issue issue-warning">
                    {note}
                  </li>
                ))}
              </ul>
            )}

            <div className="answer-columns" style={{ gridTemplateColumns: `repeat(${depth}, minmax(220px, 1fr))` }}>
              {levelLabels.map((label, level) => (
                <AnswerColumn
                  // A column of answers under another answer starts afresh (as its typed text does)
                  key={`${level}-${selected[level - 1] ?? 'top'}`}
                  level={level}
                  label={label}
                  previousLabel={levelLabels[level - 1]}
                  hasLevelBelow={level < depth - 1}
                />
              ))}
            </div>
          </>
        )}

        <div className="modal-footer">
          <p className="muted">
            {levelLabels.map((label, level) => `${counts[level].toLocaleString()} ${label}`).join(' · ')}
          </p>
          {onBack && (
            <button type="button" className="link-button" onClick={() => onBack(roots)}>
              Back
            </button>
          )}
          <button
            type="button"
            className="primary-button"
            disabled={importing || counts[0] === 0}
            onClick={() => onSave(roots, { replacedByImport })}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
