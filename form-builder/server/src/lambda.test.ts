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

import { describe, expect, test, vi } from 'vitest';
import { userFromClaims } from './lambda';
import { SlackNotifier } from './slackNotifier';

describe('who is signed in, from the Okta token', () => {
  test('Aselo staff', () => {
    expect(
      userFromClaims({ groups: ['form-builder-aselo-staff', 'form-builder-usnm'], name: 'Ana', email: 'ana@aselo.org' }),
    ).toEqual({ name: 'Ana', email: 'ana@aselo.org', role: 'aselo-staff', helplines: 'all' });
  });

  test('helpline staff, with groups as API Gateway passes them', () => {
    expect(userFromClaims({ groups: '[form-builder-usnm form-builder-usch]', email: 'b@nami.org' })).toEqual({
      name: 'b@nami.org',
      email: 'b@nami.org',
      role: 'helpline-staff',
      helplines: ['usnm', 'usch'],
    });
  });

  test('nobody else', () => {
    expect(userFromClaims({ groups: ['Everyone'], name: 'C' })).toBeUndefined();
    expect(userFromClaims({})).toBeUndefined();
  });
});

describe('Slack', () => {
  test('is told about a submitted draft', async () => {
    const fetchImpl = vi.fn(async () => new Response('ok'));
    await new SlackNotifier('https://hooks.slack.com/x', 'https://form-builder.tl.techmatters.org', fetchImpl).draftSubmitted(
      {
        code: 'usnm',
        version: 'v1',
        files: { 'a.json': {} },
        meta: { revision: 1, status: 'submitted', updatedAt: '', updatedBy: '', baseHashes: {} },
      },
      { name: 'Ana', role: 'helpline-staff', helplines: ['usnm'] },
    );
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://hooks.slack.com/x');
    expect(JSON.parse(init.body as string).text).toMatch(/\*USNM\* form changes \(v1\) were submitted for review by Ana\.\n1 file changed/);
  });
});
