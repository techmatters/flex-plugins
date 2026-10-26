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

/**
 * Test helper: renders the workspace against the real API code (server/api.ts) with drafts
 * kept in memory, so UI tests cover saving, submitting and applying end to end.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ApiContext, ApiUser } from '../../server/api';
import type { DefinitionFiles } from '../../server/definitionsApi';
import { MemoryDraftStore } from '../../server/drafts';
import { repoPathOf } from '../../server/filePaths';
import { inProcessDraftClient } from '../draftClient.inProcess';
import { HelplineWorkspace } from '../components/HelplineWorkspace';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const formDefinitionsDir = path.join(
  repoRoot,
  'lambdas/packages/hrm-form-definitions/form-definitions',
);
export const helplinesConfigDir = path.join(repoRoot, 'twilio-iac/helplines');
export const webchatConfigDir = path.join(repoRoot, 'aselo-webchat-react-app/configSrc');

export const helplineStaff: ApiUser = { name: 'Helpline person', role: 'helpline-staff', helplines: 'all' };
export const aseloStaff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };

export const createHarness = () => {
  const store = new MemoryDraftStore();
  const context: ApiContext = {
    formDefinitionsDir,
    helplinesConfigDir,
    webchatConfigDir,
    drafts: store,
    applier: {
      apply: vi.fn(async (draft) => ({
        description: 'Written to your checkout.',
        written: Object.keys(draft.files).map((filePath) => repoPathOf(draft.code, draft.version, filePath)),
      })),
    },
    notifier: { draftSubmitted: vi.fn(async () => {}) },
  };

  const renderWorkspace = (
    definitions: DefinitionFiles,
    { user = helplineStaff, onReload = () => {} }: { user?: ApiUser; onReload?: () => void } = {},
  ) =>
    render(
      <HelplineWorkspace
        definitions={definitions}
        staffMode={user.role === 'aselo-staff'}
        canApply={user.role === 'aselo-staff'}
        draftClient={inProcessDraftClient(context, user)}
        onReload={onReload}
        saveDelayMs={0}
      />,
    );

  // A file as saved in the draft (undefined until the draft has been saved)
  const savedFile = async (definitions: DefinitionFiles, filePath: string) =>
    (await store.get(definitions.code, definitions.version))?.files[filePath] as any;

  return { store, context, renderWorkspace, savedFile };
};
