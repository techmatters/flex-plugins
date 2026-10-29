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

import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Board, BoardContent, BoardSummary } from '../src/flows/model';
import { emptyBoard } from '../src/flows/model';
import { ApiContext, ApiUser, handleApiRequest } from './api';
import { LocalBoardStore, MemoryBoardStore } from './boards';
import { MemoryPeopleStore } from './people';
import { MemoryDraftStore } from './drafts';
import { S3BoardStore } from './s3BoardStore';

const formDefinitionsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../lambdas/packages/hrm-form-definitions/form-definitions',
);

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

let context: ApiContext;
const call = (user: ApiUser, method: string, apiPath: string, body?: unknown) =>
  handleApiRequest(context, { method, path: apiPath, body, user });

const create = async (user: ApiUser, code: string, title: string, copyFrom?: object) => {
  const response = await call(user, 'POST', `/api/boards/${code}`, { title, copyFrom });
  expect(response.status).toBe(201);
  return response.body as Board;
};

const withFrame = (content: BoardContent): BoardContent => ({
  ...content,
  frames: [{ id: 'f-1', title: 'Voice: pre-queue', x: 0, y: 0, width: 900, height: 600, channel: 'voice' }],
});

beforeEach(() => {
  context = {
    formDefinitionsDir,
    drafts: new MemoryDraftStore(),
    boards: new MemoryBoardStore(),
    people: new MemoryPeopleStore(),
    notifier: { draftSubmitted: vi.fn(async () => {}) },
    now: () => new Date('2026-10-28T12:00:00Z'),
  };
});

