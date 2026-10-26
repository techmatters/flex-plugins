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
 * Edits the case statuses (CaseStatus.json): their names, colours, order and which status a
 * case can move to from each one, next to the status dropdown counselors get on a case.
 */
import { useMemo, useState } from 'react';
import type { StatusInfo } from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from '../../definitions';
import {
  availableTransitions,
  CASE_STATUS_FILE,
  getCaseStatusMap,
  newStatusValue,
  REQUIRED_STATUSES,
  STATUS_COLORS,
} from '../../caseStatuses';
import type { ValidationIssue } from '../../validation';
import { Row, SortableRows, toRows } from './SortableRows';

type Props = {
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  issues: ValidationIssue[];
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

// Rows keep the status's key in the file (usually the same as its value)
type StatusRow = { key: string; status: StatusInfo };

export const CaseStatusEditor = ({ draftFiles, originalFiles, staffMode, issues, onChangeFiles }: Props) => {
  const originalValues = useMemo(
    () => new Set(Object.values(getCaseStatusMap(originalFiles)).map((status) => status.value)),
    [originalFiles],
  );
  const [rows, setRows] = useState<Row<StatusRow>[]>(() =>
    toRows(Object.entries(getCaseStatusMap(draftFiles)).map(([key, status]) => ({ key, status }))),
  );
  const statuses = rows.map((row) => row.value.status);
  const [current, setCurrent] = useState(statuses[0]?.value ?? 'open');

  const write = (next: Row<StatusRow>[]) => {
    setRows(next);
    onChangeFiles((files) => ({
      ...files,
      [CASE_STATUS_FILE]: Object.fromEntries(next.map(({ value }) => [value.key, value.status])),
    }));
  };

  const update = (id: string, change: (status: StatusInfo) => StatusInfo) =>
    write(rows.map((row) => (row.id === id ? { ...row, value: { ...row.value, status: change(row.value.status) } } : row)));

  // A new status is saved under a value made from its name; existing ones keep theirs
  const rename = (row: Row<StatusRow>, label: string) => {
    const { status } = row.value;
    if (originalValues.has(status.value)) {
      update(row.id, (old) => ({ ...old, label }));
      return;
    }
    const value = newStatusValue(
      label,
      statuses.filter((other) => other !== status).map((other) => other.value),
    );
    const renamed = (target: string) => (target === status.value ? value : target);
    write(
      rows.map((candidate) =>
        candidate.id === row.id
          ? { ...candidate, value: { key: value, status: { ...status, label, value, transitions: status.transitions } } }
          : {
              ...candidate,
              value: {
                ...candidate.value,
                status: { ...candidate.value.status, transitions: candidate.value.status.transitions.map(renamed) },
              },
            },
      ),
    );
    if (current === status.value) setCurrent(value);
  };

  const addStatus = () => {
    const value = newStatusValue('New status', statuses.map((status) => status.value));
    const [row] = toRows([
      { key: value, status: { value, label: 'New status', color: 'blue', transitions: ['closed'] } },
    ]);
    write([...rows, row]);
  };

  const remove = (row: Row<StatusRow>) => {
    const { status } = row.value;
    if (
      originalValues.has(status.value) &&
      !window.confirm(
        `Remove “${status.label}”? Cases that have it now keep it, but counselors can't change their status until Aselo staff move them to another one.`,
      )
    ) {
      return;
    }
    write(
      rows
        .filter((candidate) => candidate.id !== row.id)
        // Nothing can move to a status that's gone
        .map((candidate) => ({
          ...candidate,
          value: {
            ...candidate.value,
            status: {
              ...candidate.value.status,
              transitions: candidate.value.status.transitions.filter((target) => target !== status.value),
            },
          },
        })),
    );
  };

  const offered = availableTransitions(statuses, current);
  const currentStatus = statuses.find((status) => status.value === current);

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Case statuses</h2>
          <p className="muted">
            Where a case is up to. Counselors change it from the case, choosing among the statuses
            it's allowed to move to.
          </p>
          <p className="field-hint">
            Cases save the status itself, so names can change any time. “Open” (new cases) and
            “Closed” are needed by Aselo and can't be removed.
          </p>
          {issues.length > 0 && (
            <ul className="issue-list">
              {issues.map((issue) => (
                <li key={issue.message} className={`issue issue-${issue.severity}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
          <SortableRows
            rows={rows}
            labelOf={(value) => value.status.label}
            onReorder={write}
            renderRow={(row) => {
              const { status } = row.value;
              const isNew = !originalValues.has(status.value);
              return (
                <div className="status-row">
                  <div className="row-inline">
                    <select
                      aria-label={`Colour of ${status.label}`}
                      value={status.color}
                      onChange={(e) => update(row.id, (old) => ({ ...old, color: e.target.value }))}
                    >
                      {[...new Set([...STATUS_COLORS, status.color])].map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <span className="status-pill" style={{ background: status.color }} aria-hidden="true" />
                    <input
                      type="text"
                      aria-label="Status name"
                      value={status.label}
                      onChange={(e) => rename(row, e.target.value)}
                    />
                    {!REQUIRED_STATUSES.includes(status.value) && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove ${status.label}`}
                        onClick={() => remove(row)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <fieldset className="status-transitions">
                    <legend>Can move to</legend>
                    {statuses
                      .filter((other) => other.value !== status.value)
                      .map((other) => (
                        <label key={other.value} className="field-checkbox">
                          <input
                            type="checkbox"
                            checked={status.transitions.includes(other.value)}
                            onChange={(e) =>
                              update(row.id, (old) => ({
                                ...old,
                                transitions: e.target.checked
                                  ? [...old.transitions, other.value]
                                  : old.transitions.filter((target) => target !== other.value),
                              }))
                            }
                          />
                          <span>{other.label}</span>
                        </label>
                      ))}
                    {status.transitions
                      .filter((target) => !statuses.some((other) => other.value === target))
                      .map((target) => (
                        <label key={target} className="field-checkbox missing-status">
                          <input
                            type="checkbox"
                            checked
                            onChange={() =>
                              update(row.id, (old) => ({
                                ...old,
                                transitions: old.transitions.filter((other) => other !== target),
                              }))
                            }
                          />
                          <span>“{target}” (not a status: untick to tidy up)</span>
                        </label>
                      ))}
                  </fieldset>
                  {staffMode && (
                    <span className="field-hint">
                      Saved as <code>{status.value}</code>
                      {isNew ? ' (from its name when it was added)' : ''}
                    </span>
                  )}
                </div>
              );
            }}
          />
          <div className="option-actions">
            <button type="button" className="secondary-button" onClick={addStatus}>
              + Add a status
            </button>
          </div>
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">The status dropdown on a case</span>
        </div>
        <div className="aselo section-preview-frame case-status-preview">
          <label className="field">
            <span className="field-label">If the case is now</span>
            <select value={current} onChange={(e) => setCurrent(e.target.value)}>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <p className="field-label">Counselors can choose</p>
          <ul className="case-status-options" aria-label="Statuses offered">
            {offered.map((status) => (
              <li key={status.value}>
                <span className="status-pill" style={{ background: status.color }}>
                  {status.label}
                </span>
                {status.value === current && <span className="muted"> (keep it as it is)</span>}
              </li>
            ))}
          </ul>
          {currentStatus?.value === 'closed' && (
            <p className="field-hint">Reopening a closed case also needs the counselor to have permission to reopen cases.</p>
          )}
          {offered.length <= 1 && (
            <p className="field-hint">This is a final status: cases can't move on from it.</p>
          )}
        </div>
      </aside>
    </div>
  );
};
