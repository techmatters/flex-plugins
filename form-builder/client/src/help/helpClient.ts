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
 * Sending a question the help panel couldn't answer to the Aselo team, and (Aselo staff) reading
 * them (server/src/helpQuestions.ts).
 */
import type { HelpQuestion } from '@tech-matters/form-builder-shared';

import { apiFetch } from '../app/auth';

export type { HelpQuestion };

type SentQuestion = Pick<HelpQuestion, 'question' | 'area' | 'reason' | 'article'>;

export type HelpClient = {
  send(question: SentQuestion): Promise<void>;
  list(): Promise<HelpQuestion[]>;
};

const failed = async (response: Response) => {
  const body = await response.json().catch(() => ({}));
  return new Error(body.message ?? `The request failed (${response.status})`);
};

export const httpHelpClient: HelpClient = {
  async send(question) {
    const response = await apiFetch('/api/help/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    if (!response.ok) throw await failed(response);
  },
  async list() {
    const response = await apiFetch('/api/help/questions');
    if (!response.ok) throw await failed(response);
    return response.json();
  },
};
