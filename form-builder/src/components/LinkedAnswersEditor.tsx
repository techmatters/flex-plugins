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
 */
import { useState } from 'react';
import {
  AnswerNode,
  countByLevel,
  getChildrenAtPath,
  treeToRows,
  updateChildrenAtPath,
} from '../linkedDropdowns';
import { downloadExcel } from '../spreadsheet';
import { AnswerColumn } from './AnswerColumn';
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
  const [roots, setRoots] = useState(initialRoots);
  // The selected answer's id in each column
  const [selected, setSelected] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [replacedByImport, setReplacedByImport] = useState(false);
  const [changed, setChanged] = useState(false);
  const depth = levelLabels.length;
  const counts = countByLevel(roots, depth);

  const updateLevel = (level: number, answers: AnswerNode[]) => {
    setRoots(updateChildrenAtPath(roots, selected.slice(0, level), () => answers));
    setChanged(true);
  };

  const select = (level: number, id: string) => setSelected([...selected.slice(0, level), id]);

  const cancel = () => {
    if (!changed || window.confirm('Close without saving your changes to these answers?')) {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="linked-editor-title"
      >
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
            onImport={(imported) => {
              setRoots(imported);
              setSelected([]);
              setReplacedByImport(true);
              setChanged(true);
              setImporting(false);
            }}
            onCancel={() => setImporting(false)}
          />
        ) : (
          <>
            <div className="linked-toolbar">
              <p className="muted">
                Pick an answer to see the answers under it. Changes here are saved to your draft
                when you click “{saveLabel}”.
              </p>
              <button type="button" className="secondary-button" onClick={() => setImporting(true)}>
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
                {notes.map((note) => (
                  <li key={note} className="issue issue-warning">
                    {note}
                  </li>
                ))}
              </ul>
            )}

            <div
              className="answer-columns"
              style={{ gridTemplateColumns: `repeat(${depth}, minmax(220px, 1fr))` }}
            >
              {levelLabels.map((label, level) => (
                <AnswerColumn
                  // Fresh column state (search, inputs) when the parent selection changes
                  key={`${level}-${selected[level - 1] ?? 'top'}`}
                  label={label}
                  previousLabel={levelLabels[level - 1]}
                  answers={
                    level === 0 || selected[level - 1]
                      ? getChildrenAtPath(roots, selected.slice(0, level))
                      : undefined
                  }
                  selectedId={selected[level]}
                  hasLevelBelow={level < depth - 1}
                  onSelect={(id) => select(level, id)}
                  onChange={(answers) => updateLevel(level, answers)}
                />
              ))}
            </div>
          </>
        )}

        <div className="modal-footer">
          <p className="muted">
            {levelLabels
              .map((label, level) => `${counts[level].toLocaleString()} ${label}`)
              .join(' · ')}
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
