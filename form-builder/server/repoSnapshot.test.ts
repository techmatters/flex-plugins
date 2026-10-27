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

import { execFileSync } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { loadDefinitionFiles } from './definitionsApi';
import { RepoSnapshots } from './repoSnapshot';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// A tarball laid out like GitHub's: everything under one folder
let tarball: Buffer;
let tempDir: string;
beforeAll(async () => {
  tarball = execFileSync(
    'git',
    [
      'archive',
      '--format=tar.gz',
      '--prefix=techmatters-flex-plugins-abc1234/',
      'HEAD',
      'lambdas/packages/hrm-form-definitions/form-definitions/usnm',
      'twilio-iac/helplines/usnm/configs',
      'twilio-iac/helplines/configs',
      'twilio-iac/stages',
    ],
    { cwd: repoRoot, maxBuffer: 50 * 1024 * 1024 },
  );
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'form-builder-snapshot-'));
});
afterAll(() => fs.rm(tempDir, { recursive: true, force: true, maxRetries: 5 }));

// Unpacking takes a few seconds when the whole suite runs at once
const TIMEOUT = 30_000;

describe('snapshots of master', () => {
  test('unpack only what the builder reads, and are read like a checkout', async () => {
    const source = { headSha: vi.fn(async () => 'sha1'), tarball: vi.fn(async () => tarball) };
    const snapshot = await new RepoSnapshots(source, tempDir).latest();

    const definitions = await loadDefinitionFiles(snapshot.formDefinitionsDir, 'usnm', 'v1', snapshot.helplinesConfigDir);
    expect(definitions.errors).toEqual([]);
    expect('tabbedForms/CallerInformationTab.json' in definitions.files).toBe(true);
    expect('service-configuration/common.json' in definitions.files).toBe(true);
    expect(definitions.serviceConfigDefaults).toBeDefined();
    await expect(fs.stat(path.join(snapshot.repoRoot, 'twilio-iac/stages'))).rejects.toThrow();
  }, TIMEOUT);

  test('download once, check master again after a while, and move on when it changes', async () => {
    let time = 0;
    let sha = 'sha1';
    const source = { headSha: vi.fn(async () => sha), tarball: vi.fn(async () => tarball) };
    const snapshots = new RepoSnapshots(source, path.join(tempDir, 'cache'), 30_000, () => time);

    const [first, second] = await Promise.all([snapshots.latest(), snapshots.latest()]);
    expect(second).toBe(first);
    expect(source.tarball).toHaveBeenCalledTimes(1);

    time = 10_000;
    await snapshots.latest();
    expect(source.headSha).toHaveBeenCalledTimes(1);

    time = 40_000;
    expect((await snapshots.latest()).sha).toBe('sha1');
    expect(source.headSha).toHaveBeenCalledTimes(2);
    expect(source.tarball).toHaveBeenCalledTimes(1);

    sha = 'sha2';
    time = 80_000;
    const moved = await snapshots.latest();
    expect(moved.sha).toBe('sha2');
    expect(source.tarball).toHaveBeenCalledTimes(2);
    await expect(fs.stat(first.repoRoot)).rejects.toThrow();
  }, TIMEOUT);
});
