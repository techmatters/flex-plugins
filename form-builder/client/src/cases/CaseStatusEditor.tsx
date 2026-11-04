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
 * case can move to from each one, next to the status dropdown counselors get on a case. What's
 * edited and how lives in caseStatusSlice.ts.
 */
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { selectOriginalFiles } from '../drafts/draftSlice';
import { selectSectionIssues, selectWorkspace } from '../workspace/workspaceSlice';
import { availableTransitions, getCaseStatusMap, REQUIRED_STATUSES, STATUS_COLORS } from './caseStatuses';
import {
  addStatus,
  currentChanged,
  openCaseStatus,
  removeStatus,
  renameStatus,
  reorderStatuses,
  selectCaseStatus,
  setStatusColor,
  setTransition,
} from './caseStatusSlice';
import { SortableRows } from '../common/SortableRows';

export const CaseStatusEditor = () => {
  const dispatch = useAppDispatch();
  const originalFiles = useAppSelector(selectOriginalFiles);
  const staffMode = useAppSelector(selectActingAsStaff);
  const { editorRevision } = useAppSelector(selectWorkspace);
  const sectionIssues = useAppSelector(selectSectionIssues);
  const { rows, current } = useAppSelector(selectCaseStatus);
  const issues = sectionIssues.filter(issue => issue.message.startsWith('Case statuses'));
  const originalValues = useMemo(
    () => new Set(Object.values(getCaseStatusMap(originalFiles)).map(status => status.value)),
    [originalFiles],
  );
  const statuses = rows.map(row => row.value.status);

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openCaseStatus());
  }, [dispatch, editorRevision]);

  const remove = (id: string) => {
    const { status } = rows.find(row => row.id === id)!.value;
    if (
      originalValues.has(status.value) &&
      !window.confirm(
        `Remove “${status.label}”? Cases that have it now keep it, but counselors can't change their status until Aselo staff move them to another one.`,
      )
    ) {
      return;
    }
    dispatch(removeStatus(id));
  };

  const offered = availableTransitions(statuses, current);
  const currentStatus = statuses.find(status => status.value === current);

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Case statuses</h2>
          <p className="muted">
            Where a case is up to. Counselors change it from the case, choosing among the statuses it's allowed to move
            to.
          </p>
          <p className="field-hint">
            Cases save the status itself, so names can change any time. “Open” (new cases) and “Closed” are needed by
            Aselo and can't be removed.
          </p>
          {issues.length > 0 && (
            <ul className="issue-list">
              {issues.map(issue => (
                <li key={issue.message} className={`issue issue-${issue.severity}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
          <SortableRows
            rows={rows}
            labelOf={value => value.status.label}
            onReorder={next => dispatch(reorderStatuses(next))}
            renderRow={row => {
              const { status } = row.value;
              const isNew = !originalValues.has(status.value);
              return (
                <div className="status-row">
                  <div className="row-inline">
                    <select
                      aria-label={`Colour of ${status.label}`}
                      value={status.color}
                      onChange={e => dispatch(setStatusColor(row.id, e.target.value))}
                    >
                      {[...new Set([...STATUS_COLORS, status.color])].map(color => (
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
                      onChange={e => dispatch(renameStatus(row.id, e.target.value))}
                    />
                    {!REQUIRED_STATUSES.includes(status.value) && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove ${status.label}`}
                        onClick={() => remove(row.id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <fieldset className="status-transitions">
                    <legend>Can move to</legend>
                    {statuses
                      .filter(other => other.value !== status.value)
                      .map(other => (
                        <label key={other.value} className="field-checkbox">
                          <input
                            type="checkbox"
                            checked={status.transitions.includes(other.value)}
                            onChange={e => dispatch(setTransition(row.id, other.value, e.target.checked))}
                          />
                          <span>{other.label}</span>
                        </label>
                      ))}
                    {status.transitions
                      .filter(target => !statuses.some(other => other.value === target))
                      .map(target => (
                        <label key={target} className="field-checkbox missing-status">
                          <input
                            type="checkbox"
                            checked
                            onChange={() => dispatch(setTransition(row.id, target, false))}
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
            <button type="button" className="secondary-button" onClick={() => dispatch(addStatus())}>
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
            <select value={current} onChange={e => dispatch(currentChanged(e.target.value))}>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <p className="field-label">Counselors can choose</p>
          <ul className="case-status-options" aria-label="Statuses offered">
            {offered.map(status => (
              <li key={status.value}>
                <span className="status-pill" style={{ background: status.color }}>
                  {status.label}
                </span>
                {status.value === current && <span className="muted"> (keep it as it is)</span>}
              </li>
            ))}
          </ul>
          {currentStatus?.value === 'closed' && (
            <p className="field-hint">
              Reopening a closed case also needs the counselor to have permission to reopen cases.
            </p>
          )}
          {offered.length <= 1 && <p className="field-hint">This is a final status: cases can't move on from it.</p>}
        </div>
      </aside>
    </div>
  );
};
