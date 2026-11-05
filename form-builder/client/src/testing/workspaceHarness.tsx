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
 * Test helper: renders the workspace against the real API code (server/src/api.ts) with drafts
 * kept in memory, so UI tests cover saving, submitting and applying end to end.
 */
import path from 'path';
import { fileURLToPath } from 'url';

import { jest } from '@jest/globals';
import { render } from '@testing-library/react';
import { type ApiContext, type ApiUser, handleApiRequest } from '@tech-matters/form-builder-server/api';
import type { DefinitionFiles } from '@tech-matters/form-builder-server/definitionsApi';
import { MemoryDraftStore } from '@tech-matters/form-builder-server/drafts';
import { type Draft, type OperatingHoursUsage, repoPathOf, type WordUsage } from '@tech-matters/form-builder-shared';
import { Provider } from 'react-redux';
import type { Person } from '@tech-matters/form-builder-shared/flows/model';

import { inProcessDraftClient } from './draftClient.inProcess';
import type { DraftClient } from '../drafts/draftClient';
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

const withFailingSaves = (client: DraftClient, failingSaves?: { remaining: number }): DraftClient =>
  failingSaves
    ? {
        ...client,
        save: async (...args) => {
          if (failingSaves.remaining > 0) {
            failingSaves.remaining -= 1;
            throw new TypeError('Failed to fetch');
          }
          return client.save(...args);
        },
      }
    : client;

export const createHarness = () => {
  const store = new MemoryDraftStore();
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
      loadPeople,
      failingSaves,
    }: {
      user?: ApiUser;
      onReload?: () => void;
      applyInBuilder?: boolean;
      // A people list (a helpline's, or the Aselo team's), to say who a comment is for
      loadPeople?: (code: string) => Promise<Person[]>;
      // Saves fail (as when the server can't be reached) while `remaining` is above 0
      failingSaves?: { remaining: number };
    } = {},
  ) => {
    // The first load opens the helpline; any later one is a reload
    let loads = 0;
    const appStore = createAppStore({
      draftClient: withFailingSaves(inProcessDraftClient(context, user), failingSaves),
      fetchHelplines: async () => [],
      fetchDefinitionFiles: async () => {
        loads += 1;
        if (loads > 1) onReload();
        return definitions;
      },
      // No people to choose from unless the test gives them
      loadPeople,
      // The real routes, in process
      fetchOperatingHoursUsage: async code => {
        const response = await handleApiRequest(context, {
          method: 'GET',
          path: `/api/helplines/${code}/operating-hours-usage`,
          user,
        });
        if (response.status !== 200) throw new Error((response.body as { message?: string }).message);
        return response.body as OperatingHoursUsage[];
      },
      fetchWordUsage: async (code, words) => {
        const response = await handleApiRequest(context, {
          method: 'POST',
          path: `/api/helplines/${code}/word-usage`,
          body: { words },
          user,
        });
        if (response.status !== 200) throw new Error((response.body as { message?: string }).message);
        return response.body as WordUsage[];
      },
      saveDelayMs: 0,
      saveRetryDelaysMs: [0, 0, 0],
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
