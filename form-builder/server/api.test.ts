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
import { ApiContext, ApiUser, handleApiRequest } from './api';
import { LocalDraftStore, MemoryDraftStore } from './drafts';
import { LocalApplier, localUser } from './localServices';

const formDefinitionsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../lambdas/packages/hrm-form-definitions/form-definitions',
);

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

let context: ApiContext;
const call = (user: ApiUser, method: string, apiPath: string, body?: unknown) =>
  handleApiRequest(context, { method, path: apiPath, body, user });

const callerForm = [{ name: 'firstName', label: 'First name', type: 'input' }];
const saveBody = (expectedRevision: number) => ({
  expectedRevision,
  files: { 'tabbedForms/CallerInformationTab.json': callerForm },
  baseHashes: { 'tabbedForms/CallerInformationTab.json': 'abc' },
});

beforeEach(() => {
  context = {
    formDefinitionsDir,
    drafts: new MemoryDraftStore(),
    applier: { apply: vi.fn(async () => ({ description: 'Applied', written: ['x.json'] })) },
    notifier: { draftSubmitted: vi.fn(async () => {}) },
    now: () => new Date('2026-10-26T12:00:00Z'),
  };
});

describe('access', () => {
  test('helpline staff only see and open their own helplines', async () => {
    const helplines = (await call(usnmStaff, 'GET', '/api/helplines')).body as { code: string }[];
    expect(helplines.map((helpline) => helpline.code)).toEqual(['usnm']);
    expect((await call(usnmStaff, 'GET', '/api/definitions/usch/v1')).status).toBe(403);
    expect((await call(usnmStaff, 'PUT', '/api/drafts/usch/v1', saveBody(0))).status).toBe(403);
    expect((await call(staff, 'GET', '/api/definitions/usch/v1')).status).toBe(200);
  });

  test('only Aselo staff can apply', async () => {
    await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(0));
    expect((await call(usnmStaff, 'POST', '/api/drafts/usnm/v1/apply')).status).toBe(403);
    const applied = await call(staff, 'POST', '/api/drafts/usnm/v1/apply');
    expect(applied).toEqual({ status: 200, body: { description: 'Applied', written: ['x.json'] } });
    // Applying uses up the draft
    expect((await call(staff, 'GET', '/api/drafts/usnm/v1')).status).toBe(404);
  });
});

