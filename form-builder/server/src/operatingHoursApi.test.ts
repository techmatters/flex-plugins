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
import { MemoryDraftStore } from './drafts';
import { findOperatingHoursUsage, operatingHoursChoices } from './operatingHoursApi';

const here = path.dirname(fileURLToPath(import.meta.url));
const helplinesConfigDir = path.resolve(here, '../../../twilio-iac/helplines');
const formDefinitionsDir = path.resolve(here, '../../../lambdas/packages/hrm-form-definitions/form-definitions');
const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

const context = (): ApiContext => ({
  formDefinitionsDir,
  helplinesConfigDir,
  drafts: new MemoryDraftStore(),
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

  test('its file is in the draft for Aselo staff only, written to the account-scoped Lambda', async () => {
    const definitionsFor = async (user: ApiUser) =>
      (await handleApiRequest(context(), { method: 'GET', path: '/api/definitions/usnm/v1', user })).body as {
        files: Record<string, { timezone?: string }>;
      };
    expect((await definitionsFor(staff)).files[OPERATING_INFO_FILE]?.timezone).toBe('America/New_York');
    expect(OPERATING_INFO_FILE in (await definitionsFor(usnmStaff)).files).toBe(false);
    expect(repoPathOf('usnm', 'v1', OPERATING_INFO_FILE)).toBe('lambdas/account-scoped/src/operatingInfo/usnm.json');

    // Helpline staff can't change it
    const save = await handleApiRequest(context(), {
      method: 'PUT',
      path: '/api/drafts/usnm/v1',
      body: { expectedRevision: 0, files: { [OPERATING_INFO_FILE]: { timezone: 'UTC' } }, baseHashes: {} },
      user: usnmStaff,
    });
    expect(save.status).toBe(403);
  });

  test('only Aselo staff see what the flows ask for; anyone with the helpline sees the choices', async () => {
    const ask = (user: ApiUser, what: string) =>
      handleApiRequest(context(), { method: 'GET', path: `/api/helplines/usnm/${what}`, user });
    expect((await ask(usnmStaff, 'operating-hours-usage')).status).toBe(403);
    expect((await ask(staff, 'operating-hours-usage')).status).toBe(200);
    expect((await ask(usnmStaff, 'operating-hours-choices')).status).toBe(200);
  });
});
