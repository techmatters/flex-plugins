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
 * Who's signed in, and what applying a draft gives back (server/src/api.ts).
 */
export type ApiUser = {
  name: string;
  email?: string;
  role: 'aselo-staff' | 'helpline-staff';
  // Helpline codes this person works on; Aselo staff have all of them
  helplines: string[] | 'all';
};

// What GET /api/me returns: the person, and whether Apply works from the builder here (deployed
// without the GitHub App, Aselo staff download the changes and open the PR themselves)
export type Me = ApiUser & { applyInBuilder: boolean };

export type ApplyResult = {
  // Where the changes went: files written locally, or the branch / PR when deployed
  description: string;
  written: string[];
  link?: string;
};

export type ApplyDetails = {
  // What changed, in plain language (the review's change log), for the PR description
  description?: string;
};