describe('drafts', () => {
  test('saving, and refusing a save based on an older revision', async () => {
    const first = await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(0));
    expect(first.body).toMatchObject({ revision: 1, status: 'editing', updatedBy: 'NAMI person' });

    const stale = await call(staff, 'PUT', '/api/drafts/usnm/v1', saveBody(0));
    expect(stale.status).toBe(409);
    expect(stale.body).toMatchObject({ updatedBy: 'NAMI person', revision: 1 });

    expect((await call(staff, 'PUT', '/api/drafts/usnm/v1', saveBody(1))).body).toMatchObject({
      revision: 2,
    });
    const draft = (await call(usnmStaff, 'GET', '/api/drafts/usnm/v1')).body;
    expect(draft).toMatchObject({ files: { 'tabbedForms/CallerInformationTab.json': callerForm } });
  });

  test('saving with no changes left removes the draft', async () => {
    await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(0));
    await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', { ...saveBody(1), files: {} });
    expect((await call(usnmStaff, 'GET', '/api/drafts/usnm/v1')).status).toBe(404);
  });

  test('rejects file paths outside the version folder', async () => {
    const response = await call(staff, 'PUT', '/api/drafts/usnm/v1', {
      ...saveBody(0),
      files: { '../usch/v1/CallTypeButtons.json': [] },
    });
    expect(response.status).toBe(400);
  });

  test('submitting notifies Aselo; editing afterwards takes it back out of review', async () => {
    await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(0));
    const submitted = await call(usnmStaff, 'POST', '/api/drafts/usnm/v1/submit');
    expect(submitted.body).toMatchObject({ status: 'submitted', submittedBy: 'NAMI person' });
    expect(context.notifier.draftSubmitted).toHaveBeenCalledTimes(1);

    const listed = (await call(staff, 'GET', '/api/drafts')).body as { code: string; meta: { status: string } }[];
    expect(listed).toEqual([expect.objectContaining({ code: 'usnm', meta: expect.objectContaining({ status: 'submitted' }) })]);

    // Submitting doesn't change the content, so it doesn't create a new revision
    const edited = await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(1));
    expect(edited.body).toMatchObject({ status: 'editing', revision: 2 });
  });

  test('Aselo staff mark sections as reviewed; the marks outlast saves and can be undone', async () => {
    const review = (user: ApiUser, body: unknown) => call(user, 'POST', '/api/drafts/usnm/v1/review', body);
    const callerReview = { section: 'contactTab:callerInformation', fingerprint: '1a2b3c' };
    expect((await review(staff, callerReview)).status).toBe(404);

    await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(0));
    expect((await review(usnmStaff, callerReview)).status).toBe(403);
    expect((await review(staff, { ...callerReview, section: '../x' })).status).toBe(400);
    expect((await review(staff, { ...callerReview, fingerprint: 'not hex' })).status).toBe(400);

    const reviewed = await review(staff, callerReview);
    expect(reviewed.body).toMatchObject({
      // Not a content change: no new revision, so nobody editing gets a conflict
      revision: 1,
      reviews: { 'contactTab:callerInformation': { by: 'Aselo person', at: '2026-10-26T12:00:00.000Z', fingerprint: '1a2b3c' } },
    });

    // Saving keeps the marks (the builder works out whether the section changed since)
    const saved = await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(1));
    expect(saved.body).toMatchObject({ revision: 2, reviews: { 'contactTab:callerInformation': { fingerprint: '1a2b3c' } } });

    const undone = await review(staff, { section: 'contactTab:callerInformation', fingerprint: null });
    expect((undone.body as { reviews: unknown }).reviews).toEqual({});

    const needsChanges = await review(staff, { ...callerReview, status: 'changes-needed' });
    expect(needsChanges.body).toMatchObject({
      reviews: { 'contactTab:callerInformation': { status: 'changes-needed', by: 'Aselo person' } },
    });
    expect((await review(staff, { ...callerReview, status: 'approved?' })).status).toBe(400);
  });

  test('anyone on the helpline comments on a section, for someone; comments outlast saves', async () => {
    const comment = (user: ApiUser, body: unknown) => call(user, 'POST', '/api/drafts/usnm/v1/comments', body);
    const ask = { action: 'add', section: 'categories', text: ' Rename “Other” ', assignee: 'NAMI person', assigneeEmail: 'nami@example.org' };
    expect((await comment(staff, ask)).status).toBe(404);

    await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(0));
    expect((await comment(staff, { ...ask, text: '   ' })).status).toBe(400);
    expect((await comment(staff, { ...ask, section: 'no such/section' })).status).toBe(400);
    expect((await comment(staff, { ...ask, action: 'shout' })).status).toBe(400);

    const asked = await comment(staff, ask);
    const [added] = (asked.body as { comments: { id: string }[] }).comments;
    expect(added).toMatchObject({
      section: 'categories',
      text: 'Rename “Other”',
      author: 'Aselo person',
      assignee: 'NAMI person',
      assigneeEmail: 'nami@example.org',
    });

    // The helpline answers and resolves it; a save keeps the comments
    await comment(usnmStaff, { action: 'add', section: 'categories', text: 'Done' });
    await call(usnmStaff, 'PUT', '/api/drafts/usnm/v1', saveBody(1));
    const resolved = await comment(usnmStaff, { action: 'resolve', id: added.id, resolved: true });
    const afterResolve = (resolved.body as { comments: { id: string; resolved?: boolean; author: string }[] }).comments;
    expect(afterResolve).toEqual([
      expect.objectContaining({ id: added.id, resolved: true }),
      expect.objectContaining({ author: 'NAMI person', text: 'Done' }),
    ]);

    // Only its author or Aselo staff delete a comment
    expect((await comment(usnmStaff, { action: 'delete', id: added.id })).status).toBe(403);
    const deleted = await comment(staff, { action: 'delete', id: added.id });
    expect((deleted.body as { comments: unknown[] }).comments).toHaveLength(1);
    expect((await comment(staff, { action: 'resolve', id: 'gone', resolved: true })).status).toBe(404);
  });
});

