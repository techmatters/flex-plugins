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
import { SERVICE_CONFIG_FILE_NAMES, serviceConfigPath, WEBCHAT_TRANSLATIONS_PREFIX } from './filePaths';

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
  // Production feature flags, e.g. enable_canned_responses
  featureFlags?: Record<string, boolean>;
  // The helpline's webchat settings, when it has a webchat (aselo-webchat-react-app/configSrc)
  webchat?: WebchatSettings;
  // The service configuration every helpline starts from (twilio-iac/helplines/configs/
  // service-configuration/defaults.json). Read-only here; Aselo staff only, like the helpline's
  // own service configuration files (service-configuration/*.json in files).
  serviceConfigDefaults?: Record<string, unknown>;
};

export type WebchatSettings = {
  // The language the webchat opens in, e.g. 'en-US'
  defaultLocale: string;
  // The pre-engagement field whose answer identifies the contact (e.g. an email field)
  contactIdentifierField?: string;
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

/**
 * The helpline's production feature flags, merged the way Terraform merges the service
 * configuration: shared defaults.json, then the helpline's common.json, then production.json.
 */
export const readFeatureFlags = async (
  helplinesConfigDir: string,
  code: string,
): Promise<Record<string, boolean>> => {
  if (!HELPLINE_CODE_PATTERN.test(code)) return {};
  const serviceConfigFiles = [
    path.join(helplinesConfigDir, 'configs', 'service-configuration', 'defaults.json'),
    path.join(helplinesConfigDir, code, 'configs', 'service-configuration', 'common.json'),
    path.join(helplinesConfigDir, code, 'configs', 'service-configuration', 'production.json'),
  ];
  let flags: Record<string, boolean> = {};
  for (const filePath of serviceConfigFiles) {
    try {
      const config = JSON.parse((await fs.readFile(filePath, 'utf8')).replace(/^﻿/, ''));
      flags = { ...flags, ...(config?.attributes?.feature_flags ?? {}) };
    } catch {
      // Missing or unreadable file: keep what we have
    }
  }
  return flags;
};

// The logo in Flex's header (attributes.logo_url). Staging logos are labelled "STAGING", so
// only production and common settings are used; without one the preview shows a wordmark.
export const readLogoUrl = (helplinesConfigDir: string, code: string) =>
  readServiceConfigValue(
    helplinesConfigDir,
    code,
    (config) => config.attributes?.logo_url ?? config.logo_url,
    ['production.json', 'common.json'],
  );

const readJsonFile = async (filePath: string): Promise<Record<string, any> | undefined> => {
  try {
    return JSON.parse((await fs.readFile(filePath, 'utf8')).replace(/^﻿/, ''));
  } catch {
    return undefined;
  }
};

/**
 * The helpline's service configuration files, exactly as in the repo, keyed under
 * service-configuration/ (files that don't exist yet are left out), and the shared defaults.
 */
export const loadServiceConfigFiles = async (
  helplinesConfigDir: string,
  code: string,
): Promise<{ files: Record<string, unknown>; errors: DefinitionFileError[]; defaults?: Record<string, unknown> }> => {
  const files: Record<string, unknown> = {};
  const errors: DefinitionFileError[] = [];
  if (!HELPLINE_CODE_PATTERN.test(code)) return { files, errors };
  const dir = path.join(helplinesConfigDir, code, 'configs', 'service-configuration');
  await Promise.all(
    SERVICE_CONFIG_FILE_NAMES.map(async (name) => {
      const text = await fs.readFile(path.join(dir, `${name}.json`), 'utf8').catch(() => undefined);
      if (text === undefined) return;
      const key = serviceConfigPath(name);
      try {
        files[key] = JSON.parse(text.replace(/^﻿/, ''));
      } catch (err) {
        errors.push({ path: key, message: (err as Error).message });
      }
    }),
  );
  const defaults = await readJsonFile(path.join(helplinesConfigDir, 'configs', 'service-configuration', 'defaults.json'));
  return { files, errors, defaults };
};

/**
 * The helpline's webchat translation files (configSrc/<code>/translations/<locale>.json),
 * keyed under webchat-app/translations/, plus its settings merged the way the webchat build
 * merges them (scripts/mergeConfigs.js): defaults.json, common.json, then production.json.
 * Undefined when the helpline has no webchat.
 */
export const loadWebchatFiles = async (
  webchatConfigDir: string,
  code: string,
): Promise<{ files: Record<string, unknown>; errors: DefinitionFileError[]; settings: WebchatSettings } | undefined> => {
  if (!HELPLINE_CODE_PATTERN.test(code)) return undefined;
  const helplineDir = path.join(webchatConfigDir, code);
  const common = await readJsonFile(path.join(helplineDir, 'common.json'));
  if (!common) return undefined;
  const settings = {
    ...(await readJsonFile(path.join(webchatConfigDir, 'defaults.json'))),
    ...common,
    ...(await readJsonFile(path.join(helplineDir, 'production.json'))),
  };

  const files: Record<string, unknown> = {};
  const errors: DefinitionFileError[] = [];
  const translationsDir = path.join(helplineDir, 'translations');
  const fileNames = await fs.readdir(translationsDir).catch(() => [] as string[]);
  await Promise.all(
    fileNames
      .filter((fileName) => /^[A-Za-z0-9_-]+\.json$/.test(fileName))
      .map(async (fileName) => {
        const key = `${WEBCHAT_TRANSLATIONS_PREFIX}${fileName}`;
        const text = await fs.readFile(path.join(translationsDir, fileName), 'utf8');
        try {
          files[key] = JSON.parse(text.replace(/^﻿/, ''));
        } catch (err) {
          errors.push({ path: key, message: (err as Error).message });
        }
      }),
  );
  return {
    files,
    errors,
    settings: {
      defaultLocale: typeof settings.defaultLocale === 'string' ? settings.defaultLocale : 'en-US',
      contactIdentifierField:
        typeof settings.contactIdentifierField === 'string' ? settings.contactIdentifierField : undefined,
    },
  };
};

export const loadDefinitionFiles = async (
  rootDir: string,
  code: string,
  version: string,
  helplinesConfigDir?: string,
  webchatConfigDir?: string,
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
  const featureFlags = helplinesConfigDir
    ? await readFeatureFlags(helplinesConfigDir, code)
    : undefined;
  const webchat = webchatConfigDir ? await loadWebchatFiles(webchatConfigDir, code) : undefined;
  // The service configuration, as files the draft can change (Aselo staff only)
  const serviceConfig = helplinesConfigDir ? await loadServiceConfigFiles(helplinesConfigDir, code) : undefined;
  return {
    code,
    version,
    files: { ...files, ...webchat?.files, ...serviceConfig?.files },
    serviceConfigDefaults: serviceConfig?.defaults,
    errors: [...errors, ...(webchat?.errors ?? []), ...(serviceConfig?.errors ?? [])],
    helplineLanguage,
    logoUrl,
    featureFlags,
    webchat: webchat?.settings,
  };
};
