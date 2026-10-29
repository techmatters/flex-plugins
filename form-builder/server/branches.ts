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
import { readBranchHeads, PublicRepoSource } from './publicRepo';
import { RepoSnapshots, Snapshot } from './repoSnapshot';

// The folders an import reads
export type ConfigDirs = { helplinesConfigDir: string; formDefinitionsDir: string };

export type BranchChoice = {
  // '' is what the builder reads anyway (master deployed, this checkout locally)
  value: string;
  label: string;
};

// Where an import was read from, when it wasn't the default
export type ImportSource = { branch: string; sha: string };
export type FromBranch = { source?: ImportSource };

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

export class GitHubBranches implements BranchSource {
  private snapshots = new Map<string, RepoSnapshots>();
  private heads?: { at: number; names: string[] };

  constructor(
    // Where the snapshots go (a temporary folder, or a gitignored one locally)
    private readonly rootDir: string,
    // The default's label: "master" deployed, "This checkout (local files)" locally
    private readonly defaultLabel = 'master',
    private readonly ownerAndRepo = 'techmatters/flex-plugins',
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly maxBranches = 3,
    private readonly now = () => Date.now(),
  ) {}

  async choices(): Promise<BranchChoice[]> {
    if (!this.heads || this.now() - this.heads.at > 60_000) {
      const names = [...(await readBranchHeads(this.ownerAndRepo, this.fetchImpl)).keys()].filter(isValidBranch);
      this.heads = { at: this.now(), names: names.sort((a, b) => a.localeCompare(b)) };
    }
    const others = this.heads.names.filter((name) => this.defaultLabel !== 'master' || name !== 'master');
    return [{ value: '', label: this.defaultLabel }, ...others.map((name) => ({ value: name, label: name }))];
  }

  async snapshot(branch: string): Promise<Snapshot> {
    if (!isValidBranch(branch)) throw new Error(`Invalid branch ${branch}`);
    let snapshots = this.snapshots.get(branch);
    if (!snapshots) {
      snapshots = new RepoSnapshots(
        new PublicRepoSource(this.ownerAndRepo, branch, this.fetchImpl),
        path.join(this.rootDir, branch.replace(/[^A-Za-z0-9._-]/g, '_')),
      );
      this.snapshots.set(branch, snapshots);
      // The oldest branches go, files and all
      while (this.snapshots.size > this.maxBranches) {
        const [oldest] = this.snapshots.keys();
        this.snapshots.delete(oldest);
        await fs.rm(path.join(this.rootDir, oldest.replace(/[^A-Za-z0-9._-]/g, '_')), {
          recursive: true,
          force: true,
        });
      }
    } else {
      // Most recently used last
      this.snapshots.delete(branch);
      this.snapshots.set(branch, snapshots);
    }
    return snapshots.latest();
  }
}
