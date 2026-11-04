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
 * The flex-plugins branches imports can read, and where an import was read from (server/src/branches.ts).
 */
export type BranchChoice = {
  // '' is what the builder reads anyway (master deployed, this checkout locally)
  value: string;
  label: string;
};

// Where an import was read from, when it wasn't the default
export type ImportSource = { branch: string; sha: string };

export type FromBranch = { source?: ImportSource };
