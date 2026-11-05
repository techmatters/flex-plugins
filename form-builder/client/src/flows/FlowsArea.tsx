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
 * (?area=flows&board=usnm/1a2b3c4d), so it can be linked to and survives a page reload
 * (flowsSlice.ts).
 */
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { FlowsHome } from './FlowsHome';
import { Loading } from '../common/Loading';
import { BoardEditor } from './BoardEditor';
import { openBoard, selectFlows, startFlowsArea } from './flowsSlice';
import { selectBoard } from './boardSlice';
import './flows.css';

export const FlowsArea = () => {
  const dispatch = useAppDispatch();
  const { started, open, openError } = useAppSelector(selectFlows);
  const { board, opened } = useAppSelector(selectBoard);

  useEffect(() => {
    dispatch(startFlowsArea());
  }, [dispatch]);

  if (!started) return null;

  if (!open) return <FlowsHome />;

  if (openError) {
    return (
      <main className="empty-state">
        <div className="alert alert-error">{openError}</div>
        <button type="button" className="link-button" onClick={() => dispatch(openBoard(undefined))}>
          ← Boards
        </button>
      </main>
    );
  }

  if (!board)
    return (
      <main className="empty-state">
        <Loading text="Loading the board…" />
      </main>
    );

  return <BoardEditor key={opened} />;
};
