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
import { newMemoryDraftStore } from './drafts';
import { findWordUsage } from './wordUsage';

const helplinesConfigDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../twilio-iac/helplines');
const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const helplineStaff: ApiUser = { name: 'Childhelp person', role: 'helpline-staff', helplines: ['usch'] };

describe('where words appear in a helpline’s twilio-iac config', () => {
  test('lines of its .hcl, templates and chatbots with the words, as whole words', async () => {
    const usages = await findWordUsage(helplinesConfigDir, 'usch', ['child', 'children']);
    const inProduction = usages.filter(usage => usage.file === 'usch/production.hcl');
    expect(inProduction.length).toBeGreaterThan(0);
    expect(inProduction[0].kind).toBe('config');
    // "childhelp_..." isn't the word child, but "National Child Abuse Hotline" is
    expect(inProduction.some(usage => usage.text.includes('National Child Abuse Hotline'))).toBe(true);
    expect(usages.every(usage => usage.words.every(word => /^child(ren)?$/i.test(word)))).toBe(true);
    // Settings, not texts
    expect(usages.some(usage => usage.file.includes('service-configuration'))).toBe(false);
    // Long lines are cut down around the word
    expect(usages.every(usage => usage.text.length <= 182)).toBe(true);
  });

  test('none for words not there, or none asked for', async () => {
    expect(await findWordUsage(helplinesConfigDir, 'usch', ['zebra'])).toEqual([]);
    expect(await findWordUsage(helplinesConfigDir, 'usch', [])).toEqual([]);
  });

  test('only Aselo staff ask, with words', async () => {
    const context: ApiContext = {
      formDefinitionsDir: '',
      helplinesConfigDir,
      drafts: newMemoryDraftStore(),
      notifier: { draftSubmitted: jest.fn(async () => undefined) },
    };
    const ask = (user: ApiUser, body: unknown) =>
      handleApiRequest(context, { method: 'POST', path: '/api/helplines/usch/word-usage', body, user });
    expect((await ask(helplineStaff, { words: ['child'] })).status).toBe(403);
    expect((await ask(staff, { words: ['child; rm -rf'] })).status).toBe(400);
    const response = await ask(staff, { words: ['child'] });
    expect(response.status).toBe(200);
    expect((response.body as unknown[]).length).toBeGreaterThan(0);
  });
});
