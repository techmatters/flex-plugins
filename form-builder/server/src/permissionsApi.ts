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
/* eslint-disable max-classes-per-file -- the two places the rules are read from, side by side */

/**
 * A helpline's HRM permissions, which live in the hrm repo (hrm-domain/hrm-core/permission-rules/
 * <name>.json), not in flex-plugins. Which file a helpline uses is permission_config in its .hcl
 * files (usually its code; as, usvt and baseline share demo). Read from a local hrm checkout in
 * development, and from GitHub (the repo is public) when deployed.
 */
import { promises as fs } from 'fs';
import path from 'path';

import {
  type DefinitionFileError,
  type PermissionsInfo,
  permissionRulesPath,
  REPO_HRM_PERMISSION_RULES_DIR,
} from '@tech-matters/form-builder-shared';

export interface PermissionRulesSource {
  // Shown with the rules, e.g. 'techmatters/hrm (master)'
  readonly description: string;
  // The file's text, or undefined when there's no such file
  read(name: string): Promise<string | undefined>;
}

const NAME_PATTERN = /^[a-z0-9]+$/;
const CODE_PATTERN = /^[a-z0-9]+$/;

// A local hrm checkout's permission-rules folder
export class LocalPermissionRules implements PermissionRulesSource {
  constructor(private readonly dir: string, readonly description = 'your local hrm checkout') {}

  async read(name: string) {
    if (!NAME_PATTERN.test(name)) return undefined;
    return fs.readFile(path.join(this.dir, `${name}.json`), 'utf8').catch(() => undefined);
  }
}

// The public hrm repo on GitHub, each file kept for a few minutes
export class GitHubPermissionRules implements PermissionRulesSource {
  private readonly cache = new Map<string, { at: number; text: string | undefined }>();

  readonly description: string;

  constructor(
    private readonly ownerAndRepo = 'techmatters/hrm',
    private readonly branch = 'master',
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly maxAgeMs = 5 * 60 * 1000,
    private readonly now = () => Date.now(),
  ) {
    this.description = `${ownerAndRepo} (${branch})`;
  }

  async read(name: string) {
    if (!NAME_PATTERN.test(name)) return undefined;
    const cached = this.cache.get(name);
    if (cached && this.now() - cached.at < this.maxAgeMs) return cached.text;
    const url = `https://raw.githubusercontent.com/${this.ownerAndRepo}/${this.branch}/${REPO_HRM_PERMISSION_RULES_DIR}/${name}.json`;
    const response = await this.fetchImpl(url, { headers: { 'User-Agent': 'aselo-form-builder' } });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Could not read ${name}.json from ${this.description} (${response.status})`);
    }
    const text = response.ok ? await response.text() : undefined;
    this.cache.set(name, { at: this.now(), text });
    return text;
  }
}

const HCL_FILES = ['common', 'staging', 'production', 'development'] as const;
const PERMISSION_CONFIG_PATTERN = /^\s*permission_config\s*=\s*"([a-z0-9]+)"/m;

// Each environment's rules file, from the helpline's .hcl files (an environment's own over common's)
export const readPermissionConfigs = async (helplinesConfigDir: string, code: string) => {
  if (!CODE_PATTERN.test(code)) return {};
  const found: Partial<Record<(typeof HCL_FILES)[number], string>> = {};
  await Promise.all(
    HCL_FILES.map(async file => {
      const text = await fs.readFile(path.join(helplinesConfigDir, code, `${file}.hcl`), 'utf8').catch(() => '');
      const match = text.match(PERMISSION_CONFIG_PATTERN);
      if (match) found[file] = match[1];
    }),
  );
  const environments: Record<string, string> = {};
  (['staging', 'production'] as const).forEach(environment => {
    const name = found[environment] ?? found.common;
    if (name) environments[environment] = name;
  });
  if (found.development) environments.development = found.development;
  return environments;
};

// The file shown and changed: production's, else staging's, else any
const mainNameOf = (environments: Record<string, string>) =>
  environments.production ?? environments.staging ?? Object.values(environments)[0];

// Other helplines whose staging or production use the same rules file
const helplinesUsing = async (helplinesConfigDir: string, name: string, code: string) => {
  const entries = await fs.readdir(helplinesConfigDir, { withFileTypes: true }).catch(() => []);
  const others = entries.filter(entry => entry.isDirectory() && CODE_PATTERN.test(entry.name) && entry.name !== code);
  const using = await Promise.all(
    others.map(async entry => {
      const { staging, production } = await readPermissionConfigs(helplinesConfigDir, entry.name);
      return staging === name || production === name ? entry.name : undefined;
    }),
  );
  return using.filter((each): each is string => Boolean(each)).sort();
};

// Client profiles are on unless the service configuration turns them off (production, common, then the defaults)
const readClientProfiles = async (helplinesConfigDir: string, code: string) => {
  const files = [
    path.join(helplinesConfigDir, code, 'configs', 'service-configuration', 'production.json'),
    path.join(helplinesConfigDir, code, 'configs', 'service-configuration', 'common.json'),
    path.join(helplinesConfigDir, 'configs', 'service-configuration', 'defaults.json'),
  ];
  for (const file of files) {
    try {
      const config = JSON.parse((await fs.readFile(file, 'utf8')).replace(/^﻿/, ''));
      const value = config?.attributes?.enableClientProfiles ?? config?.enableClientProfiles;
      if (typeof value === 'boolean') return value;
    } catch {
      // Missing or unreadable: try the next one
    }
  }
  return true;
};

export const loadPermissions = async (
  helplinesConfigDir: string,
  code: string,
  source: PermissionRulesSource,
): Promise<{ files: Record<string, unknown>; errors: DefinitionFileError[]; info?: PermissionsInfo }> => {
  const environments = await readPermissionConfigs(helplinesConfigDir, code);
  const name = mainNameOf(environments);
  if (!name) return { files: {}, errors: [] };
  const [sharedWith, clientProfiles] = await Promise.all([
    helplinesUsing(helplinesConfigDir, name, code),
    readClientProfiles(helplinesConfigDir, code),
  ]);
  const info: PermissionsInfo = { name, environments, sharedWith, clientProfiles, source: source.description };
  const key = permissionRulesPath(name);
  let text: string | undefined;
  try {
    text = await source.read(name);
  } catch (err) {
    return { files: {}, errors: [], info: { ...info, error: (err as Error).message } };
  }
  if (text === undefined) {
    return { files: {}, errors: [], info: { ...info, error: `There's no ${name}.json in ${source.description}.` } };
  }
  try {
    return { files: { [key]: JSON.parse(text.replace(/^﻿/, '')) }, errors: [], info };
  } catch (err) {
    return { files: {}, errors: [{ path: key, message: (err as Error).message }], info };
  }
};
