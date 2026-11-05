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
 * The forms to work on, on the start page: the versions Aselo staff imported (from master or a
 * branch) and the drafts in progress. Aselo staff see every helpline's, with those submitted for
 * review first; helpline staff see their own helplines'. Its state lives in draftsListSlice.ts.
 */
import { useEffect } from 'react';
import { type DraftSummary, type FlagKind } from '@tech-matters/form-builder-shared';

import { useAppDispatch, useAppSelector } from '../app/store';
import { selectIsAseloStaff } from '../app/sessionSlice';
import { openHelpline } from '../workspace/workspaceSlice';
import { Loading } from '../common/Loading';
import { HelplineFilter } from '../common/HelplineFilter';
import { BranchLink } from '../common/BranchPicker';
import { helplineFilterChanged, loadDrafts, removeDraft, selectDrafts, selectHelplineFilter } from './draftsListSlice';
import '../common/designStatus.css';

// e.g. ["2 open questions", "1 change needed"]: the flags still open on its forms (formReviews.ts)
const changesNeededOf = (draft: DraftSummary) => {
  const open = (draft.meta.threads ?? []).filter(thread => !thread.resolvedAt);
  const count = (kind: FlagKind) => open.filter(thread => thread.kind === kind).length;
  const parts = [
    [count('question'), 'open question', 'open questions'],
    [count('changes'), 'change needed', 'changes needed'],
    [count('attention'), 'needs attention', 'need attention'],
  ] as const;
  return parts.filter(([n]) => n > 0).map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
};

const keyOf = (draft: Pick<DraftSummary, 'code' | 'version'>) => `${draft.code}/${draft.version}`;

export const DraftsList = () => {
  const dispatch = useAppDispatch();
  const drafts = useAppSelector(selectDrafts);
  const helpline = useAppSelector(selectHelplineFilter);
  const isAseloStaff = useAppSelector(selectIsAseloStaff);

  useEffect(() => {
    dispatch(loadDrafts());
  }, [dispatch]);

  // branch: the flex-plugins branch the draft was started from ('' for the default)
  const onOpen = (code: string, version: string, branch: string) => dispatch(openHelpline(code, version, branch));

  // Aselo staff: off the list (with its changes, if any)
  const remove = async (draft: DraftSummary) => {
    const name = `${draft.code.toUpperCase()} ${draft.version}`;
    const changes = draft.changedFiles.length;
    if (changes > 0 && !window.confirm(`Remove ${name} from the list? Its changes (${changes} files) are lost.`))
      return;
    await dispatch(removeDraft(draft));
  };

  if (!drafts) return <Loading text="Loading forms…" />;
  if (drafts.length === 0) {
    return (
      <p className="field-hint">
        {isAseloStaff
          ? 'Nothing here yet: import a helpline’s forms (above) to work on them.'
          : 'Nothing here yet: the Aselo team adds your helpline’s forms here when there’s something to work on.'}
      </p>
    );
  }

  return (
    <section className="drafts-list">
      <h3>{isAseloStaff ? 'Forms' : 'Your forms'}</h3>
      <div className="area-home-filters">
        <HelplineFilter
          codes={drafts.map(draft => draft.code)}
          value={helpline}
          onChange={code => dispatch(helplineFilterChanged(code))}
        />
      </div>
      <table className="area-home-table">
        <thead>
          <tr>
            <th>Helpline</th>
            <th>Status</th>
            <th>Last change</th>
            <th>Files</th>
            <th aria-label="Open" />
          </tr>
        </thead>
        <tbody>
          {drafts
            .filter(draft => !helpline || draft.code === helpline)
            .map(draft => (
              <tr key={keyOf(draft)}>
                <td className="area-home-name">
                  {draft.code.toUpperCase()} {draft.version}
                  {draft.meta.source && <BranchLink className="drafts-branch" branch={draft.meta.source.branch} />}
                </td>
                <td>
                  {/* Forms have their own review: submitted drafts are applied by Aselo staff in the builder */}
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {draft.meta.status === 'submitted' ? (
                    <span className="design-status design-status-ready">
                      Submitted for review{draft.meta.submittedBy ? ` by ${draft.meta.submittedBy}` : ''}
                    </span>
                  ) : draft.changedFiles.length === 0 ? (
                    <span className="design-status">No changes yet</span>
                  ) : (
                    <span className="design-status design-status-in-progress">In progress</span>
                  )}
                  {changesNeededOf(draft).map(text => (
                    <div key={text} className="drafts-changes-needed">
                      {text}
                    </div>
                  ))}
                </td>
                <td>
                  {draft.meta.updatedBy}, {new Date(draft.meta.updatedAt).toLocaleString()}
                </td>
                <td>{draft.changedFiles.length}</td>
                <td className="area-home-open">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onOpen(draft.code, draft.version, draft.meta.source?.branch ?? '')}
                  >
                    {isAseloStaff && draft.meta.status === 'submitted' ? 'Review' : 'Open'}
                  </button>
                  {isAseloStaff && (
                    <button type="button" className="link-button" onClick={() => remove(draft)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
};
