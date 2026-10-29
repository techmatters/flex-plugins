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
 * LocalBoardStore keeps them in a folder (form-builder/boards, gitignored) for local use; the
 * deployed version uses the same layout under boards/ in the private, versioned drafts bucket.
 */
import { promises as fs } from 'fs';
import path from 'path';
import type { Board, BoardContent, BoardSummary } from '../src/flows/model';
import { isImportedBoard, statusOf, TEMPLATES_CODE } from '../src/flows/model';
import { isDesignStatus } from '../src/designStatus';

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
  Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null);

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
      (Array.isArray(candidate.ignoredChecks) && candidate.ignoredChecks.every((key) => typeof key === 'string'))) &&
    ['frames', 'objects', 'connections', 'stickies'].every((key) =>
      isArrayOfObjects(candidate[key as keyof BoardContent]),
    )
  );
};

export class LocalBoardStore implements BoardStore {
  constructor(private readonly rootDir: string) {}

  private file(code: string, id: string) {
    if (!isValidBoardKey(code, id)) throw new Error(`Invalid board ${code}/${id}`);
    return path.join(this.rootDir, code, `${id}.json`);
  }

  async get(code: string, id: string): Promise<Board | undefined> {
    try {
      return JSON.parse(await fs.readFile(this.file(code, id), 'utf8')) as Board;
    } catch {
      return undefined;
    }
  }

  async put(board: Board): Promise<void> {
    const file = this.file(board.code, board.id);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(board, null, 2)}\n`);
  }

  async remove(code: string, id: string): Promise<void> {
    await fs.rm(this.file(code, id), { force: true });
  }

  async list(): Promise<BoardSummary[]> {
    const summaries: BoardSummary[] = [];
    const codes = await fs.readdir(this.rootDir, { withFileTypes: true }).catch(() => []);
    for (const codeEntry of codes.filter((entry) => entry.isDirectory())) {
      const files = await fs.readdir(path.join(this.rootDir, codeEntry.name)).catch(() => []);
      for (const fileName of files.filter((name) => name.endsWith('.json'))) {
        const id = fileName.slice(0, -'.json'.length);
        if (!isValidBoardKey(codeEntry.name, id)) continue;
        const board = await this.get(codeEntry.name, id);
        if (board) summaries.push(summaryOf(board));
      }
    }
    return summaries;
  }
}

/**
 * Keeps boards in memory; used by tests.
 */
export class MemoryBoardStore implements BoardStore {
  private boards = new Map<string, Board>();

  async get(code: string, id: string) {
    const board = this.boards.get(`${code}/${id}`);
    return board ? structuredClone(board) : undefined;
  }

  async put(board: Board) {
    this.boards.set(`${board.code}/${board.id}`, structuredClone(board));
  }

  async remove(code: string, id: string) {
    this.boards.delete(`${code}/${id}`);
  }

  async list() {
    return [...this.boards.values()].map(summaryOf);
  }
}
