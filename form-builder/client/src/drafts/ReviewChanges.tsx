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
 * The "Review & submit" / "Review & apply" dialog: what the draft changes, what needs fixing
 * first, and submitting or applying it. Its state and logic live in reviewSlice.ts.
 */
import { repoPathOf } from '@tech-matters/form-builder-shared';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff, selectUser } from '../app/sessionSlice';
import { reviewClosed, selectReviewIssues } from '../workspace/workspaceSlice';
import { selectChangedPaths, selectDraft } from './draftSlice';
import {
  applyReview,
  exportReview,
  selectContactFormSummaries,
  selectReview,
  selectSectionSummaries,
  submitReview,
} from './reviewSlice';

export const ReviewChanges = () => {
  const dispatch = useAppDispatch();
  const { code, version, meta } = useAppSelector(selectDraft);
  const changedPaths = useAppSelector(selectChangedPaths);
  const issues = useAppSelector(selectReviewIssues);
  const summaries = useAppSelector(selectContactFormSummaries);
  const sectionSummaries = useAppSelector(selectSectionSummaries);
  // Aselo staff apply the changes; helpline staff submit them for review
  const mode = useAppSelector(selectActingAsStaff) ? 'apply' : 'submit';
  // False when deployed without the GitHub App: Aselo staff download the changes and open the PR
  const applyInBuilder = useAppSelector(selectUser)?.applyInBuilder !== false;
  const { exported, busy, submitted, applied, failure } = useAppSelector(selectReview);
  const alreadySubmitted = meta?.status === 'submitted';
  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');
  const onClose = () => dispatch(reviewClosed());

  if (applied) {
    return (
      <div className="modal-backdrop" role="presentation">
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
          <div className="modal-header">
            <h2 id="review-title">Changes applied</h2>
          </div>
          <p>{applied.description}</p>
          <ul>
            {applied.written.map(filePath => (
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
        onClick={e => e.stopPropagation()}
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
            {summaries.map(summary => (
              <section key={summary.tab.filePath} className="review-section">
                <h3>{summary.tab.kind === 'case' ? `Case section: ${summary.tab.title}` : summary.tab.title}</h3>
                <ul>
                  {summary.added.map(field => (
                    <li key={`added-${field}`}>
                      <span className="badge badge-new">Added</span> {field}
                    </li>
                  ))}
                  {summary.removed.map(field => (
                    <li key={`removed-${field}`}>
                      <span className="badge badge-error">Removed</span> {field}
                    </li>
                  ))}
                  {summary.edited.map(field => (
                    <li key={`edited-${field}`}>
                      <span className="badge badge-edited">Edited</span> {field}
                    </li>
                  ))}
                  {summary.reordered && <li>Fields were moved around</li>}
                </ul>
              </section>
            ))}

            {sectionSummaries.map(summary => (
              <section key={summary.title} className="review-section">
                <h3>{summary.title}</h3>
                <ul>
                  {summary.lines.map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ))}

            {errors.length > 0 && (
              <section className="review-section">
                <h3>Fix these first</h3>
                <ul className="issue-list">
                  {errors.map(issue => (
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
                <p className="muted">These don't stop the changes going ahead; they're passed on to the reviewer.</p>
                <ul className="issue-list">
                  {warnings.map(issue => (
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
                {changedPaths.map(filePath => (
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
                    Submitted. The Aselo team has been told and will review and apply your changes. If you change
                    anything else, submit again.
                  </p>
                ) : (
                  <p className="muted">
                    Submitting sends your changes to the Aselo team to review. Nothing changes in Aselo until they apply
                    them.
                  </p>
                )}
                <button
                  type="button"
                  className="primary-button"
                  disabled={errors.length > 0 || busy || submitted || alreadySubmitted}
                  onClick={() => dispatch(submitReview())}
                >
                  Submit for review
                </button>
              </div>
            ) : (
              <div className="modal-footer">
                {applyInBuilder ? (
                  <p className="muted">
                    {exported
                      ? 'Downloaded. The draft stays here until it is applied or discarded.'
                      : 'Applying writes these changes into the repository for a pull request. Counselors see them once the PR is merged and deployed.'}
                  </p>
                ) : (
                  <p className="muted">
                    {exported
                      ? 'Downloaded. Once the PR is merged, discard this draft.'
                      : 'Download the changes, unzip them at the root of a flex-plugins checkout on a new branch and open a PR (CHANGES.md in the zip says what changed). Once it is merged, discard this draft.'}
                  </p>
                )}
                <button
                  type="button"
                  className={applyInBuilder ? 'secondary-button' : 'primary-button'}
                  disabled={errors.length > 0 || busy}
                  onClick={() => dispatch(exportReview())}
                >
                  Download as zip
                </button>
                {applyInBuilder && (
                  <button
                    type="button"
                    className="primary-button"
                    disabled={errors.length > 0 || busy}
                    onClick={() => dispatch(applyReview())}
                  >
                    Apply
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
