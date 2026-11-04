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
import { ApiContext, ApiUser, handleApiRequest } from './api';
import { MemoryDraftStore } from './drafts';
import { MemoryBoardStore } from './boards';
import { MemoryRoutingStore } from './routingStore';
import type { PostFlowChoices } from './postStudioFlowChoices';
import { emptyBoard } from '@tech-matters/form-builder-shared/flows/model';

const helplinesConfigDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../twilio-iac/helplines');
const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const helplineStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

describe('what postStudioFlows can point at', () => {
  test("the helpline's queues and post_call_survey_* flows, from its config and the builder", async () => {
    const routing = new MemoryRoutingStore();
    await routing.put({ code: 'usnm', design: { queues: [{ key: 'en_new', name: 'EN New' }] } } as never);
    const context: ApiContext = {
      formDefinitionsDir: '/nowhere',
      helplinesConfigDir,
      drafts: new MemoryDraftStore(),
      notifier: { draftSubmitted: jest.fn(async () => {}) },
      boards: new MemoryBoardStore(),
      routing,
    };
    const call = (user: ApiUser, method: string, apiPath: string, body?: unknown) =>
      handleApiRequest(context, { method, path: apiPath, body, user });
    // A language added on a board: not in the config yet
    await call(staff, 'POST', '/api/boards/usnm', {
      title: 'Survey',
      content: {
        ...emptyBoard('Survey'),
        flow: {
          variants: [
            { key: 'post_call_survey_en', label: 'English', recordingsFolder: 'post_call_survey_en' },
            { key: 'post_call_survey_fr', label: 'French', recordingsFolder: 'post_call_survey_fr', added: true },
          ],
        },
      },
    });

    const response = await call(staff, 'GET', '/api/service-config/usnm/post-flow-choices');
    expect(response.status).toBe(200);
    const choices = response.body as PostFlowChoices;
    expect(choices.flows).toEqual([
      { key: 'post_call_survey_en', environments: ['staging', 'production'], boards: ['Survey'] },
      { key: 'post_call_survey_es', environments: ['staging', 'production'], boards: [] },
      { key: 'post_call_survey_fr', environments: [], boards: ['Survey'] },
    ]);
    expect(choices.queues).toContainEqual(
      expect.objectContaining({ key: 'en_std', environments: ['staging', 'production'], inRoutingDesign: false }),
    );
    expect(choices.queues).toContainEqual({ key: 'en_new', name: 'EN New', environments: [], inRoutingDesign: true });

    expect((await call(helplineStaff, 'GET', '/api/service-config/usnm/post-flow-choices')).status).toBe(403);
  });
});
