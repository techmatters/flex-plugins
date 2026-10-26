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
import { downloadExportZip } from '../exportZip';
import { repoPathOf } from '../../server/filePaths';
import type { ValidationIssue } from '../validation';
import type { ApplyResult } from '../../server/api';

type Props = {
  code: string;
  version: string;
  originalFiles: DefinitionFileMap;
  draftFiles: DefinitionFileMap;
  changedPaths: string[];
  issues: ValidationIssue[];
  webchatDefaultLocale?: string;
  // Aselo staff apply the changes; helpline staff submit them for review
  mode: 'apply' | 'submit';
  alreadySubmitted: boolean;
  onSubmit: () => Promise<void>;
  onApply: () => Promise<ApplyResult>;
  onClose: () => void;
};

export const ReviewChanges = ({
  code,
  version,
  originalFiles,
  draftFiles,
  changedPaths,
  issues,
  webchatDefaultLocale,
  mode,
  alreadySubmitted,
  onSubmit,
  onApply,
  onClose,
}: Props) => {
  const [exported, setExported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applied, setApplied] = useState<ApplyResult>();
  const [failure, setFailure] = useState<string>();
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const summaries = summarizeContactFormChanges(originalFiles, draftFiles);
  const sectionSummaries = summarizeSectionChanges(originalFiles, draftFiles, webchatDefaultLocale);

  const exportChanges = async () => {
    await downloadExportZip({ code, version, originalFiles, draftFiles, warnings, webchatDefaultLocale });
    setExported(true);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setFailure(undefined);
    try {
      await action();
    } catch (err) {
      setFailure((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (applied) {
    return (
      <div className="modal-backdrop" role="presentation">
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
          <div className="modal-header">
            <h2 id="review-title">Changes applied</h2>
          </div>
          <p>{applied.description}</p>
          <ul>
            {applied.written.map((filePath) => (
              <li key={filePath}>
                <code>{filePath}</code>
              </li>
            ))}
          </ul>
          {applied.link && (
            <p>
              <a href={applied.link} target="_blank" rel="noreferrer">
                Open the pull request
              </a>
            </p>
          )}
          <div className="modal-footer">
            <p className="muted">The draft is cleared now that it's been applied.</p>
            <button type="button" className="primary-button" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <section key={summary.tab.filePath} className="review-section">
                <h3>
                  {summary.tab.kind === 'case' ? `Case section: ${summary.tab.title}` : summary.tab.title}
                </h3>
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
                <h3>Fix these first</h3>
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
                <p className="muted">These don't stop the changes going ahead; they're passed on
                  to the reviewer.</p>
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
                    <code>{repoPathOf(code, version, filePath)}</code>
                  </li>
                ))}
              </ul>
            </details>

            {failure && <p className="issue issue-error">{failure}</p>}

            {mode === 'submit' ? (
              <div className="modal-footer">
                {submitted || alreadySubmitted ? (
                  <p className="success-text">
                    Submitted. The Aselo team has been told and will review and apply your
                    changes. If you change anything else, submit again.
                  </p>
                ) : (
                  <p className="muted">
                    Submitting sends your changes to the Aselo team to review. Nothing changes in
                    Aselo until they apply them.
                  </p>
                )}
                <button
                  type="button"
                  className="primary-button"
                  disabled={errors.length > 0 || busy || submitted || alreadySubmitted}
                  onClick={() =>
                    run(async () => {
                      await onSubmit();
                      setSubmitted(true);
                    })
                  }
                >
                  Submit for review
                </button>
              </div>
            ) : (
              <div className="modal-footer">
                <p className="muted">
                  {exported
                    ? 'Downloaded. The draft stays here until it is applied or discarded.'
                    : 'Applying writes these changes into the repository for a pull request. Counselors see them once the PR is merged and deployed.'}
                </p>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={errors.length > 0 || busy}
                  onClick={exportChanges}
                >
                  Download as zip
                </button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={errors.length > 0 || busy}
                  onClick={() =>
                    run(async () => {
                      setApplied(await onApply());
                    })
                  }
                >
                  Apply
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
