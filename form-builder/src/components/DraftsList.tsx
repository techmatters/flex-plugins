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
 * Drafts in progress, on the start page. Aselo staff see every helpline's drafts, with those
 * submitted for review first; helpline staff see their own.
 */
import { useEffect, useState } from 'react';
import type { DraftSummary } from '../../server/drafts';
import type { DraftClient } from '../draftClient';

type Props = {
  draftClient: DraftClient;
  isAseloStaff: boolean;
  onOpen: (code: string, version: string) => void;
};

export const DraftsList = ({ draftClient, isAseloStaff, onOpen }: Props) => {
  const [drafts, setDrafts] = useState<DraftSummary[]>();

  useEffect(() => {
    draftClient
      .list()
      .then((list) =>
        setDrafts(
          [...list].sort((a, b) =>
            a.meta.status === b.meta.status
              ? b.meta.updatedAt.localeCompare(a.meta.updatedAt)
              : a.meta.status === 'submitted'
                ? -1
                : 1,
          ),
        ),
      )
      .catch(() => setDrafts([]));
  }, [draftClient]);

  if (!drafts || drafts.length === 0) return null;

  return (
    <section className="panel drafts-list">
      <h2>{isAseloStaff ? 'Drafts' : 'Your drafts'}</h2>
      <table className="status-table">
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
          {drafts.map((draft) => (
            <tr key={`${draft.code}/${draft.version}`}>
              <td>
                {draft.code.toUpperCase()} {draft.version}
              </td>
              <td>
                {draft.meta.status === 'submitted' ? (
                  <span className="badge badge-new">
                    Submitted{draft.meta.submittedBy ? ` by ${draft.meta.submittedBy}` : ''}
                  </span>
                ) : (
                  <span className="badge badge-edited">In progress</span>
                )}
              </td>
              <td>
                {draft.meta.updatedBy}, {new Date(draft.meta.updatedAt).toLocaleString()}
              </td>
              <td>{draft.changedFiles.length}</td>
              <td>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onOpen(draft.code, draft.version)}
                >
                  {isAseloStaff && draft.meta.status === 'submitted' ? 'Review' : 'Open'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
