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

export class PublicRepoSource implements SnapshotSource {
  constructor(
    private readonly ownerAndRepo = 'techmatters/flex-plugins',
    private readonly branch = 'master',
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async headSha() {
    const url = `https://github.com/${this.ownerAndRepo}.git/info/refs?service=git-upload-pack`;
    const response = await this.fetchImpl(url, { headers: { 'User-Agent': 'aselo-form-builder' } });
    if (!response.ok) throw new Error(`Could not read ${this.ownerAndRepo} from GitHub (${response.status})`);
    const branchRef = `refs/heads/${this.branch}`;
    const match = (await response.text())
      .split('\n')
      .map((line) => line.match(/([0-9a-f]{40}) (\S+?)(\0|$)/))
      .find((found) => found?.[2] === branchRef);
    if (!match) throw new Error(`${this.ownerAndRepo} has no ${this.branch} branch`);
    return match[1];
  }

  async tarball(sha: string) {
    const url = `https://codeload.github.com/${this.ownerAndRepo}/tar.gz/${sha}`;
    const response = await this.fetchImpl(url, { headers: { 'User-Agent': 'aselo-form-builder' } });
    if (!response.ok) throw new Error(`Could not download ${this.ownerAndRepo} from GitHub (${response.status})`);
    return Buffer.from(await response.arrayBuffer());
  }
}
