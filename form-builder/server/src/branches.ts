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
 * Importing from another branch of flex-plugins than the one the builder reads (master deployed,
 * this checkout locally), e.g. the branch a helpline's changes are being made in. flex-plugins
 * is public: the branches come from GitHub's ref list and each one's files from its download
 * server, as master's do (publicRepo.ts), kept as a snapshot per branch until the branch moves
 * on (repoSnapshot.ts). A few branches are kept at a time.
 */
import { promises as fs } from 'fs';
import path from 'path';

import type { BranchChoice, ImportSource, FromBranch } from '@tech-matters/form-builder-shared';

import { readBranchHeads, newPublicRepoSource } from './publicRepo';
import { newRepoSnapshots, RepoSnapshots, Snapshot } from './repoSnapshot';

export type { ImportSource };

// The folders an import reads
type ConfigDirs = { helplinesConfigDir: string; formDefinitionsDir: string };

export type BranchSource = {
  // The default ('') first, then every branch
  choices(): Promise<BranchChoice[]>;
  snapshot(branch: string): Promise<Snapshot>;
};

// Git's own rules are looser; this is what's safe to put in a URL and a folder name
export const isValidBranch = (branch: string) =>
  /^[A-Za-z0-9._/-]{1,200}$/.test(branch) &&
  !branch.includes('..') &&
  !branch.startsWith('/') &&
  !branch.startsWith('-') &&
  !branch.endsWith('/');

export const newGitHubBranches = (
  // Where the snapshots go (a temporary folder, or a gitignored one locally)
  rootDir: string,
  // The default's label: "master" deployed, "This checkout (local files)" locally
  defaultLabel = 'master',
  ownerAndRepo = 'techmatters/flex-plugins',
  fetchImpl: typeof fetch = fetch,
  maxBranches = 3,
  now = () => Date.now(),
): BranchSource => {
  const snapshotsByBranch = new Map<string, RepoSnapshots>();
  let heads: { at: number; names: string[] } | undefined;

  const choices = async (): Promise<BranchChoice[]> => {
    if (!heads || now() - heads.at > 60_000) {
      const names = [...(await readBranchHeads(ownerAndRepo, fetchImpl)).keys()].filter(isValidBranch);
      heads = { at: now(), names: names.sort((a, b) => a.localeCompare(b)) };
    }
    const others = heads.names.filter(name => defaultLabel !== 'master' || name !== 'master');
    return [{ value: '', label: defaultLabel }, ...others.map(name => ({ value: name, label: name }))];
  };

  const snapshot = async (branch: string): Promise<Snapshot> => {
    if (!isValidBranch(branch)) throw new Error(`Invalid branch ${branch}`);
    let snapshots = snapshotsByBranch.get(branch);
    if (snapshots) {
      // Most recently used last
      snapshotsByBranch.delete(branch);
      snapshotsByBranch.set(branch, snapshots);
    } else {
      snapshots = newRepoSnapshots(
        newPublicRepoSource(ownerAndRepo, branch, fetchImpl),
        path.join(rootDir, branch.replace(/[^A-Za-z0-9._-]/g, '_')),
      );
      snapshotsByBranch.set(branch, snapshots);
      // The oldest branches go, files and all
      while (snapshotsByBranch.size > maxBranches) {
        const [oldest] = snapshotsByBranch.keys();
        snapshotsByBranch.delete(oldest);
        await fs.rm(path.join(rootDir, oldest.replace(/[^A-Za-z0-9._-]/g, '_')), {
          recursive: true,
          force: true,
        });
      }
    }
    return snapshots.latest();
  };

  return { choices, snapshot };
};
