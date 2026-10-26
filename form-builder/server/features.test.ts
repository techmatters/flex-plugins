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
import { applyHelplineFeatures, readHelplineFeatures } from './features';
import { handleApiRequest } from './api';
import { MemoryDraftStore } from './drafts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const helplinesConfigDir = path.join(repoRoot, 'twilio-iac/helplines');

describe('helpline features', () => {
  test('are read as production sees them', async () => {
    expect((await readHelplineFeatures(helplinesConfigDir, 'ca')).features.enableClientProfiles).toBe(false);
    const usnm = await readHelplineFeatures(helplinesConfigDir, 'usnm');
    expect(usnm.features).toMatchObject({ enableClientProfiles: true, enableCannedResponses: false, usePrepopulateMappings: true });
    expect(usnm.permissionConfig).toBe('usnm');
  });

  test('applying writes changed switches where they are set, keeping each file’s style', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'form-builder-'));
    const dir = path.join(tempDir, 'xx/configs/service-configuration');
    await fs.mkdir(path.join(tempDir, 'configs/service-configuration'), { recursive: true });
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(tempDir, 'configs/service-configuration/defaults.json'),
      JSON.stringify({ attributes: { enableClientProfiles: true, feature_flags: { enable_canned_responses: true } } }),
    );
    await fs.writeFile(
      path.join(dir, 'common.json'),
      '﻿{\r\n    "attributes": {\r\n        "helplineLanguage": "en-US"\r\n    }\r\n}\r\n',
    );
    await fs.writeFile(
      path.join(dir, 'production.json'),
      '{\n  "attributes": {\n    "feature_flags": {\n      "enable_canned_responses": true\n    }\n  }\n}\n',
    );

    const written = await applyHelplineFeatures(tempDir, 'xx', {
      enableClientProfiles: false,
      enableCannedResponses: false,
      usePrepopulateMappings: false,
    });
    expect(written.map((file) => path.basename(file)).sort()).toEqual(['common.json', 'production.json']);

    // Not set by the helpline: goes into common.json, in its style
    const common = await fs.readFile(path.join(dir, 'common.json'), 'utf8');
    expect(common.startsWith('﻿{\r\n    "attributes"')).toBe(true);
    expect(JSON.parse(common.slice(1)).attributes).toEqual({
      helplineLanguage: 'en-US',
      enableClientProfiles: false,
      feature_flags: { enable_client_profiles: false },
    });
    // Set by production.json: changed there
    const production = JSON.parse(await fs.readFile(path.join(dir, 'production.json'), 'utf8'));
    expect(production.attributes.feature_flags.enable_canned_responses).toBe(false);
    expect((await readHelplineFeatures(tempDir, 'xx')).features).toEqual({
      enableClientProfiles: false,
      enableCannedResponses: false,
      usePrepopulateMappings: false,
    });
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('only Aselo staff can save a draft that changes them', async () => {
    const context = {
      formDefinitionsDir: path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions'),
      drafts: new MemoryDraftStore(),
      applier: { apply: vi.fn() },
      notifier: { draftSubmitted: vi.fn() },
    };
    const body = { expectedRevision: 0, files: { 'aselo-features.json': { enableClientProfiles: false } }, baseHashes: {} };
    const save = (role: 'aselo-staff' | 'helpline-staff') =>
      handleApiRequest(context, {
        method: 'PUT',
        path: '/api/drafts/usnm/v1',
        body,
        user: { name: 'someone', role, helplines: 'all' },
      });
    expect((await save('helpline-staff')).status).toBe(403);
    expect((await save('aselo-staff')).status).toBe(200);
  });
});
