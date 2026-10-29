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
 * Deployed "Apply": one commit with the draft's files on a new branch from master, and a PR for
 * people to review and merge as usual. Each file keeps its existing style (indentation, line
 * endings, BOM) so the diff only shows real changes.
 */
import { promises as fs } from 'fs';
import path from 'path';
import type { ApiUser, ApplyDetails, ApplyResult, DraftApplier } from './api';
import type { Draft } from './drafts';
import { repoPathOf } from './filePaths';
import type { GitHubClient } from './github';
import type { RepoSnapshots } from './repoSnapshot';
import { serializeLike } from './serializeLike';

const pad = (value: number) => String(value).padStart(2, '0');

// e.g. form-builder/usnm/v1-20261027-0945
export const branchNameFor = (draft: Draft, now: Date) =>
  `form-builder/${draft.code}/${draft.version}-${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(
    now.getUTCDate(),
  )}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;

export class GitHubApplier implements DraftApplier {
  constructor(
    private readonly github: GitHubClient,
    private readonly snapshots: RepoSnapshots,
    private readonly baseBranch = 'master',
    private readonly now = () => new Date(),
  ) {}

  async apply(draft: Draft, user: ApiUser, details: ApplyDetails = {}): Promise<ApplyResult> {
    const snapshot = await this.snapshots.latest();
    const files = await Promise.all(
      Object.entries(draft.files).map(async ([filePath, value]) => {
        const repoPath = repoPathOf(draft.code, draft.version, filePath);
        const existingText = await fs
          .readFile(path.join(snapshot.repoRoot, ...repoPath.split('/')), 'utf8')
          .catch(() => undefined);
        return { repoPath, content: serializeLike(value, existingText) };
      }),
    );

    const helpline = draft.code.toUpperCase();
    const baseCommit = await this.github.request<{ tree: { sha: string } }>('GET', `/git/commits/${snapshot.sha}`);
    const tree = await this.github.request<{ sha: string }>('POST', '/git/trees', {
      base_tree: baseCommit.tree.sha,
      tree: files.map(({ repoPath, content }) => ({ path: repoPath, mode: '100644', type: 'blob', content })),
    });
    const coAuthor = user.email ? `\n\nCo-authored-by: ${user.name} <${user.email}>` : '';
    const commit = await this.github.request<{ sha: string }>('POST', '/git/commits', {
      message: `${helpline}: Form changes (${draft.version})\n\nApplied by ${user.name} from the Aselo Builder.${coAuthor}`,
      tree: tree.sha,
      parents: [snapshot.sha],
    });

    const branch = branchNameFor(draft, this.now());
    await this.github.request('POST', '/git/refs', { ref: `refs/heads/${branch}`, sha: commit.sha });
    const pull = await this.github.request<{ number: number; html_url: string }>('POST', '/pulls', {
      title: `${helpline}: Form changes (${draft.version})`,
      head: branch,
      base: this.baseBranch,
      body: [
        details.description?.trim() || `Files changed:\n\n${files.map(({ repoPath }) => `- \`${repoPath}\``).join('\n')}`,
        '',
        `---`,
        `Applied by ${user.name} from the Aselo Builder. Draft last edited by ${draft.meta.updatedBy}.`,
      ].join('\n'),
    });

    return {
      description: `Opened PR #${pull.number} for review. Once it's merged, deploy as usual.`,
      written: files.map(({ repoPath }) => repoPath),
      link: pull.html_url,
    };
  }
}
