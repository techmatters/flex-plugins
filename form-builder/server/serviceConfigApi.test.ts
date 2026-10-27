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
import { describe, expect, test, vi } from 'vitest';
import { ApiContext, ApiUser, handleApiRequest } from './api';
import { Draft, MemoryDraftStore } from './drafts';
import { LocalApplier } from './localServices';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const helplinesConfigDir = path.join(repoRoot, 'twilio-iac/helplines');

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const helplineStaff: ApiUser = { name: 'Helpline person', role: 'helpline-staff', helplines: ['usnm'] };
const COMMON = 'service-configuration/common.json';
const CALLER_TAB = 'tabbedForms/CallerInformationTab.json';

const createContext = (): ApiContext & { drafts: MemoryDraftStore } => ({
  formDefinitionsDir: path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions'),
  helplinesConfigDir,
  drafts: new MemoryDraftStore(),
  applier: { apply: vi.fn() },
  notifier: { draftSubmitted: vi.fn() },
});

type Context = ApiContext;
const call = (context: Context, user: ApiUser, method: string, apiPath: string, body?: unknown) =>
  handleApiRequest(context, { method, path: apiPath, body, user });

describe('applying', () => {
  test('is refused, and not offered, when the builder has no way to apply', async () => {
    const context = { ...createContext(), applier: undefined };
    expect((await call(context, staff, 'GET', '/api/me')).body).toMatchObject({ applyInBuilder: false });
    await call(context, staff, 'PUT', '/api/drafts/usnm/v1', {
      expectedRevision: 0,
      files: { [CALLER_TAB]: [] },
      baseHashes: {},
    });
    expect((await call(context, staff, 'POST', '/api/drafts/usnm/v1/apply')).status).toBe(501);
    // The draft stays, to be discarded once the PR is merged
    expect(await context.drafts.get('usnm', 'v1')).toBeDefined();
    expect((await call(createContext(), staff, 'GET', '/api/me')).body).toMatchObject({ applyInBuilder: true });
  });
});

describe('the service configuration', () => {
  test('is only sent to Aselo staff', async () => {
    const context = createContext();
    const load = async (user: ApiUser) =>
      (await call(context, user, 'GET', '/api/definitions/usnm/v1')).body as {
        files: Record<string, unknown>;
        serviceConfigDefaults?: unknown;
      };
    const asStaff = await load(staff);
    expect(COMMON in asStaff.files).toBe(true);
    expect(asStaff.serviceConfigDefaults).toBeDefined();
    const asHelpline = await load(helplineStaff);
    expect(Object.keys(asHelpline.files).some((key) => key.startsWith('service-configuration/'))).toBe(false);
    expect(asHelpline.serviceConfigDefaults).toBeUndefined();
  });

  test('only Aselo staff can change it, and helpline staff can’t see or lose staff changes in a shared draft', async () => {
    const context = createContext();
    const save = (user: ApiUser, expectedRevision: number, files: Record<string, unknown>) =>
      call(context, user, 'PUT', '/api/drafts/usnm/v1', { expectedRevision, files, baseHashes: {} });

    expect((await save(helplineStaff, 0, { [COMMON]: { attributes: {} } })).status).toBe(403);
    expect((await call(context, helplineStaff, 'PUT', '/api/drafts/usnm/v1', {
      expectedRevision: 0,
      files: { 'service-configuration/../x.json': {} },
      baseHashes: {},
    })).status).toBe(403);

    expect((await save(staff, 0, { [COMMON]: { attributes: { system_down: true } } })).status).toBe(200);

    // Helpline staff load the draft without the service configuration...
    const loaded = (await call(context, helplineStaff, 'GET', '/api/drafts/usnm/v1')).body as Draft;
    expect(loaded.files).toEqual({});
    expect(loaded.meta.baseHashes).toEqual({});
    // ...and their save keeps it
    expect((await save(helplineStaff, 1, { [CALLER_TAB]: [] })).status).toBe(200);
    expect(Object.keys((await context.drafts.get('usnm', 'v1'))!.files).sort()).toEqual([COMMON, CALLER_TAB].sort());
    // ...as does discarding their changes
    const discarded = await call(context, helplineStaff, 'DELETE', '/api/drafts/usnm/v1');
    expect(discarded.body).toMatchObject({ revision: 3 });
    expect(Object.keys((await context.drafts.get('usnm', 'v1'))!.files)).toEqual([COMMON]);
    expect((await save(helplineStaff, 3, { [CALLER_TAB]: [] })).status).toBe(200);

    // Aselo staff discarding removes the whole draft
    await call(context, staff, 'DELETE', '/api/drafts/usnm/v1');
    expect(await context.drafts.get('usnm', 'v1')).toBeUndefined();
  });

  test('applying writes each file back in its own style, creating new ones', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'form-builder-'));
    const dir = path.join(tempDir, 'xx/configs/service-configuration');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'common.json'), '﻿{\r\n    "attributes": {\r\n        "a": 1\r\n    }\r\n}\r\n');

    const applier = new LocalApplier(path.join(tempDir, 'form-definitions'), tempDir, undefined, tempDir);
    const result = await applier.apply({
      code: 'xx',
      version: 'v1',
      files: {
        [COMMON]: { attributes: { a: 2 } },
        'service-configuration/production.json': { attributes: { b: true } },
      },
      meta: { revision: 1, status: 'editing', updatedAt: '', updatedBy: '', baseHashes: {} },
    });
    expect(result.written.sort()).toEqual([
      'xx/configs/service-configuration/common.json',
      'xx/configs/service-configuration/production.json',
    ]);
    expect(await fs.readFile(path.join(dir, 'common.json'), 'utf8')).toBe(
      '﻿{\r\n    "attributes": {\r\n        "a": 2\r\n    }\r\n}\r\n',
    );
    expect(JSON.parse(await fs.readFile(path.join(dir, 'production.json'), 'utf8'))).toEqual({ attributes: { b: true } });
    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
