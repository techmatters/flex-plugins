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
 * The flow designer's start page: the boards this person can open, grouped by helpline, the
 * Aselo templates, and a form to start a new board (empty, or as a copy of a template).
 */
import { useEffect, useState } from 'react';
import type { BoardClient } from './boardClient';
import { BoardSummary, TEMPLATES_CODE } from './model';
import { PeopleManager } from './PeopleManager';
import { ImportHelpline } from './ImportHelpline';

type Props = {
  client: BoardClient;
  // Helplines this person can add boards to
  helplineCodes: string[];
  isAseloStaff: boolean;
  onOpen: (code: string, id: string) => void;
};

const labelOf = (code: string) => (code === TEMPLATES_CODE ? 'Aselo templates' : code.toUpperCase());

export const FlowsHome = ({ client, helplineCodes, isAseloStaff, onOpen }: Props) => {
  const [boards, setBoards] = useState<BoardSummary[]>();
  const [error, setError] = useState<string>();
  const [code, setCode] = useState(helplineCodes.length === 1 ? helplineCodes[0] : '');
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('');
  const [creating, setCreating] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    client
      .list()
      .then(setBoards)
      .catch((err: Error) => setError(err.message));
  }, [client, reloadCount]);

  const templates = (boards ?? []).filter((board) => board.code === TEMPLATES_CODE);
  const codes = [...new Set((boards ?? []).map((board) => board.code))].sort((a, b) =>
    a === TEMPLATES_CODE ? 1 : b === TEMPLATES_CODE ? -1 : a.localeCompare(b),
  );
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

  return (
    <main className="flows-home">
      <h2>Contact flows</h2>
      <p className="field-hint">
        Design how calls and messages are handled before they reach a counselor, together with the helpline team. Each
        board holds frames, one per flow (for example “Voice: pre-queue”).
      </p>

      {error && <div className="alert alert-error">{error}</div>}

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

      {!boards && !error && <p>Loading boards…</p>}
      {boards && boards.length === 0 && <p>No boards yet.</p>}
      {codes.map((boardCode) => (
        <section key={boardCode} className="flows-group">
          <h3>{labelOf(boardCode)}</h3>
          <ul className="flows-list">
            {(boards ?? [])
              .filter((board) => board.code === boardCode)
              .map((board) => (
                <li key={board.id}>
                  <button type="button" className="link-button flows-open" onClick={() => onOpen(board.code, board.id)}>
                    {board.title}
                  </button>
                  <span className="field-hint">
                    Last change by {board.meta.updatedBy}, {new Date(board.meta.updatedAt).toLocaleString()}
                  </span>
                  {isAseloStaff && (
                    <button type="button" className="link-button danger" onClick={() => remove(board)}>
                      Delete
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ))}
      {isAseloStaff && <ImportHelpline client={client} helplineCodes={helplineCodes} onOpen={onOpen} />}
      <PeopleManager client={client} helplineCodes={helplineCodes} isAseloStaff={isAseloStaff} />
    </main>
  );
};
