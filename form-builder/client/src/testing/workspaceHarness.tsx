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

import { jest } from '@jest/globals';
import { render } from '@testing-library/react';
import type { ApiContext, ApiUser } from '@tech-matters/form-builder-server/api';
import type { DefinitionFiles } from '@tech-matters/form-builder-server/definitionsApi';
import { newMemoryDraftStore } from '@tech-matters/form-builder-server/drafts';
import { type Draft, repoPathOf } from '@tech-matters/form-builder-shared';
import { Provider } from 'react-redux';

import { inProcessDraftClient } from './draftClient.inProcess';
import { HelplineWorkspace } from '../workspace/HelplineWorkspace';
import { openHelpline, selectDefinitions } from '../workspace/workspaceSlice';
import { createAppStore, useAppSelector } from '../app/store';
import { sessionLoaded } from '../app/sessionSlice';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const formDefinitionsDir = path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions');
export const helplinesConfigDir = path.join(repoRoot, 'twilio-iac/helplines');
export const webchatConfigDir = path.join(repoRoot, 'aselo-webchat-react-app/configSrc');

const helplineStaff: ApiUser = { name: 'Helpline person', role: 'helpline-staff', helplines: 'all' };
export const aseloStaff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };

// The workspace, once its helpline's files have loaded (as App shows it)
const WhenLoaded = () => (useAppSelector(selectDefinitions) ? <HelplineWorkspace /> : null);

export const createHarness = () => {
  const store = newMemoryDraftStore();
  const context: ApiContext = {
    formDefinitionsDir,
    helplinesConfigDir,
    webchatConfigDir,
    drafts: store,
    applier: {
      apply: jest.fn(async (draft: Draft) => ({
        description: 'Written to your checkout.',
        written: Object.keys(draft.files).map(filePath => repoPathOf(draft.code, draft.version, filePath)),
      })),
    },
    notifier: { draftSubmitted: jest.fn(async () => undefined) },
  };

  const renderWorkspace = (
    definitions: DefinitionFiles,
    {
      user = helplineStaff,
      onReload = () => undefined,
      applyInBuilder = true,
    }: { user?: ApiUser; onReload?: () => void; applyInBuilder?: boolean } = {},
  ) => {
    // The first load opens the helpline; any later one is a reload
    let loads = 0;
    const appStore = createAppStore({
      draftClient: inProcessDraftClient(context, user),
      fetchHelplines: async () => [],
      fetchDefinitionFiles: async () => {
        loads += 1;
        if (loads > 1) onReload();
        return definitions;
      },
      saveDelayMs: 0,
    });
    appStore.dispatch(sessionLoaded({ user: { ...user, applyInBuilder }, helplines: [] }));
    appStore.dispatch(openHelpline(definitions.code, definitions.version));
    const result = render(
      <Provider store={appStore}>
        <WhenLoaded />
      </Provider>,
    );
    return { ...result, appStore };
  };

  // A file as saved in the draft (undefined until the draft has been saved)
  const savedFile = async (definitions: DefinitionFiles, filePath: string) =>
    (await store.get(definitions.code, definitions.version))?.files[filePath] as any;

  return { store, context, renderWorkspace, savedFile };
};
