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
 * flex-plugins is public, so master can be read without signing in to GitHub: its commit from
 * the git protocol's ref list (as `git ls-remote` does) and the files from GitHub's download
 * server. Neither counts against GitHub's API rate limits, which are low for anonymous callers.
 */
import type { SnapshotSource } from './repoSnapshot';

// Every branch's head commit (refs/heads/<branch>), from the git protocol's ref list
export const readBranchHeads = async (
  ownerAndRepo: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Map<string, string>> => {
  const url = `https://github.com/${ownerAndRepo}.git/info/refs?service=git-upload-pack`;
  const response = await fetchImpl(url, { headers: { 'User-Agent': 'aselo-form-builder' } });
  if (!response.ok) throw new Error(`Could not read ${ownerAndRepo} from GitHub (${response.status})`);
  const heads = new Map<string, string>();
  (await response.text()).split('\n').forEach(line => {
    const match = line.match(/([0-9a-f]{40}) refs\/heads\/(\S+?)(\0|$)/);
    if (match) heads.set(match[2], match[1]);
  });
  return heads;
};

export const newPublicRepoSource = (
  ownerAndRepo = 'techmatters/flex-plugins',
  branch = 'master',
  fetchImpl: typeof fetch = fetch,
): SnapshotSource => {
  const headSha = async () => {
    const sha = (await readBranchHeads(ownerAndRepo, fetchImpl)).get(branch);
    if (!sha) throw new Error(`${ownerAndRepo} has no ${branch} branch`);
    return sha;
  };

  const tarball = async (sha: string) => {
    const url = `https://codeload.github.com/${ownerAndRepo}/tar.gz/${sha}`;
    const response = await fetchImpl(url, { headers: { 'User-Agent': 'aselo-form-builder' } });
    if (!response.ok) throw new Error(`Could not download ${ownerAndRepo} from GitHub (${response.status})`);
    return Buffer.from(await response.arrayBuffer());
  };

  return { headSha, tarball };
};