describe('boards', () => {
  test('are created, saved and listed, and a stale save is refused', async () => {
    const board = await create(staff, 'usnm', 'USNM contact flows');
    expect(board.meta).toMatchObject({ revision: 1, createdBy: 'Aselo person' });
    // A new board is being designed
    expect(board.content).toEqual({ ...emptyBoard('USNM contact flows'), status: 'in-progress' });

    const saved = await call(staff, 'PUT', `/api/boards/usnm/${board.id}`, {
      expectedRevision: 1,
      content: withFrame(board.content),
    });
    expect(saved).toMatchObject({ status: 200, body: { revision: 2, updatedBy: 'Aselo person' } });

    // Someone saved in between: refused, saying who
    const otherStaff: ApiUser = { ...staff, name: 'Other Aselo person' };
    const stale = await call(otherStaff, 'PUT', `/api/boards/usnm/${board.id}`, {
      expectedRevision: 1,
      content: board.content,
    });
    expect(stale).toMatchObject({ status: 409, body: { updatedBy: 'Aselo person', revision: 2 } });

    const loaded = (await call(staff, 'GET', `/api/boards/usnm/${board.id}`)).body as Board;
    expect(loaded.content.frames).toHaveLength(1);
    const list = (await call(staff, 'GET', '/api/boards')).body as BoardSummary[];
    expect(list.map((summary) => [summary.code, summary.title, summary.status, summary.isNew])).toEqual([
      ['usnm', 'USNM contact flows', 'in-progress', true],
    ]);
  });

  test('carry a status, set by Aselo staff and listed; boards saved before statuses get one', async () => {
    const board = await create(staff, 'usnm', 'USNM flows');
    const ready = await call(staff, 'PUT', `/api/boards/usnm/${board.id}`, {
      expectedRevision: 1,
      content: { ...board.content, status: 'ready' },
    });
    expect(ready.status).toBe(200);
    let [summary] = (await call(usnmStaff, 'GET', '/api/boards')).body as BoardSummary[];
    expect(summary).toMatchObject({ status: 'ready', isNew: true });

    // Helpline staff can't change it
    const byHelpline = await call(usnmStaff, 'PUT', `/api/boards/usnm/${board.id}`, {
      expectedRevision: 2,
      content: { ...board.content, status: 'implemented' },
    });
    expect(byHelpline.status).toBe(403);
    expect(
      (
        await call(staff, 'PUT', `/api/boards/usnm/${board.id}`, {
          expectedRevision: 2,
          content: { ...board.content, status: 'done' },
        })
      ).status,
    ).toBe(400);

    // Saved before statuses: imported boards (frames read from Studio) are "Imported", others "In progress"
    const old = withFrame(emptyBoard('USNM flows'));
    await context.boards!.put({
      ...board,
      meta: { ...board.meta, revision: 3 },
      content: {
        ...old,
        frames: old.frames.map((frame) => ({
          ...frame,
          studio: { template: 'usnm/templates/studio-flows/voice.tftpl', channels: ['voice'], settings: {} },
        })),
      },
    });
    [summary] = (await call(staff, 'GET', '/api/boards')).body as BoardSummary[];
    expect(summary).toMatchObject({ status: 'imported', isNew: false });
    await context.boards!.put({ ...board, content: old });
    [summary] = (await call(staff, 'GET', '/api/boards')).body as BoardSummary[];
    expect(summary).toMatchObject({ status: 'in-progress', isNew: true });
  });

  test('helpline staff only view their own helplines and the templates, and change none of them', async () => {
    const usnm = await create(staff, 'usnm', 'USNM flows');
    const usch = await create(staff, 'usch', 'USCH flows');
    const template = await create(staff, '_templates', 'Standard pre-queue flow');

    // Their own helpline: listed and opened, but not added to or saved
    expect((await call(usnmStaff, 'GET', `/api/boards/usnm/${usnm.id}`)).status).toBe(200);
    expect((await call(usnmStaff, 'POST', '/api/boards/usnm', { title: 'Mine' })).status).toBe(403);
    expect(
      (
        await call(usnmStaff, 'PUT', `/api/boards/usnm/${usnm.id}`, {
          expectedRevision: 1,
          content: withFrame(usnm.content),
        })
      ).status,
    ).toBe(403);
    expect(((await call(staff, 'GET', `/api/boards/usnm/${usnm.id}`)).body as Board).meta.revision).toBe(1);

    expect((await call(usnmStaff, 'POST', '/api/boards/usch', { title: 'Mine' })).status).toBe(403);
    expect((await call(usnmStaff, 'GET', `/api/boards/usch/${usch.id}`)).status).toBe(403);
    const list = (await call(usnmStaff, 'GET', '/api/boards')).body as BoardSummary[];
    expect(list.map((summary) => summary.code).sort()).toEqual(['_templates', 'usnm']);

    expect((await call(usnmStaff, 'GET', `/api/boards/_templates/${template.id}`)).status).toBe(200);
    expect(
      (
        await call(usnmStaff, 'PUT', `/api/boards/_templates/${template.id}`, {
          expectedRevision: 1,
          content: template.content,
        })
      ).status,
    ).toBe(403);
    expect((await call(usnmStaff, 'POST', '/api/boards/_templates', { title: 'Mine' })).status).toBe(403);
  });

  test('can start as a copy of a template', async () => {
    const template = await create(staff, '_templates', 'Standard pre-queue flow');
    await call(staff, 'PUT', `/api/boards/_templates/${template.id}`, {
      expectedRevision: 1,
      content: withFrame(template.content),
    });

    const copy = await create(staff, 'usnm', 'USNM flows', { code: '_templates', id: template.id });
    expect(copy.content.title).toBe('USNM flows');
    expect(copy.content.frames.map((frame) => frame.title)).toEqual(['Voice: pre-queue']);
    // A new design, whatever the template's status
    expect(copy.content.status).toBe('in-progress');
  });

  test('only Aselo staff delete boards', async () => {
    const board = await create(staff, 'usnm', 'USNM flows');
    expect((await call(usnmStaff, 'DELETE', `/api/boards/usnm/${board.id}`)).status).toBe(403);
    expect((await call(staff, 'DELETE', `/api/boards/usnm/${board.id}`)).status).toBe(200);
    expect((await call(staff, 'GET', `/api/boards/usnm/${board.id}`)).status).toBe(404);
  });

  test('refuse invalid boards and keys', async () => {
    const board = await create(staff, 'usnm', 'USNM flows');
    expect(
      (await call(staff, 'PUT', `/api/boards/usnm/${board.id}`, { expectedRevision: 1, content: { title: 'x' } }))
        .status,
    ).toBe(400);
    expect((await call(staff, 'GET', '/api/boards/usnm/..')).status).toBe(400);
    expect((await call(staff, 'POST', '/api/boards/usnm', { title: '  ' })).status).toBe(400);
  });

  test('people lists: each helpline its own, the Aselo team for Aselo staff, and openers are added', async () => {
    const usnmWithEmail = { ...usnmStaff, email: 'nami.person@example.org' };
    const board = await create(staff, 'usnm', 'USNM flows');
    await call(usnmWithEmail, 'GET', `/api/boards/usnm/${board.id}`);
    await call({ ...staff, email: 'aselo.person@example.org' }, 'GET', `/api/boards/usnm/${board.id}`);
    expect((await call(usnmStaff, 'GET', '/api/people/usnm')).body).toEqual([
      { name: 'NAMI person', email: 'nami.person@example.org' },
    ]);
    expect((await call(usnmStaff, 'GET', '/api/people/_aselo')).body).toEqual([
      { name: 'Aselo person', email: 'aselo.person@example.org' },
    ]);

    // Helpline staff edit their own list, not others' or the Aselo team's
    const list = [
      { name: ' Ale ', email: 'ALE@example.org' },
      { name: 'Ale again', email: 'ale@example.org' },
      { name: 'No email' },
    ];
    expect((await call(usnmStaff, 'PUT', '/api/people/usnm', { people: list })).body).toEqual([
      { name: 'Ale', email: 'ale@example.org' },
      { name: 'No email' },
    ]);
    expect((await call(usnmStaff, 'PUT', '/api/people/usch', { people: [] })).status).toBe(403);
    expect((await call(usnmStaff, 'PUT', '/api/people/_aselo', { people: [] })).status).toBe(403);
    expect((await call(usnmStaff, 'GET', '/api/people/usch')).status).toBe(403);
    expect(
      (await call(staff, 'PUT', '/api/people/usnm', { people: [{ name: 'x', email: 'not an email' }] })).status,
    ).toBe(400);
  });

  test("answer 501 where boards aren't set up", async () => {
    context = { ...context, boards: undefined };
    expect((await call(staff, 'GET', '/api/boards')).status).toBe(501);
  });
});

