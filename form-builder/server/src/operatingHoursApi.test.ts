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
import { OPERATING_INFO_FILE, repoPathOf } from '@tech-matters/form-builder-shared';

import { ApiContext, ApiUser, handleApiRequest } from './api';
import { newMemoryDraftStore } from './drafts';
import { findOperatingHoursUsage, operatingHoursChoices } from './operatingHoursApi';

const here = path.dirname(fileURLToPath(import.meta.url));
const helplinesConfigDir = path.resolve(here, '../../../twilio-iac/helplines');
const formDefinitionsDir = path.resolve(here, '../../../lambdas/packages/hrm-form-definitions/form-definitions');
const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

const context = (): ApiContext => ({
  formDefinitionsDir,
  helplinesConfigDir,
  drafts: newMemoryDraftStore(),
  notifier: { draftSubmitted: jest.fn(async () => undefined) },
});

describe('operating hours', () => {
  test('what a helpline’s Studio flows ask for: channel and office', async () => {
    const usages = await findOperatingHoursUsage(helplinesConfigDir, 'usnm');
    expect(usages).toContainEqual({
      file: 'usnm/templates/studio-flows/sms.tftpl',
      channel: 'sms',
      office: 'preClosing',
      dynamic: false,
    });
  });

  test('the channels and offices in its operating hours file', async () => {
    expect(await operatingHoursChoices(formDefinitionsDir, 'usnm')).toEqual({
      hasOperatingHours: true,
      channels: ['sms', 'voice'],
      offices: ['preClosing'],
    });
    expect((await operatingHoursChoices(formDefinitionsDir, 'usvc')).hasOperatingHours).toBe(false);
  });

  test('its file is in the draft for everyone, changed by Aselo staff only, written to the account-scoped Lambda', async () => {
    const shared = context();
    const definitionsFor = async (user: ApiUser) =>
      (await handleApiRequest(shared, { method: 'GET', path: '/api/definitions/usnm/v1', user })).body as {
        files: Record<string, { timezone?: string }>;
      };
    expect((await definitionsFor(staff)).files[OPERATING_INFO_FILE]?.timezone).toBe('America/New_York');
    // Helpline staff see it (to review and comment on), but not the service configuration
    const forHelpline = (await definitionsFor(usnmStaff)).files;
    expect(forHelpline[OPERATING_INFO_FILE]?.timezone).toBe('America/New_York');
    expect(Object.keys(forHelpline).some(filePath => filePath.startsWith('service-configuration/'))).toBe(false);
    expect(repoPathOf('usnm', 'v1', OPERATING_INFO_FILE)).toBe('lambdas/account-scoped/src/operatingInfo/usnm.json');

    const save = (user: ApiUser, revision: number, files: Record<string, unknown>) =>
      handleApiRequest(shared, {
        method: 'PUT',
        path: '/api/drafts/usnm/v1',
        body: { expectedRevision: revision, files, baseHashes: {} },
        user,
      });
    // Aselo staff change it; a helpline person's save (with their own copy of it) leaves it as Aselo staff left it
    expect((await save(staff, 0, { [OPERATING_INFO_FILE]: { timezone: 'America/Chicago' } })).status).toBe(200);
    expect(
      (await save(usnmStaff, 1, { [OPERATING_INFO_FILE]: { timezone: 'UTC' }, 'customStrings/Messages.json': {} }))
        .status,
    ).toBe(200);
    const draft = (await handleApiRequest(shared, { method: 'GET', path: '/api/drafts/usnm/v1', user: staff }))
      .body as {
      files: Record<string, { timezone?: string }>;
    };
    expect(draft.files[OPERATING_INFO_FILE]?.timezone).toBe('America/Chicago');
    expect('customStrings/Messages.json' in draft.files).toBe(true);
  });

  test('only Aselo staff see what the flows ask for; anyone with the helpline sees the choices', async () => {
    const ask = (user: ApiUser, what: string) =>
      handleApiRequest(context(), { method: 'GET', path: `/api/helplines/usnm/${what}`, user });
    expect((await ask(usnmStaff, 'operating-hours-usage')).status).toBe(403);
    expect((await ask(staff, 'operating-hours-usage')).status).toBe(200);
    expect((await ask(usnmStaff, 'operating-hours-choices')).status).toBe(200);
  });
});
