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

// @vitest-environment jsdom

import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ApiContext, ApiUser } from '../../server/api';
import { handleApiRequest } from '../../server/api';
import type { BranchSource } from '../../server/branches';
import { MemoryDraftStore } from '../../server/drafts';
import { MemoryBoardStore } from '../../server/boards';
import { boardClientFor } from './boardClient';
import { ImportHelpline } from './ImportHelpline';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };

afterEach(cleanup);

describe('importing a helpline from a branch', () => {
  test('the branch typed is the one read, and the preview says so', async () => {
    const asked: string[] = [];
    const branches: BranchSource = {
      choices: async () => [
        { value: '', label: 'master' },
        { value: 'alejandro-c/usvc/x', label: 'alejandro-c/usvc/x' },
      ],
      snapshot: async (branch) => {
        asked.push(branch);
        return {
          sha: 'f'.repeat(40),
          repoRoot,
          formDefinitionsDir: path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions'),
          helplinesConfigDir: path.join(repoRoot, 'twilio-iac/helplines'),
          webchatConfigDir: path.join(repoRoot, 'aselo-webchat-react-app/configSrc'),
        };
      },
    };
    const context: ApiContext = {
      formDefinitionsDir: '/nowhere',
      // The default (master); the branch is read through branches
      helplinesConfigDir: path.join(repoRoot, 'twilio-iac/helplines'),
      drafts: new MemoryDraftStore(),
      boards: new MemoryBoardStore(),
      branches,
      notifier: { draftSubmitted: async () => {} },
    };
    const client = boardClientFor((method, apiPath, body) =>
      handleApiRequest(context, { method, path: apiPath, body: structuredClone(body), user: staff }),
    );
    render(<ImportHelpline client={client} helplineCodes={['usvc']} onOpen={() => {}} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Helpline to import' }), { target: { value: 'usvc' } });
    // A first preview, of master
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(await screen.findByRole('region', { name: 'Import preview' })).toBeTruthy();
    expect(screen.queryByText(/Read from/)).toBeNull();

    // Choosing a branch clears it, so it can't be mistaken for the branch's
    fireEvent.change(screen.getByRole('combobox', { name: 'Branch to import from' }), {
      target: { value: 'alejandro-c/usvc/x' },
    });
    expect(screen.queryByRole('region', { name: 'Import preview' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(await screen.findByText('alejandro-c/usvc/x', { selector: 'code' })).toBeTruthy();
    expect(asked).toEqual(['alejandro-c/usvc/x']);
  });
});
