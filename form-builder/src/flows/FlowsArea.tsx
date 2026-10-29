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
 * The Flows area: the list of boards, or the open board. The open board is in the address
 * (?area=flows&board=usnm/1a2b3c4d), so it can be linked to and survives a page reload.
 */
import { useEffect, useState } from 'react';
import { BoardClient, httpBoardClient } from './boardClient';
import { Board, TEMPLATES_CODE } from './model';
import { FlowsHome } from './FlowsHome';
import { BoardEditor } from './BoardEditor';
import './flows.css';

type Props = {
  client?: BoardClient;
  helplineCodes: string[];
  // Acting as Aselo staff (not "viewing as helpline staff")
  staffMode: boolean;
  userName: string;
  userEmail?: string;
};

type Open = { code: string; id: string };

const openFromUrl = (): Open | undefined => {
  const [code, id] = (new URLSearchParams(window.location.search).get('board') ?? '').split('/');
  return code && id ? { code, id } : undefined;
};

const setBoardInUrl = (open?: Open) => {
  const params = new URLSearchParams(window.location.search);
  params.set('area', 'flows');
  if (open) params.set('board', `${open.code}/${open.id}`);
  else params.delete('board');
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
};

export const FlowsArea = ({ client = httpBoardClient, helplineCodes, staffMode, userName, userEmail }: Props) => {
  const [open, setOpen] = useState<Open | undefined>(openFromUrl);
  const [board, setBoard] = useState<Board>();
  const [error, setError] = useState<string>();
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    setBoardInUrl(open);
    setBoard(undefined);
    setError(undefined);
    if (!open) return;
    client
      .load(open.code, open.id)
      .then(setBoard)
      .catch((err: Error) => setError(err.message));
  }, [client, open, loadCount]);

  if (!open) {
    return (
      <FlowsHome
        client={client}
        helplineCodes={helplineCodes}
        isAseloStaff={staffMode}
        onOpen={(code, id) => setOpen({ code, id })}
      />
    );
  }

  if (error) {
    return (
      <main className="empty-state">
        <div className="alert alert-error">{error}</div>
        <button type="button" className="link-button" onClick={() => setOpen(undefined)}>
          ← Boards
        </button>
      </main>
    );
  }

  if (!board) return <main className="empty-state">Loading the board…</main>;

  return (
    <BoardEditor
      key={`${board.code}/${board.id}/${loadCount}`}
      board={board}
      client={client}
      // For now helpline staff see boards without changing them
      readOnly={!staffMode}
      staffMode={staffMode}
      userName={userName}
      userEmail={userEmail}
      onClose={() => setOpen(undefined)}
      onReload={() => setLoadCount((count) => count + 1)}
    />
  );
};
