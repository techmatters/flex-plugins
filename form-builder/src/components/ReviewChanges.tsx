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

import { useState } from 'react';
import type { DefinitionFileMap } from '../definitions';
import { summarizeContactFormChanges } from '../changes';
import { summarizeSectionChanges } from '../sections';
import { downloadExportZip, REPO_FORM_DEFINITIONS_DIR } from '../exportZip';
import type { ValidationIssue } from '../validation';

type Props = {
  code: string;
  version: string;
  originalFiles: DefinitionFileMap;
  draftFiles: DefinitionFileMap;
  changedPaths: string[];
  issues: ValidationIssue[];
  onClose: () => void;
};

export const ReviewChanges = ({
  code,
  version,
  originalFiles,
  draftFiles,
  changedPaths,
  issues,
  onClose,
}: Props) => {
  const [exported, setExported] = useState(false);
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const summaries = summarizeContactFormChanges(originalFiles, draftFiles);
  const sectionSummaries = summarizeSectionChanges(originalFiles, draftFiles);

  const exportChanges = async () => {
    await downloadExportZip({ code, version, originalFiles, draftFiles, warnings });
    setExported(true);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="review-title">Review your changes</h2>
          <button type="button" className="link-button" onClick={onClose}>
            Close
          </button>
        </div>

        {changedPaths.length === 0 ? (
          <p className="muted">You haven't changed anything yet.</p>
        ) : (
          <>
            {summaries.map((summary) => (
              <section key={summary.tab.key} className="review-section">
                <h3>{summary.tab.title}</h3>
                <ul>
                  {summary.added.map((field) => (
                    <li key={`added-${field}`}>
                      <span className="badge badge-new">Added</span> {field}
                    </li>
                  ))}
                  {summary.removed.map((field) => (
                    <li key={`removed-${field}`}>
                      <span className="badge badge-error">Removed</span> {field}
                    </li>
                  ))}
                  {summary.edited.map((field) => (
                    <li key={`edited-${field}`}>
                      <span className="badge badge-edited">Edited</span> {field}
                    </li>
                  ))}
                  {summary.reordered && <li>Fields were moved around</li>}
                </ul>
              </section>
            ))}

            {sectionSummaries.map((summary) => (
              <section key={summary.title} className="review-section">
                <h3>{summary.title}</h3>
                <ul>
                  {summary.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ))}

            {errors.length > 0 && (
              <section className="review-section">
                <h3>Fix these before exporting</h3>
                <ul className="issue-list">
                  {errors.map((issue) => (
                    <li key={issue.message} className="issue issue-error">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {warnings.length > 0 && (
              <section className="review-section">
                <h3>Notes for the Aselo team</h3>
                <p className="muted">These don't stop you exporting; they're passed on to the
                  reviewer.</p>
                <ul className="issue-list">
                  {warnings.map((issue) => (
                    <li key={issue.message} className="issue issue-warning">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <details className="review-section">
              <summary>Files that will change ({changedPaths.length})</summary>
              <ul>
                {changedPaths.map((filePath) => (
                  <li key={filePath}>
                    <code>
                      {REPO_FORM_DEFINITIONS_DIR}/{code}/{version}/{filePath}
                    </code>
                  </li>
                ))}
              </ul>
            </details>

            <div className="modal-footer">
              {exported ? (
                <p className="success-text">
                  Downloaded. Send the zip file to the Aselo team. Your draft stays here until
                  you discard it.
                </p>
              ) : (
                <p className="muted">
                  Exporting downloads your changes as a zip file for the Aselo team to review and
                  apply. It doesn't change anything in Aselo by itself.
                </p>
              )}
              <button
                type="button"
                className="primary-button"
                disabled={errors.length > 0}
                onClick={exportChanges}
              >
                Download changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
