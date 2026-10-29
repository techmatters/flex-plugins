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
import { describe, expect, test } from 'vitest';
import type { ApiContext, ApiUser } from './api';
import { handleApiRequest } from './api';
import type { BranchSource } from './branches';
import { GitHubBranches, isValidBranch } from './branches';
import { MemoryChatbotStore } from './chatbotApi';
import { MemoryDraftStore } from './drafts';
import { MemoryRoutingStore } from './routingStore';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHA = 'a'.repeat(40);

// What GitHub's ref list looks like (one line per ref)
const refList = [
  `001e# service=git-upload-pack`,
  `0000015b${'b'.repeat(40)} HEAD\0multi_ack side-band-64k`,
  `003f${SHA} refs/heads/master`,
  `004f${'c'.repeat(40)} refs/heads/alejandro-c/usvc/update_1029`,
  `0040${'d'.repeat(40)} refs/heads/bad..name`,
  `003e${'e'.repeat(40)} refs/pull/12/head`,
].join('\n');

const fakeFetch = (async () => new Response(refList)) as unknown as typeof fetch;

describe('branches', () => {
  test('the choices: the default first, then every branch with a safe name', async () => {
    const deployed = new GitHubBranches('/nowhere', 'master', 'techmatters/flex-plugins', fakeFetch);
    expect(await deployed.choices()).toEqual([
      { value: '', label: 'master' },
      { value: 'alejandro-c/usvc/update_1029', label: 'alejandro-c/usvc/update_1029' },
    ]);
    const local = new GitHubBranches('/nowhere', 'This checkout (local files)', 'techmatters/flex-plugins', fakeFetch);
    expect((await local.choices()).map((choice) => choice.value)).toEqual([
      '',
      'alejandro-c/usvc/update_1029',
      'master',
    ]);
    expect(isValidBranch('alejandro-c/usnm/update_0929')).toBe(true);
    expect(isValidBranch('../etc')).toBe(false);
    expect(isValidBranch('-x')).toBe(false);
  });

  describe('importing from a branch', () => {
    // A branch "snapshot" that is this checkout, to read real helplines
    const branches: BranchSource = {
      choices: async () => [{ value: '', label: 'master' }],
      snapshot: async (branch) => {
        if (branch === 'missing') throw new Error('no such branch');
        return {
          sha: SHA,
          repoRoot,
          formDefinitionsDir: path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions'),
          helplinesConfigDir: path.join(repoRoot, 'twilio-iac/helplines'),
          webchatConfigDir: path.join(repoRoot, 'aselo-webchat-react-app/configSrc'),
        };
      },
    };
    const context: ApiContext = {
      // Without a branch, imports read nothing here
      formDefinitionsDir: '/nowhere',
      drafts: new MemoryDraftStore(),
      chatbots: new MemoryChatbotStore(),
      routing: new MemoryRoutingStore(),
      branches,
      notifier: { draftSubmitted: async () => {} },
    };
    const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
    const uschStaff: ApiUser = { name: 'Childhelp person', role: 'helpline-staff', helplines: ['usch'] };
    const call = (user: ApiUser, method: string, apiPath: string, body?: unknown) =>
      handleApiRequest(context, { method, path: apiPath, body, user });

    test('chatbots, routing and flows read the branch, and say so', async () => {
      const chatbots = await call(staff, 'POST', '/api/chatbots/usch/import', { branch: 'alejandro-c/usch/x' });
      expect(chatbots.status).toBe(200);
      expect(chatbots.body).toMatchObject({ source: { branch: 'alejandro-c/usch/x', sha: SHA } });
      expect((chatbots.body as { design: { bots: unknown[] } }).design.bots).toHaveLength(2);

      const routing = await call(staff, 'POST', '/api/routing/usch/import', { branch: 'alejandro-c/usch/x' });
      expect(routing.status).toBe(200);
      expect(routing.body).toMatchObject({ source: { branch: 'alejandro-c/usch/x' } });

      const flows = await call(staff, 'POST', '/api/flows/import/usch', { branch: 'alejandro-c/usch/x' });
      expect(flows.status).toBe(200);
      expect(flows.body).toMatchObject({ source: { sha: SHA } });
    });

    test('Aselo staff only, valid names, and a branch that can’t be read', async () => {
      expect((await call(uschStaff, 'GET', '/api/branches')).status).toBe(403);
      expect((await call(staff, 'GET', '/api/branches')).body).toEqual([{ value: '', label: 'master' }]);
      expect((await call(uschStaff, 'POST', '/api/chatbots/usch/import', { branch: 'x' })).status).toBe(403);
      expect((await call(staff, 'POST', '/api/chatbots/usch/import', { branch: '../x' })).status).toBe(400);
      const missing = await call(staff, 'POST', '/api/chatbots/usch/import', { branch: 'missing' });
      expect(missing.status).toBe(404);
      expect((missing.body as { message: string }).message).toMatch(/Couldn't read the branch missing/);
    });
  });
});
