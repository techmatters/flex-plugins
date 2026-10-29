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
 * The flow designer's start page: one table of the helplines' boards with where each one is (its
 * status, see designStatus.ts), a form to start a new board (empty, or as a copy of a template),
 * importing a live helpline, and the Aselo templates.
 */
import { useEffect, useState } from 'react';
import { HelplineFilter } from '../components/HelplineFilter';
import type { BoardClient } from './boardClient';
import { BoardSummary, TEMPLATES_CODE } from './model';
import type { DesignStatus } from '../designStatus';
import { statusLabel } from '../designStatus';
import { DesignStatusBadge } from '../components/DesignStatusPicker';
import { PeopleManager } from './PeopleManager';
import { ImportHelpline } from './ImportHelpline';

type Props = {
  client: BoardClient;
  // Helplines this person can add boards to
  helplineCodes: string[];
  isAseloStaff: boolean;
  onOpen: (code: string, id: string) => void;
};

type Filter = 'all' | DesignStatus;

// In the order a design goes through them; Imported last, as there's nothing to do there yet
const FILTERS: Filter[] = ['all', 'in-progress', 'ready', 'implemented', 'imported'];

const filterLabel = (filter: Filter) => (filter === 'all' ? 'All' : statusLabel(filter));

const labelOf = (code: string) => (code === TEMPLATES_CODE ? 'Aselo templates' : code.toUpperCase());

const lastChange = (board: BoardSummary) =>
  `${board.meta.updatedBy}, ${new Date(board.meta.updatedAt).toLocaleString()}`;

export const FlowsHome = ({ client, helplineCodes, isAseloStaff, onOpen }: Props) => {
  const [boards, setBoards] = useState<BoardSummary[]>();
  const [error, setError] = useState<string>();
  const [code, setCode] = useState(helplineCodes.length === 1 ? helplineCodes[0] : '');
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('');
  const [creating, setCreating] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [helpline, setHelpline] = useState('');

  useEffect(() => {
    client
      .list()
      .then(setBoards)
      .catch((err: Error) => setError(err.message));
  }, [client, reloadCount]);

  const templates = (boards ?? []).filter((board) => board.code === TEMPLATES_CODE);
  const helplineBoards = (boards ?? []).filter((board) => board.code !== TEMPLATES_CODE);
  const matches = (board: BoardSummary, candidate: Filter) => candidate === 'all' || board.status === candidate;
  const inHelpline = helplineBoards.filter((board) => !helpline || board.code === helpline);
  const shown = inHelpline.filter((board) => matches(board, filter));
  const targetCodes = isAseloStaff ? [...helplineCodes, TEMPLATES_CODE] : helplineCodes;

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code || !title.trim()) return;
    setCreating(true);
    setError(undefined);
    try {
      const copyFrom = template ? { code: TEMPLATES_CODE, id: template } : undefined;
      const board = await client.create(code, title.trim(), copyFrom);
      onOpen(board.code, board.id);
    } catch (err) {
      setError((err as Error).message);
      setCreating(false);
    }
  };

  const remove = async (board: BoardSummary) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete the board “${board.title}”? It can only be recovered by the Aselo team.`)) return;
    try {
      await client.remove(board.code, board.id);
      setReloadCount((count) => count + 1);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openButton = (board: BoardSummary) => (
    <button type="button" className="link-button flows-open" onClick={() => onOpen(board.code, board.id)}>
      {board.title}
    </button>
  );

  const deleteCell = (board: BoardSummary) =>
    isAseloStaff && (
      <td className="area-home-open">
        <button
          type="button"
          className="link-button danger"
          aria-label={`Delete ${board.title}`}
          onClick={() => remove(board)}
        >
          Delete
        </button>
      </td>
    );

  return (
    <main className="flows-home area-home">
      <h2>Contact flows</h2>
      <p className="field-hint area-home-intro">
        Design how calls and messages are handled before they reach a counselor, together with the helpline team, then
        mark the board “Ready for Claude” to have it built.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {isAseloStaff && (
        <div className="area-home-actions">
          <form className="flows-new" onSubmit={create}>
            <h3>New board</h3>
            <label className="field">
              <span className="field-label">For</span>
              <select value={code} onChange={(e) => setCode(e.target.value)} required>
                <option value="">Choose…</option>
                {targetCodes.map((candidate) => (
                  <option key={candidate} value={candidate}>
                    {labelOf(candidate)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Title</span>
              <input
                type="text"
                value={title}
                placeholder="e.g. USNM contact flows"
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            {templates.length > 0 && (
              <label className="field">
                <span className="field-label">Start from</span>
                <select value={template} onChange={(e) => setTemplate(e.target.value)}>
                  <option value="">An empty board</option>
                  {templates.map((board) => (
                    <option key={board.id} value={board.id}>
                      Template: {board.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="submit" className="primary-button" disabled={creating || !code || !title.trim()}>
              {creating ? 'Creating…' : 'Create board'}
            </button>
          </form>
          <ImportHelpline client={client} helplineCodes={helplineCodes} onOpen={onOpen} />
        </div>
      )}

      {!boards && !error && <p>Loading boards…</p>}
      {boards && (
        <section aria-label="Boards">
          <div className="area-home-filters">
            <HelplineFilter codes={helplineBoards.map((board) => board.code)} value={helpline} onChange={setHelpline} />
            <div className="area-home-filter" role="group" aria-label="Show boards">
              {FILTERS.map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  className={filter === candidate ? 'active' : ''}
                  aria-pressed={filter === candidate}
                  onClick={() => setFilter(candidate)}
                >
                  {filterLabel(candidate)} ({inHelpline.filter((board) => matches(board, candidate)).length})
                </button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="field-hint">
              {helplineBoards.length === 0 ? 'No boards yet.' : 'No boards with this status.'}
            </p>
          ) : (
            <table className="area-home-table">
              <thead>
                <tr>
                  <th>Helpline</th>
                  <th>Board</th>
                  <th>Status</th>
                  <th>Last change</th>
                  {isAseloStaff && <th aria-label="Delete" />}
                </tr>
              </thead>
              <tbody>
                {shown.map((board) => (
                  <tr key={`${board.code}/${board.id}`}>
                    <td>{labelOf(board.code)}</td>
                    <td className="area-home-name">{openButton(board)}</td>
                    <td>
                      <DesignStatusBadge status={board.status} isNew={board.isNew} />
                    </td>
                    <td className="field-hint">{lastChange(board)}</td>
                    {deleteCell(board)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {templates.length > 0 && (
        <section className="flows-templates" aria-label="Aselo templates">
          <h3>Aselo templates</h3>
          <p className="field-hint">Starting points for new boards.</p>
          <table className="area-home-table">
            <thead>
              <tr>
                <th>Template</th>
                <th>Last change</th>
                {isAseloStaff && <th aria-label="Delete" />}
              </tr>
            </thead>
            <tbody>
              {templates.map((board) => (
                <tr key={board.id}>
                  <td className="area-home-name">{openButton(board)}</td>
                  <td className="field-hint">{lastChange(board)}</td>
                  {deleteCell(board)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <PeopleManager client={client} helplineCodes={helplineCodes} isAseloStaff={isAseloStaff} />
    </main>
  );
};
