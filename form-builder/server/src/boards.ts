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
 * Flow designer boards (see docs/flow-designer.md), one JSON file each:
 *
 *   <root>/<code>/<id>.json       a helpline's board
 *   <root>/_templates/<id>.json   an Aselo template
 *
 * newLocalBoardStore keeps them in a folder (form-builder/boards, gitignored) for local use; the
 * deployed version uses the same layout under boards/ in the private, versioned drafts bucket.
 */
import { promises as fs } from 'fs';
import path from 'path';

import {
  type Board,
  type BoardContent,
  type BoardSummary,
  isImportedBoard,
  statusOf,
  TEMPLATES_CODE,
} from '@tech-matters/form-builder-shared/flows/model';
import { isDesignStatus } from '@tech-matters/form-builder-shared/designStatus';

export interface BoardStore {
  get(code: string, id: string): Promise<Board | undefined>;
  put(board: Board): Promise<void>;
  remove(code: string, id: string): Promise<void>;
  list(): Promise<BoardSummary[]>;
}

const CODE_PATTERN = /^[a-z0-9]+$/;
const ID_PATTERN = /^[a-z0-9-]{4,40}$/;

export const isValidBoardKey = (code: string, id: string) =>
  (code === TEMPLATES_CODE || CODE_PATTERN.test(code)) && ID_PATTERN.test(id);

export const summaryOf = ({ code, id, meta, content }: Board): BoardSummary => ({
  code,
  id,
  meta,
  title: content.title,
  status: statusOf(content),
  isNew: !isImportedBoard(content),
});

const isArrayOfObjects = (value: unknown) =>
  Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null);

// Only the shape that matters to the API; the canvas owns the details
export const isBoardContent = (value: unknown): value is BoardContent => {
  const candidate = value as BoardContent;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof candidate.schemaVersion === 'number' &&
    typeof candidate.title === 'string' &&
    (candidate.status === undefined || isDesignStatus(candidate.status)) &&
    (candidate.flow === undefined || (typeof candidate.flow === 'object' && candidate.flow !== null)) &&
    (candidate.ignoredChecks === undefined ||
      (Array.isArray(candidate.ignoredChecks) && candidate.ignoredChecks.every(key => typeof key === 'string'))) &&
    (candidate.testedPaths === undefined || isArrayOfObjects(candidate.testedPaths)) &&
    ['frames', 'objects', 'connections', 'stickies'].every(key =>
      isArrayOfObjects(candidate[key as keyof BoardContent]),
    )
  );
};

export const newLocalBoardStore = (rootDir: string): BoardStore => {
  const fileOf = (code: string, id: string) => {
    if (!isValidBoardKey(code, id)) throw new Error(`Invalid board ${code}/${id}`);
    return path.join(rootDir, code, `${id}.json`);
  };

  const get = async (code: string, id: string): Promise<Board | undefined> => {
    try {
      return JSON.parse(await fs.readFile(fileOf(code, id), 'utf8')) as Board;
    } catch {
      return undefined;
    }
  };

  const put = async (board: Board): Promise<void> => {
    const file = fileOf(board.code, board.id);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(board, null, 2)}\n`);
  };

  const remove = async (code: string, id: string): Promise<void> => {
    await fs.rm(fileOf(code, id), { force: true });
  };

  const list = async (): Promise<BoardSummary[]> => {
    const summaries: BoardSummary[] = [];
    const codes = await fs.readdir(rootDir, { withFileTypes: true }).catch(() => []);
    for (const codeEntry of codes.filter(entry => entry.isDirectory())) {
      const files = await fs.readdir(path.join(rootDir, codeEntry.name)).catch(() => []);
      for (const fileName of files.filter(name => name.endsWith('.json'))) {
        const id = fileName.slice(0, -'.json'.length);
        if (!isValidBoardKey(codeEntry.name, id)) continue;
        const board = await get(codeEntry.name, id);
        if (board) summaries.push(summaryOf(board));
      }
    }
    return summaries;
  };

  return { get, put, remove, list };
};

/**
 * Keeps boards in memory; used by tests.
 */
export const newMemoryBoardStore = (): BoardStore => {
  const boards = new Map<string, Board>();

  const get = async (code: string, id: string) => {
    const board = boards.get(`${code}/${id}`);
    return board ? structuredClone(board) : undefined;
  };

  const put = async (board: Board) => {
    boards.set(`${board.code}/${board.id}`, structuredClone(board));
  };

  const remove = async (code: string, id: string) => {
    boards.delete(`${code}/${id}`);
  };

  const list = async () => {
    return [...boards.values()].map(summaryOf);
  };

  return { get, put, remove, list };
};