// Just enough of S3 for the store: objects in a map, listed one per page
const fakeS3 = () => {
  const objects = new Map<string, string>();
  const send = async (command: any): Promise<any> => {
    const { Key, Body, Prefix, ContinuationToken } = command.input;
    if (command instanceof PutObjectCommand) objects.set(Key, Body);
    else if (command instanceof DeleteObjectCommand) objects.delete(Key);
    else if (command instanceof GetObjectCommand) {
      if (!objects.has(Key)) throw Object.assign(new Error('missing'), { name: 'NoSuchKey' });
      return { Body: { transformToString: async () => objects.get(Key) } };
    } else if (command instanceof ListObjectsV2Command) {
      const keys = [...objects.keys()].filter((key) => key.startsWith(Prefix)).sort();
      const index = ContinuationToken ? Number(ContinuationToken) : 0;
      return {
        Contents: keys.slice(index, index + 1).map((key) => ({ Key: key })),
        NextContinuationToken: index + 1 < keys.length ? String(index + 1) : undefined,
      };
    }
    return {};
  };
  return { objects, send } as any;
};

const boardOf = (code: string, id: string): Board => ({
  code,
  id,
  meta: { revision: 1, createdAt: 'then', createdBy: 'someone', updatedAt: 'now', updatedBy: 'someone' },
  content: emptyBoard(`${code} board`),
});

describe('board stores', () => {
  test('S3: boards/<code>/<id>.json, next to the drafts', async () => {
    const s3 = fakeS3();
    s3.objects.set('drafts/usnm/v1/draft.json', '{}');
    const store = new S3BoardStore('bucket', s3);
    await store.put(boardOf('usnm', 'abcd1234'));
    await store.put(boardOf('_templates', 'tmpl0001'));
    expect([...s3.objects.keys()].sort()).toEqual([
      'boards/_templates/tmpl0001.json',
      'boards/usnm/abcd1234.json',
      'drafts/usnm/v1/draft.json',
    ]);
    expect((await store.list()).map((summary) => summary.title).sort()).toEqual(['_templates board', 'usnm board']);
    expect(await store.get('usnm', 'abcd1234')).toEqual(boardOf('usnm', 'abcd1234'));
    await store.remove('usnm', 'abcd1234');
    expect(await store.get('usnm', 'abcd1234')).toBeUndefined();
    await expect(store.get('../x', 'abcd1234')).rejects.toThrow();
  });

  test('local: a folder per helpline', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'boards-'));
    try {
      const store = new LocalBoardStore(dir);
      await store.put(boardOf('usnm', 'abcd1234'));
      expect(await fs.readdir(path.join(dir, 'usnm'))).toEqual(['abcd1234.json']);
      expect((await store.list()).map((summary) => summary.id)).toEqual(['abcd1234']);
      await store.remove('usnm', 'abcd1234');
      expect(await store.list()).toEqual([]);
    } finally {
      await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
    }
  });
});
