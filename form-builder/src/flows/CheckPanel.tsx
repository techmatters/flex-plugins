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
 * The Check panel: everything checks.ts finds on the board, errors first. Clicking one shows the
 * object; an unconnected way out can be marked as ending the flow on purpose, and a warning that
 * doesn't apply to this board (e.g. system down on a post-survey) can be ignored: it's then listed
 * apart, not counted, and can be brought back.
 */
import { useState } from 'react';
import { CircleAlert, EyeOff, RotateCcw, TriangleAlert } from 'lucide-react';
import type { Issue } from './checks';

type Props = {
  issues: Issue[];
  // Warnings marked as not needed on this board
  ignored: Issue[];
  readOnly: boolean;
  onShow: (id: string) => void;
  onEndHere: (objectId: string, exit: string) => void;
  onIgnore: (key: string, ignore: boolean) => void;
};

export const CheckPanel = ({ issues, ignored, readOnly, onShow, onEndHere, onIgnore }: Props) => {
  const [showWarnings, setShowWarnings] = useState(true);
  const [showIgnored, setShowIgnored] = useState(false);
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const shown = showWarnings ? issues : errors;

  const message = (issue: Issue) => {
    const target = issue.objectId ?? issue.frameId;
    return target ? (
      <button type="button" className="link-button flow-issue-message" onClick={() => onShow(target)}>
        {issue.message}
      </button>
    ) : (
      <span>{issue.message}</span>
    );
  };

  return (
    <div className="flow-check" role="region" aria-label="Check">
      <p className="field-hint">
        Checked against the Studio flow standards. Errors are mistakes to fix; warnings are what the design still needs
        before it&apos;s built in Studio. A warning that doesn&apos;t apply to this board can be ignored.
      </p>
      <p className="flow-check-summary">
        {errors.length === 0 && warnings.length === 0
          ? 'Nothing to fix.'
          : `${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`}
        {ignored.length > 0 && ` · ${ignored.length} ignored`}
      </p>
      {warnings.length > 0 && (
        <label className="field-checkbox">
          <input type="checkbox" checked={showWarnings} onChange={(e) => setShowWarnings(e.target.checked)} />
          <span>Show warnings</span>
        </label>
      )}
      <ul className="flow-issue-list">
        {shown.map((issue) => (
          <li key={issue.key} className={`flow-issue ${issue.severity}`}>
            <span className="flow-issue-icon" aria-label={issue.severity === 'error' ? 'Error' : 'Warning'}>
              {issue.severity === 'error' ? <CircleAlert size={15} /> : <TriangleAlert size={15} />}
            </span>
            <div>
              {message(issue)}
              {!readOnly && (
                <span className="flow-issue-actions">
                  {issue.openExit !== undefined && issue.objectId && (
                    <button
                      type="button"
                      className="link-button flow-issue-fix"
                      onClick={() => onEndHere(issue.objectId!, issue.openExit!)}
                    >
                      The flow ends here on purpose
                    </button>
                  )}
                  {issue.severity === 'warning' && (
                    <button
                      type="button"
                      className="link-button flow-issue-fix"
                      aria-label={`Ignore: ${issue.message}`}
                      onClick={() => onIgnore(issue.key, true)}
                    >
                      <EyeOff size={12} aria-hidden /> Ignore
                    </button>
                  )}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {ignored.length > 0 && (
        <div className="flow-check-ignored">
          <button type="button" className="link-button" onClick={() => setShowIgnored(!showIgnored)}>
            {showIgnored ? 'Hide' : 'Show'} {ignored.length} ignored warning{ignored.length === 1 ? '' : 's'}
          </button>
          {showIgnored && (
            <ul className="flow-issue-list">
              {ignored.map((issue) => (
                <li key={issue.key} className="flow-issue ignored">
                  <span className="flow-issue-icon" aria-label="Ignored">
                    <EyeOff size={15} />
                  </span>
                  <div>
                    {message(issue)}
                    {!readOnly && (
                      <button
                        type="button"
                        className="link-button flow-issue-fix"
                        aria-label={`Stop ignoring: ${issue.message}`}
                        onClick={() => onIgnore(issue.key, false)}
                      >
                        <RotateCcw size={12} aria-hidden /> Stop ignoring
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
