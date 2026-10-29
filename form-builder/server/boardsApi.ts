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
 * The flow designer's routes, called from api.ts:
 *
 *   GET    /api/boards                 boards this person can see, and the Aselo templates
 *   POST   /api/boards/:code           new board ({ title, copyFrom?: { code, id } } or { title, content },
 *                                      e.g. an imported helpline)
 *   GET    /api/boards/:code/:id       a board
 *   PUT    /api/boards/:code/:id       save ({ expectedRevision, content }); 409 if someone else saved
 *   DELETE /api/boards/:code/:id       Aselo staff only
 *   GET    /api/people/:code           who can be assigned tasks: a helpline's people, or _aselo
 *   PUT    /api/people/:code           replace the list ({ people: [{ name, email }] })
 *
 * Helpline staff see and edit their own helplines' boards and people, and can copy the
 * templates. Only Aselo staff change the templates (code _templates) and the Aselo team's list,
 * or delete boards. Opening a board adds the person to their list (see people.ts).
 */
import { randomUUID } from 'crypto';
import type { Board, BoardContent } from '../src/flows/model';
import { emptyBoard, statusOf, TEMPLATES_CODE } from '../src/flows/model';
import { STATUS_AFTER_CHANGE } from '../src/designStatus';
import type { ApiResponse, ApiUser } from './api';
import { BoardStore, isBoardContent, isValidBoardKey } from './boards';
import { ASELO_PEOPLE_CODE, isValidPeopleCode, normalizePeople, PeopleStore, registerPerson } from './people';

// Boards are saved whole on every change; this keeps a runaway board from filling the bucket
const MAX_BOARD_BYTES = 2_000_000;

const ok = (body: unknown, status = 200): ApiResponse => ({ status, body });
const fail = (status: number, message: string, extra: object = {}): ApiResponse => ({
  status,
  body: { message, ...extra },
});

const isStaff = (user: ApiUser) => user.role === 'aselo-staff';

const canSee = (user: ApiUser, code: string) =>
  code === TEMPLATES_CODE || user.helplines === 'all' || user.helplines.includes(code);

// For now helpline staff see their helpline's boards but don't change them (Aselo staff do)
const canEdit = (user: ApiUser, code: string) => isStaff(user) && canSee(user, code);

const newBoardId = () => randomUUID().slice(0, 8);

export type FlowStores = { boards: BoardStore; people?: PeopleStore };

type CreateBody = { title?: unknown; copyFrom?: { code?: unknown; id?: unknown }; content?: unknown };
type SaveBody = { expectedRevision?: unknown; content?: unknown };

const handlePeopleRequest = async (
  people: PeopleStore | undefined,
  method: string,
  code: string,
  body: unknown,
  user: ApiUser,
): Promise<ApiResponse> => {
  if (!people) return fail(501, "The people lists aren't set up here.");
  if (!isValidPeopleCode(code)) return fail(400, `Invalid helpline ${code}`);
  const isAseloList = code === ASELO_PEOPLE_CODE;
  if (!isAseloList && !canSee(user, code)) return fail(403, `You don't have access to ${code}.`);
  if (method === 'GET') return ok(await people.get(code));
  if (method === 'PUT') {
    if (isAseloList && !isStaff(user)) return fail(403, "Only Aselo staff change the Aselo team's list.");
    const list = normalizePeople((body as { people?: unknown } | undefined)?.people);
    if (!list) return fail(400, 'Each person needs a name, and a valid email if there is one.');
    await people.put(code, list);
    return ok(list);
  }
  return fail(404, `Unknown API route ${method} /api/people/${code}`);
};

