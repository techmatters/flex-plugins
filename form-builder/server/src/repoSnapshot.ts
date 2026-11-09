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
 * Deployed, the current files are flex-plugins master. The Lambda downloads master once (about
 * 5 MB), unpacks only the folders the builder reads into its temporary storage, and reuses them
 * until master moves on. So the rest of the server reads plain folders, as it does locally.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import * as tar from 'tar';
import { REPO_FORM_DEFINITIONS_DIR, REPO_WEBCHAT_CONFIG_DIR } from '@tech-matters/form-builder-shared';

const REPO_HELPLINES_CONFIG_DIR = 'twilio-iac/helplines';

const SNAPSHOT_DIRS = [REPO_FORM_DEFINITIONS_DIR, REPO_HELPLINES_CONFIG_DIR, REPO_WEBCHAT_CONFIG_DIR];

type Snapshot = {
  sha: string;
  repoRoot: string;
  formDefinitionsDir: string;
  helplinesConfigDir: string;
  webchatConfigDir: string;
};

export type SnapshotSource = {
  headSha(): Promise<string>;
  tarball(sha: string): Promise<Buffer>;
};

// GitHub's tarballs put everything under one folder (techmatters-flex-plugins-<sha>/)
const isWanted = (entryPath: string) => {
  const inRepo = entryPath.split('/').slice(1).join('/');
  return SNAPSHOT_DIRS.some(dir => inRepo === dir || inRepo.startsWith(`${dir}/`));
};

const extractSnapshot = async (tarball: Buffer, targetDir: string) => {
  await fs.mkdir(targetDir, { recursive: true });
  await pipeline(Readable.from(tarball), tar.x({ cwd: targetDir, strip: 1, filter: entryPath => isWanted(entryPath) }));
};

const snapshotOf = (sha: string, repoRoot: string): Snapshot => ({
  sha,
  repoRoot,
  formDefinitionsDir: path.join(repoRoot, REPO_FORM_DEFINITIONS_DIR),
  helplinesConfigDir: path.join(repoRoot, REPO_HELPLINES_CONFIG_DIR),
  webchatConfigDir: path.join(repoRoot, REPO_WEBCHAT_CONFIG_DIR),
});

export const newRepoSnapshots = (
  source: SnapshotSource,
  rootDir: string,
  // How long master is assumed unchanged between checks
  maxAgeMs = 30_000,
  now = () => Date.now(),
) => {
  let current: Snapshot | undefined;

  let checkedAt = 0;

  let pending: Promise<Snapshot> | undefined;

  const latest = async (): Promise<Snapshot> => {
    if (current && now() - checkedAt < maxAgeMs) return current;
    // Requests arriving together share one check (and one download)
    pending ??= refresh().finally(() => {
      pending = undefined;
    });
    return pending;
  };

  const refresh = async (): Promise<Snapshot> => {
    const sha = await source.headSha();
    checkedAt = now();
    if (current?.sha === sha) return current;

    const repoRoot = path.join(rootDir, sha);
    const complete = path.join(repoRoot, '.complete');
    const alreadyThere = await fs.stat(complete).then(
      () => true,
      () => false,
    );
    if (!alreadyThere) {
      await fs.rm(repoRoot, { recursive: true, force: true });
      await extractSnapshot(await source.tarball(sha), repoRoot);
      await fs.writeFile(complete, sha);
    }

    // Older snapshots aren't needed any more (a Lambda instance handles one request at a time,
    // so nothing is still reading them)
    const previous = current;
    current = snapshotOf(sha, repoRoot);
    if (previous) await fs.rm(previous.repoRoot, { recursive: true, force: true });
    return current;
  };

  return { latest };
};

export type RepoSnapshots = ReturnType<typeof newRepoSnapshots>;
