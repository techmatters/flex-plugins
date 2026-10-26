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
 * Reads helpline form definitions from a form-definitions directory
 * (lambdas/packages/hrm-form-definitions/form-definitions).
 *
 * Files are returned exactly as stored (raw JSON, keyed by their path relative to the
 * version directory) so the editor can later write them back without losing anything.
 * This is the contract the deployed backend will implement too.
 */
import { promises as fs } from 'fs';
import path from 'path';

export type HelplineSummary = {
  code: string;
  versions: string[];
};

export type DefinitionFileError = {
  path: string;
  message: string;
};

export type DefinitionFiles = {
  code: string;
  version: string;
  // e.g. { 'tabbedForms/CallerInformationTab.json': [...] }
  files: Record<string, unknown>;
  errors: DefinitionFileError[];
  // From the helpline's Flex service configuration, e.g. 'en-US' (decides the UI wording)
  helplineLanguage?: string;
  // Logo for Flex's header, if the helpline's production config sets one
  logoUrl?: string;
};

export class DefinitionsApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

// Strict patterns so request parameters can never escape the form-definitions directory
const HELPLINE_CODE_PATTERN = /^[a-z0-9]+$/;
const VERSION_PATTERN = /^v\d+$/;

const toPosixPath = (filePath: string) => filePath.split(path.sep).join('/');

export const listHelplines = async (rootDir: string): Promise<HelplineSummary[]> => {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const helplines = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && HELPLINE_CODE_PATTERN.test(entry.name))
      .map(async (entry) => {
        const versionEntries = await fs.readdir(path.join(rootDir, entry.name), {
          withFileTypes: true,
        });
        const versions = versionEntries
          .filter((version) => version.isDirectory() && VERSION_PATTERN.test(version.name))
          .map((version) => version.name)
          .sort();
        return { code: entry.name, versions };
      }),
  );
  return helplines
    .filter((helpline) => helpline.versions.length > 0)
    .sort((a, b) => a.code.localeCompare(b.code));
};

const listJsonFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listJsonFiles(fullPath);
      return entry.name.endsWith('.json') ? [fullPath] : [];
    }),
  );
  return nested.flat();
};

/**
 * A value from the helpline's Flex service configuration in
 * twilio-iac/helplines/<code>/configs/service-configuration.
 * production.json overrides common.json (as in Terraform), so it's checked first.
 */
const readServiceConfigValue = async (
  helplinesConfigDir: string,
  code: string,
  pick: (config: Record<string, any>) => unknown,
  fileNames = ['production.json', 'common.json', 'staging.json'],
): Promise<string | undefined> => {
  if (!HELPLINE_CODE_PATTERN.test(code)) return undefined;
  for (const fileName of fileNames) {
    const filePath = path.join(helplinesConfigDir, code, 'configs', 'service-configuration', fileName);
    try {
      const config = JSON.parse((await fs.readFile(filePath, 'utf8')).replace(/^﻿/, ''));
      const value = pick(config ?? {});
      if (typeof value === 'string') return value;
    } catch {
      // Missing or unreadable file: try the next one
    }
  }
  return undefined;
};

export const readHelplineLanguage = (helplinesConfigDir: string, code: string) =>
  readServiceConfigValue(
    helplinesConfigDir,
    code,
    (config) => config.attributes?.helplineLanguage ?? config.helplineLanguage,
  );

// The logo in Flex's header (attributes.logo_url). Staging logos are labelled "STAGING", so
// only production and common settings are used; without one the preview shows a wordmark.
export const readLogoUrl = (helplinesConfigDir: string, code: string) =>
  readServiceConfigValue(
    helplinesConfigDir,
    code,
    (config) => config.attributes?.logo_url ?? config.logo_url,
    ['production.json', 'common.json'],
  );

export const loadDefinitionFiles = async (
  rootDir: string,
  code: string,
  version: string,
  helplinesConfigDir?: string,
): Promise<DefinitionFiles> => {
  if (!HELPLINE_CODE_PATTERN.test(code) || !VERSION_PATTERN.test(version)) {
    throw new DefinitionsApiError(`Invalid helpline code or version: ${code}/${version}`, 400);
  }

  const versionDir = path.join(rootDir, code, version);
  const exists = await fs
    .stat(versionDir)
    .then((stat) => stat.isDirectory())
    .catch(() => false);
  if (!exists) {
    throw new DefinitionsApiError(`No form definitions found for ${code}/${version}`, 404);
  }

  const files: Record<string, unknown> = {};
  const errors: DefinitionFileError[] = [];

  const filePaths = await listJsonFiles(versionDir);
  await Promise.all(
    filePaths.map(async (filePath) => {
      const relativePath = toPosixPath(path.relative(versionDir, filePath));
      const text = await fs.readFile(filePath, 'utf8');
      try {
        // Strip a UTF-8 BOM if present - some definition files were saved with one
        files[relativePath] = JSON.parse(text.replace(/^﻿/, ''));
      } catch (err) {
        errors.push({ path: relativePath, message: (err as Error).message });
      }
    }),
  );

  const helplineLanguage = helplinesConfigDir
    ? await readHelplineLanguage(helplinesConfigDir, code)
    : undefined;
  const logoUrl = helplinesConfigDir ? await readLogoUrl(helplinesConfigDir, code) : undefined;
  return { code, version, files, errors, helplineLanguage, logoUrl };
};