describe('local services', () => {
  test('LocalDraftStore keeps drafts in a folder, and LocalApplier writes them into the checkout', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'form-builder-'));
    const store = new LocalDraftStore(path.join(tempDir, 'drafts'));
    const draft = {
      code: 'usnm',
      version: 'v1',
      files: { 'tabbedForms/CallerInformationTab.json': callerForm },
      meta: { revision: 1, status: 'editing' as const, updatedAt: 'now', updatedBy: 'me', baseHashes: {} },
    };
    await store.put(draft);
    expect(await store.get('usnm', 'v1')).toEqual(draft);
    expect((await store.list()).map((summary) => summary.changedFiles)).toEqual([
      ['tabbedForms/CallerInformationTab.json'],
    ]);

    const definitionsDir = path.join(tempDir, 'form-definitions');
    const result = await new LocalApplier(definitionsDir, tempDir).apply(draft);
    expect(result.written).toEqual(['form-definitions/usnm/v1/tabbedForms/CallerInformationTab.json']);
    expect(
      JSON.parse(await fs.readFile(path.join(definitionsDir, 'usnm/v1/tabbedForms/CallerInformationTab.json'), 'utf8')),
    ).toEqual(callerForm);

    await store.remove('usnm', 'v1');
    expect(await store.get('usnm', 'v1')).toBeUndefined();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('LocalApplier writes webchat texts into the webchat app, in the style of the file it replaces', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'form-builder-'));
    const webchatDir = path.join(tempDir, 'configSrc');
    const translationsFile = path.join(webchatDir, 'ca/translations/fr-CA.json');
    await fs.mkdir(path.dirname(translationsFile), { recursive: true });
    await fs.writeFile(translationsFile, '{\r\n    "StartChat": "Démarrer"\r\n}\r\n');

    const result = await new LocalApplier(path.join(tempDir, 'form-definitions'), tempDir, webchatDir).apply({
      code: 'ca',
      version: 'v1',
      files: { 'webchat-app/translations/fr-CA.json': { StartChat: 'Commencer', Title: 'Bonjour' } },
      meta: { revision: 1, status: 'editing', updatedAt: 'now', updatedBy: 'me', baseHashes: {} },
    });
    expect(result.written).toEqual(['configSrc/ca/translations/fr-CA.json']);
    expect(await fs.readFile(translationsFile, 'utf8')).toBe(
      '{\r\n    "StartChat": "Commencer",\r\n    "Title": "Bonjour"\r\n}\r\n',
    );
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('only the webchat translations can be saved outside the form definitions', async () => {
    const save = (filePath: string) =>
      call(staff, 'PUT', '/api/drafts/ca/v1', { expectedRevision: 0, files: { [filePath]: {} }, baseHashes: {} });
    expect((await save('webchat-app/translations/fr-CA.json')).status).toBe(200);
    expect((await save('webchat-app/common.json')).status).toBe(400);
    expect((await save('webchat-app/translations/../../common.json')).status).toBe(400);
  });

  test('locally you are Aselo staff unless told otherwise', () => {
    expect(localUser({ FORM_BUILDER_USER: 'alex' })).toEqual({ name: 'alex', role: 'aselo-staff', helplines: 'all' });
    expect(
      localUser({ FORM_BUILDER_USER: 'sam', FORM_BUILDER_ROLE: 'helpline-staff', FORM_BUILDER_HELPLINES: 'usnm, usch' }),
    ).toEqual({ name: 'sam', role: 'helpline-staff', helplines: ['usnm', 'usch'] });
  });
});