export const handleBoardRequest = async (
  { boards, people }: FlowStores,
  method: string,
  path: string,
  body: unknown,
  user: ApiUser,
  now: string,
): Promise<ApiResponse> => {
  const peopleMatch = path.match(/^\/api\/people\/([^/]+)$/);
  if (peopleMatch) return handlePeopleRequest(people, method, peopleMatch[1], body, user);

  if (method === 'GET' && path === '/api/boards') {
    const summaries = await boards.list();
    return ok(
      summaries
        .filter((summary) => canSee(user, summary.code))
        .sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt)),
    );
  }

  const createMatch = path.match(/^\/api\/boards\/([^/]+)$/);
  if (method === 'POST' && createMatch) {
    const [, code] = createMatch;
    if (!canEdit(user, code)) return fail(403, 'Only Aselo staff add boards for now.');
    const { title, copyFrom, content: given } = (body ?? {}) as CreateBody;
    if (typeof title !== 'string' || !title.trim()) return fail(400, 'A board needs a title.');

    let content: BoardContent = { ...emptyBoard(title.trim()), status: STATUS_AFTER_CHANGE };
    if (given !== undefined) {
      if (!isBoardContent(given)) return fail(400, 'Invalid board');
      if (JSON.stringify(given).length > MAX_BOARD_BYTES) return fail(413, 'This board is too big to save.');
      // An imported helpline starts "Imported"; anything else given is a new design
      content = { ...given, title: title.trim(), status: statusOf(given) };
    } else if (copyFrom) {
      const fromCode = String(copyFrom.code);
      const fromId = String(copyFrom.id);
      if (!isValidBoardKey(fromCode, fromId) || !canSee(user, fromCode)) return fail(403, "You can't copy that board.");
      const source = await boards.get(fromCode, fromId);
      if (!source) return fail(404, 'The board to copy no longer exists.');
      // A copy is a new design, whatever the template's status
      content = { ...source.content, title: title.trim(), status: STATUS_AFTER_CHANGE };
    }

    let id = newBoardId();
    while (await boards.get(code, id)) id = newBoardId();
    if (!isValidBoardKey(code, id)) return fail(400, `Invalid helpline ${code}`);
    const board: Board = {
      code,
      id,
      meta: { revision: 1, createdAt: now, createdBy: user.name, updatedAt: now, updatedBy: user.name },
      content,
    };
    await boards.put(board);
    return ok(board, 201);
  }

  const boardMatch = path.match(/^\/api\/boards\/([^/]+)\/([^/]+)$/);
  if (!boardMatch) return fail(404, `Unknown API route ${method} ${path}`);
  const [, code, id] = boardMatch;
  if (!isValidBoardKey(code, id)) return fail(400, `Invalid board ${code}/${id}`);
  if (!canSee(user, code)) return fail(403, `You don't have access to ${code}.`);
  const existing = await boards.get(code, id);

  if (method === 'GET') {
    if (!existing) return fail(404, 'This board no longer exists.');
    // Whoever opens a board can be assigned its tasks: Aselo staff on the Aselo list, helpline
    // staff on their helpline's. A failure here doesn't stop the board from opening.
    const listCode = isStaff(user) ? ASELO_PEOPLE_CODE : code;
    if (people && listCode !== TEMPLATES_CODE) {
      await registerPerson(people, listCode, { name: user.name, ...(user.email ? { email: user.email } : {}) }).catch(
        (err) => {
          // eslint-disable-next-line no-console
          console.error(`[form-builder] Could not add ${user.name} to the ${listCode} people list:`, err);
        },
      );
    }
    return ok(existing);
  }

  if (method === 'PUT') {
    if (!canEdit(user, code)) return fail(403, 'Only Aselo staff change boards for now.');
    if (!existing) return fail(404, 'This board no longer exists.');
    const { expectedRevision, content } = (body ?? {}) as SaveBody;
    if (typeof expectedRevision !== 'number' || !isBoardContent(content)) return fail(400, 'Invalid board');
    if (JSON.stringify(content).length > MAX_BOARD_BYTES) {
      return fail(413, 'This board is too big to save. Split it into several boards.');
    }
    if (expectedRevision !== existing.meta.revision) {
      return fail(409, 'This board was changed by someone else.', {
        updatedBy: existing.meta.updatedBy,
        updatedAt: existing.meta.updatedAt,
        revision: existing.meta.revision,
      });
    }
    const saved: Board = {
      ...existing,
      meta: { ...existing.meta, revision: existing.meta.revision + 1, updatedAt: now, updatedBy: user.name },
      content,
    };
    await boards.put(saved);
    return ok(saved.meta);
  }

  if (method === 'DELETE') {
    if (!isStaff(user)) return fail(403, 'Only Aselo staff can delete boards.');
    if (existing) await boards.remove(code, id);
    return ok({ deleted: true });
  }

  return fail(404, `Unknown API route ${method} ${path}`);
};
