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
 * object; an unconnected way out can be marked as ending the flow on purpose.
 */
import { useState } from 'react';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import type { Issue } from './checks';

type Props = {
  issues: Issue[];
  readOnly: boolean;
  onShow: (id: string) => void;
  onEndHere: (objectId: string, exit: string) => void;
};

export const CheckPanel = ({ issues, readOnly, onShow, onEndHere }: Props) => {
  const [showWarnings, setShowWarnings] = useState(true);
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const shown = showWarnings ? issues : errors;

  return (
    <div className="flow-check" role="region" aria-label="Check">
      <p className="field-hint">
        Checked against the Studio flow standards. Errors are mistakes to fix; warnings are what the design still needs
        before it&apos;s built in Studio.
      </p>
      <p className="flow-check-summary">
        {errors.length === 0 && warnings.length === 0
          ? 'Nothing to fix.'
          : `${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`}
      </p>
      {warnings.length > 0 && (
        <label className="field-checkbox">
          <input type="checkbox" checked={showWarnings} onChange={(e) => setShowWarnings(e.target.checked)} />
          <span>Show warnings</span>
        </label>
      )}
      <ul className="flow-issue-list">
        {shown.map((issue) => {
          const target = issue.objectId ?? issue.frameId;
          return (
            <li key={issue.key} className={`flow-issue ${issue.severity}`}>
              <span className="flow-issue-icon" aria-label={issue.severity === 'error' ? 'Error' : 'Warning'}>
                {issue.severity === 'error' ? <CircleAlert size={15} /> : <TriangleAlert size={15} />}
              </span>
              <div>
                {target ? (
                  <button type="button" className="link-button flow-issue-message" onClick={() => onShow(target)}>
                    {issue.message}
                  </button>
                ) : (
                  <span>{issue.message}</span>
                )}
                {issue.openExit !== undefined && issue.objectId && !readOnly && (
                  <button
                    type="button"
                    className="link-button flow-issue-fix"
                    onClick={() => onEndHere(issue.objectId!, issue.openExit!)}
                  >
                    The flow ends here on purpose
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
