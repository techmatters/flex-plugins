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
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type { Draft } from './drafts';
import type { GitHubClient } from './github';
import { branchNameFor, GitHubApplier } from './githubApplier';
import type { RepoSnapshots } from './repoSnapshot';

let repoRoot: string;
beforeAll(async () => {
  repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'form-builder-apply-'));
  const dir = path.join(repoRoot, 'twilio-iac/helplines/usnm/configs/service-configuration');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'common.json'), '{\r\n    "attributes": {}\r\n}\r\n');
});
afterAll(() => fs.rm(repoRoot, { recursive: true, force: true }));

const draft: Draft = {
  code: 'usnm',
  version: 'v1',
  files: {
    'service-configuration/common.json': { attributes: { system_down: true } },
    'CallTypeButtons.json': [],
  },
  meta: { revision: 3, status: 'submitted', updatedAt: '', updatedBy: 'Helpline person', baseHashes: {} },
};

describe('applying through GitHub', () => {
  test('commits the files in their own style on a new branch from master and opens a PR', async () => {
    const request = vi.fn(async (method: string, repoPath: string, _body?: any): Promise<any> => {
      if (repoPath === '/git/commits/master-sha') return { tree: { sha: 'base-tree' } };
      if (repoPath === '/git/trees') return { sha: 'new-tree' };
      if (repoPath === '/git/commits') return { sha: 'new-commit' };
      if (repoPath === '/pulls') return { number: 42, html_url: 'https://github.com/techmatters/flex-plugins/pull/42' };
      return {};
    });
    const snapshots = { latest: async () => ({ sha: 'master-sha', repoRoot }) } as unknown as RepoSnapshots;
    const applier = new GitHubApplier({ request } as unknown as GitHubClient, snapshots, 'master', () =>
      new Date('2026-10-27T09:05:00Z'),
    );

    const result = await applier.apply(
      draft,
      { name: 'Aselo person', email: 'person@aselo.org', role: 'aselo-staff', helplines: 'all' },
      { description: '# Form changes for USNM (v1)' },
    );

    const bodyOf = (repoPath: string) => request.mock.calls.find((call) => call[1] === repoPath)![2];
    const tree = bodyOf('/git/trees');
    expect(tree.base_tree).toBe('base-tree');
    expect(tree.tree).toContainEqual({
      path: 'twilio-iac/helplines/usnm/configs/service-configuration/common.json',
      mode: '100644',
      type: 'blob',
      content: '{\r\n    "attributes": {\r\n        "system_down": true\r\n    }\r\n}\r\n',
    });
    expect(tree.tree).toContainEqual(
      expect.objectContaining({
        path: 'lambdas/packages/hrm-form-definitions/form-definitions/usnm/v1/CallTypeButtons.json',
        content: '[]\n',
      }),
    );

    const commit = bodyOf('/git/commits');
    expect(commit.parents).toEqual(['master-sha']);
    expect(commit.message).toMatch(/^USNM: Form changes \(v1\)/);
    expect(commit.message).toContain('Co-authored-by: Aselo person <person@aselo.org>');
    expect(bodyOf('/git/refs')).toEqual({ ref: 'refs/heads/form-builder/usnm/v1-20261027-0905', sha: 'new-commit' });

    const pull = bodyOf('/pulls');
    expect(pull).toMatchObject({ head: 'form-builder/usnm/v1-20261027-0905', base: 'master' });
    expect(pull.body).toContain('# Form changes for USNM (v1)');
    expect(pull.body).toContain('Applied by Aselo person');
    expect(result.link).toBe('https://github.com/techmatters/flex-plugins/pull/42');
  });

  test('branch names', () => {
    expect(branchNameFor(draft, new Date('2026-01-02T03:04:00Z'))).toBe('form-builder/usnm/v1-20260102-0304');
  });
});
