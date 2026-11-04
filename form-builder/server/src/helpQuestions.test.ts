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
import { describe, expect, test } from '@jest/globals';
import { handleApiRequest } from './api';
import type { ApiContext, ApiUser } from './api';
import type { HelpQuestion, HelpQuestionStore } from './helpQuestions';

const memoryStore = (): HelpQuestionStore & { months: Map<string, HelpQuestion[]> } => {
  const months = new Map<string, HelpQuestion[]>();
  return {
    months,
    get: async month => months.get(month) ?? [],
    put: async (month, questions) => {
      months.set(month, questions);
    },
  };
};

const helplineStaff: ApiUser = { name: 'Ana', role: 'helpline-staff', helplines: ['usnm'] };
const aseloStaff: ApiUser = { name: 'Alejandro', role: 'aselo-staff', helplines: 'all' };

describe('questions sent from the help panel', () => {
  const contextWith = (store: HelpQuestionStore, at: string) =>
    ({ helpQuestions: store, now: () => new Date(at) } as unknown as ApiContext);

  test('anyone sends one; only Aselo staff read them, newest first, from the last three months', async () => {
    const store = memoryStore();
    const send = (at: string, body: unknown, user = helplineStaff) =>
      handleApiRequest(contextWith(store, at), { method: 'POST', path: '/api/help/questions', body, user });

    expect((await send('2026-09-02T10:00:00Z', { question: 'old one', area: 'forms' })).status).toBe(200);
    expect(
      (await send('2026-11-03T10:00:00Z', { question: '  how do I add a logo  ', area: 'forms', reason: 'unanswered' }))
        .status,
    ).toBe(200);
    await send('2026-11-04T10:00:00Z', {
      question: 'still lost',
      area: 'forms',
      reason: 'notHelpful',
      article: 'try-it-out',
    });
    expect(store.months.get('2026-11')?.[0]).toMatchObject({
      question: 'how do I add a logo',
      area: 'forms',
      reason: 'unanswered',
      askedBy: 'Ana',
      role: 'helpline-staff',
    });

    const list = (user: ApiUser) =>
      handleApiRequest(contextWith(store, '2026-11-04T12:00:00Z'), {
        method: 'GET',
        path: '/api/help/questions',
        user,
      });
    expect((await list(helplineStaff)).status).toBe(403);
    const { status, body } = await list(aseloStaff);
    expect(status).toBe(200);
    expect((body as HelpQuestion[]).map(question => question.question)).toEqual([
      'still lost',
      'how do I add a logo',
      'old one',
    ]);
  });

  test('an empty or very long question is refused', async () => {
    const context = contextWith(memoryStore(), '2026-11-04T10:00:00Z');
    const send = (question: unknown) =>
      handleApiRequest(context, {
        method: 'POST',
        path: '/api/help/questions',
        body: { question },
        user: helplineStaff,
      });
    expect((await send('   ')).status).toBe(400);
    expect((await send('x'.repeat(501))).status).toBe(400);
  });
});
