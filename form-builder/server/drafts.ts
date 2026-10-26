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
 * Drafts: work in progress on a helpline's definitions, kept apart from the real files until
 * Aselo staff apply them.
 *
 * A draft holds only the files that changed, at their paths inside the version folder, plus
 * metadata. Stored as:
 *
 *   <root>/<code>/<version>/draft.json          metadata
 *   <root>/<code>/<version>/files/<path>.json   one per changed file
 *
 * LocalDraftStore keeps them in a folder (form-builder/drafts, gitignored) for local use; the
 * deployed version uses the same layout in a private, versioned S3 bucket.
 */
import { promises as fs } from 'fs';
import path from 'path';

export type DraftStatus = 'editing' | 'submitted';

export type DraftMeta = {
  // Goes up by one with every save, so two people can't overwrite each other unknowingly
  revision: number;
  status: DraftStatus;
  updatedAt: string;
  updatedBy: string;
  submittedAt?: string;
  submittedBy?: string;
  // Hash of each file as it was when the draft started, to spot changes made underneath it
  baseHashes: Record<string, string>;
};

export type Draft = {
  code: string;
  version: string;
  meta: DraftMeta;
  files: Record<string, unknown>;
};

export type DraftSummary = Pick<Draft, 'code' | 'version' | 'meta'> & { changedFiles: string[] };

export interface DraftStore {
  get(code: string, version: string): Promise<Draft | undefined>;
  put(draft: Draft): Promise<void>;
  remove(code: string, version: string): Promise<void>;
  list(): Promise<DraftSummary[]>;
}

const CODE_PATTERN = /^[a-z0-9]+$/;
const VERSION_PATTERN = /^v\d+$/;
// Paths of definition files inside a version folder, e.g. tabbedForms/ChildInformationTab.json
const FILE_PATH_PATTERN = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*\.json$/;

export const isValidDraftKey = (code: string, version: string) =>
  CODE_PATTERN.test(code) && VERSION_PATTERN.test(version);

export const isValidDraftFilePath = (filePath: string) =>
  FILE_PATH_PATTERN.test(filePath) && !filePath.split('/').includes('..');

const readJson = async <T>(filePath: string): Promise<T | undefined> => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
  } catch {
    return undefined;
  }
};

const listFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? listFiles(path.join(dir, entry.name))
        : Promise.resolve([path.join(dir, entry.name)]),
    ),
  );
  return nested.flat();
};

export class LocalDraftStore implements DraftStore {
  constructor(private readonly rootDir: string) {}

  private draftDir(code: string, version: string) {
    if (!isValidDraftKey(code, version)) throw new Error(`Invalid draft ${code}/${version}`);
    return path.join(this.rootDir, code, version);
  }

  async get(code: string, version: string): Promise<Draft | undefined> {
    const dir = this.draftDir(code, version);
    const meta = await readJson<DraftMeta>(path.join(dir, 'draft.json'));
    if (!meta) return undefined;
    const filesDir = path.join(dir, 'files');
    const files: Record<string, unknown> = {};
    for (const filePath of await listFiles(filesDir)) {
      const relative = path.relative(filesDir, filePath).split(path.sep).join('/');
      files[relative] = await readJson(filePath);
    }
    return { code, version, meta, files };
  }

  async put({ code, version, meta, files }: Draft): Promise<void> {
    const dir = this.draftDir(code, version);
    Object.keys(files).forEach((filePath) => {
      if (!isValidDraftFilePath(filePath)) throw new Error(`Invalid file path ${filePath}`);
    });
    // Replace the whole draft, so files that went back to unchanged disappear
    await fs.rm(path.join(dir, 'files'), { recursive: true, force: true });
    for (const [filePath, value] of Object.entries(files)) {
      const target = path.join(dir, 'files', ...filePath.split('/'));
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
    }
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'draft.json'), `${JSON.stringify(meta, null, 2)}\n`);
  }

  async remove(code: string, version: string): Promise<void> {
    await fs.rm(this.draftDir(code, version), { recursive: true, force: true });
  }

  async list(): Promise<DraftSummary[]> {
    const summaries: DraftSummary[] = [];
    const codes = await fs.readdir(this.rootDir, { withFileTypes: true }).catch(() => []);
    for (const codeEntry of codes.filter((entry) => entry.isDirectory())) {
      const versions = await fs
        .readdir(path.join(this.rootDir, codeEntry.name), { withFileTypes: true })
        .catch(() => []);
      for (const versionEntry of versions.filter((entry) => entry.isDirectory())) {
        if (!isValidDraftKey(codeEntry.name, versionEntry.name)) continue;
        const draft = await this.get(codeEntry.name, versionEntry.name);
        if (draft) {
          summaries.push({
            code: draft.code,
            version: draft.version,
            meta: draft.meta,
            changedFiles: Object.keys(draft.files).sort(),
          });
        }
      }
    }
    return summaries;
  }
}

/**
 * Keeps drafts in memory; used by tests.
 */
export class MemoryDraftStore implements DraftStore {
  private drafts = new Map<string, Draft>();

  async get(code: string, version: string) {
    const draft = this.drafts.get(`${code}/${version}`);
    return draft ? structuredClone(draft) : undefined;
  }

  async put(draft: Draft) {
    this.drafts.set(`${draft.code}/${draft.version}`, structuredClone(draft));
  }

  async remove(code: string, version: string) {
    this.drafts.delete(`${code}/${version}`);
  }

  async list() {
    return [...this.drafts.values()].map(({ code, version, meta, files }) => ({
      code,
      version,
      meta,
      changedFiles: Object.keys(files).sort(),
    }));
  }
}
