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

  test('locally you are Aselo staff unless told otherwise', () => {
    expect(localUser({ FORM_BUILDER_USER: 'alex' })).toEqual({ name: 'alex', role: 'aselo-staff', helplines: 'all' });
    expect(
      localUser({ FORM_BUILDER_USER: 'sam', FORM_BUILDER_ROLE: 'helpline-staff', FORM_BUILDER_HELPLINES: 'usnm, usch' }),
    ).toEqual({ name: 'sam', role: 'helpline-staff', helplines: ['usnm', 'usch'] });
  });
});
