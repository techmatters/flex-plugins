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
 * A question the help panel couldn't answer, sent to the Aselo team (server/src/helpQuestions.ts).
 */
import type { ApiUser } from './api';

export type HelpQuestion = {
  id: string;
  question: string;
  // The builder's area it was asked in (forms, flows...)
  area: string;
  // No answer found, or the answer shown (its slug) didn't help
  reason: 'unanswered' | 'notHelpful';
  article?: string;
  askedBy: string;
  role: ApiUser['role'];
  at: string;
};
