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
 * A draft: work in progress on a helpline's definitions (server/src/drafts.ts stores them).
 */
import type { ImportSource } from './branches';
import type { DraftReview } from './reviews';

export type DraftStatus = 'editing' | 'submitted';

export type DraftMeta = DraftReview & {
  // Goes up by one with every save, so two people can't overwrite each other unknowingly
  revision: number;
  status: DraftStatus;
  updatedAt: string;
  updatedBy: string;
  submittedAt?: string;
  submittedBy?: string;
  // Hash of each file as it was when the draft started, to spot changes made underneath it
  baseHashes: Record<string, string>;
  // The flex-plugins branch the files were read from, when not the default (Aselo staff only)
  source?: ImportSource;
  // Imported by Aselo staff (from the default, or a branch: source): listed until discarded, even
  // with no changes
  imported?: boolean;
};

export type Draft = {
  code: string;
  version: string;
  meta: DraftMeta;
  files: Record<string, unknown>;
};

export type DraftSummary = Pick<Draft, 'code' | 'version' | 'meta'> & { changedFiles: string[] };
