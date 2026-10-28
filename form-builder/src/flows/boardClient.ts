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
 * Talks to the flow designer's API routes (server/boardsApi.ts). Tests run the same server code
 * in process through clientFor's Send.
 */
import { apiFetch } from '../auth';
import type { Send } from '../draftClient';
import type { Board, BoardContent, BoardMeta, BoardSummary, Person } from './model';

export type BoardSaveOutcome =
  { ok: true; meta: BoardMeta } | { ok: false; conflict: { updatedBy?: string; updatedAt?: string } };

export type BoardClient = {
  list(): Promise<BoardSummary[]>;
  create(code: string, title: string, copyFrom?: { code: string; id: string }): Promise<Board>;
  load(code: string, id: string): Promise<Board>;
  save(code: string, id: string, expectedRevision: number, content: BoardContent): Promise<BoardSaveOutcome>;
  remove(code: string, id: string): Promise<void>;
  // Who can be assigned tasks: a helpline's people, or the Aselo team's (code _aselo)
  people(code: string): Promise<Person[]>;
  savePeople(code: string, people: Person[]): Promise<Person[]>;
};

export const boardClientFor = (send: Send): BoardClient => {
  const expectOk = async (method: string, path: string, body?: unknown) => {
    const response = await send(method, path, body);
    if (response.status >= 400) {
      throw new Error(response.body?.message ?? `Request failed (${response.status})`);
    }
    return response.body;
  };
  return {
    list: () => expectOk('GET', '/api/boards'),
    create: (code, title, copyFrom) => expectOk('POST', `/api/boards/${code}`, { title, copyFrom }),
    load: (code, id) => expectOk('GET', `/api/boards/${code}/${id}`),
    async save(code, id, expectedRevision, content) {
      const response = await send('PUT', `/api/boards/${code}/${id}`, { expectedRevision, content });
      if (response.status === 409) {
        return { ok: false, conflict: { updatedBy: response.body?.updatedBy, updatedAt: response.body?.updatedAt } };
      }
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not save the board');
      return { ok: true, meta: response.body };
    },
    remove: async (code, id) => {
      await expectOk('DELETE', `/api/boards/${code}/${id}`);
    },
    people: (code) => expectOk('GET', `/api/people/${code}`),
    savePeople: (code, people) => expectOk('PUT', `/api/people/${code}`, { people }),
  };
};

export const httpBoardClient: BoardClient = boardClientFor(async (method, path, body) => {
  const response = await apiFetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => undefined) };
});
