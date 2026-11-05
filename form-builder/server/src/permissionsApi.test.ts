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
import path from 'path';
import { fileURLToPath } from 'url';

import { describe, expect, test, jest } from '@jest/globals';
import { permissionRulesPath, repoPathOf } from '@tech-matters/form-builder-shared';

import { ApiContext, ApiUser, handleApiRequest } from './api';
import { MemoryDraftStore } from './drafts';
import {
  GitHubPermissionRules,
  loadPermissions,
  type PermissionRulesSource,
  readPermissionConfigs,
} from './permissionsApi';

const here = path.dirname(fileURLToPath(import.meta.url));
const helplinesConfigDir = path.resolve(here, '../../../twilio-iac/helplines');
const formDefinitionsDir = path.resolve(here, '../../../lambdas/packages/hrm-form-definitions/form-definitions');
const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

const USNM_RULES = { viewCase: [], viewContact: [['isSupervisor'], ['isOwner']] };
// The hrm repo, as far as these tests need it
const rules: PermissionRulesSource = {
  description: 'test rules',
  read: async name => (name === 'usnm' || name === 'demo' ? JSON.stringify(USNM_RULES) : undefined),
};

describe('permissions', () => {
  test('which rules file each environment uses, from the .hcl files', async () => {
    expect(await readPermissionConfigs(helplinesConfigDir, 'usnm')).toEqual({ staging: 'usnm', production: 'usnm' });
    expect(await readPermissionConfigs(helplinesConfigDir, 'as')).toEqual({
      staging: 'demo',
      production: 'demo',
      development: 'dev',
    });
  });

  test('a shared file says who else uses it; client profiles follow the service configuration', async () => {
    const demo = await loadPermissions(helplinesConfigDir, 'usvt', rules);
    expect(demo.info?.name).toBe('demo');
    expect(demo.info?.sharedWith).toEqual(expect.arrayContaining(['as', 'baseline']));
    expect(demo.files[permissionRulesPath('demo')]).toEqual(USNM_RULES);
    expect((await loadPermissions(helplinesConfigDir, 'ca', rules)).info?.clientProfiles).toBe(false);
    expect((await loadPermissions(helplinesConfigDir, 'usnm', rules)).info?.clientProfiles).toBe(true);
    // A file the hrm repo doesn't have
    const missing = await loadPermissions(helplinesConfigDir, 'br', rules);
    expect(missing.files).toEqual({});
    expect(missing.info?.error).toMatch(/no br\.json/);
  });

  test('read from GitHub, kept for a while', async () => {
    const fetchImpl = jest.fn(async () => new Response('{"viewCase": []}', { status: 200 }));
    const github = new GitHubPermissionRules('techmatters/hrm', 'master', fetchImpl as unknown as typeof fetch);
    expect(await github.read('usnm')).toBe('{"viewCase": []}');
    await github.read('usnm');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(String((fetchImpl.mock.calls[0] as unknown[])[0])).toBe(
      'https://raw.githubusercontent.com/techmatters/hrm/master/hrm-domain/hrm-core/permission-rules/usnm.json',
    );
    expect(await github.read('../x')).toBeUndefined();
  });

  test('seen by helpline staff, changed by Aselo staff, left out of the PR and kept in the draft', async () => {
    const apply = jest.fn(async () => ({ description: 'Opened PR #1.', written: ['x.json'] }));
    const shared: ApiContext = {
      formDefinitionsDir,
      helplinesConfigDir,
      drafts: new MemoryDraftStore(),
      notifier: { draftSubmitted: jest.fn(async () => undefined) },
      permissionRules: rules,
      applier: { apply },
    };
    const key = permissionRulesPath('usnm');
    const definitions = (
      await handleApiRequest(shared, { method: 'GET', path: '/api/definitions/usnm/v1', user: usnmStaff })
    ).body as { files: Record<string, unknown>; permissions: { name: string } };
    expect(definitions.files[key]).toEqual(USNM_RULES);
    expect(definitions.permissions.name).toBe('usnm');
    expect(repoPathOf('usnm', 'v1', key)).toBe('hrm/hrm-domain/hrm-core/permission-rules/usnm.json');

    const save = (user: ApiUser, revision: number, files: Record<string, unknown>) =>
      handleApiRequest(shared, {
        method: 'PUT',
        path: '/api/drafts/usnm/v1',
        body: { expectedRevision: revision, files, baseHashes: {} },
        user,
      });
    const changed = { ...USNM_RULES, viewCase: [['isSupervisor']] };
    expect((await save(staff, 0, { [key]: changed })).status).toBe(200);
    // Only the permissions changed: nothing for a flex-plugins PR
    const applyNow = () => handleApiRequest(shared, { method: 'POST', path: '/api/drafts/usnm/v1/apply', user: staff });
    expect((await applyNow()).status).toBe(400);
    // A helpline person's copy doesn't change them
    expect((await save(usnmStaff, 1, { [key]: USNM_RULES, 'customStrings/Messages.json': {} })).status).toBe(200);
    const applied = await applyNow();
    expect(applied.status).toBe(200);
    expect(Object.keys((apply.mock.calls[0] as unknown as [{ files: object }])[0].files)).toEqual([
      'customStrings/Messages.json',
    ]);
    const draft = (await handleApiRequest(shared, { method: 'GET', path: '/api/drafts/usnm/v1', user: staff }))
      .body as {
      files: Record<string, unknown>;
    };
    expect(draft.files).toEqual({ [key]: changed });
  });
});
