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
 * Helpline features Aselo staff switch on or off, which live in the helpline's Flex service
 * configuration (twilio-iac/helplines/<code>/configs/service-configuration/*.json, applied by
 * manageServiceConfig.py), not in its form definitions.
 *
 * Drafts carry only the switches (FEATURES_FILE), never the service configuration itself;
 * applying writes each changed switch where the configuration sets it.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { serializeLike } from './serializeLike';
import type { HelplineFeatures } from './filePaths';

export { FEATURES_FILE } from './filePaths';
export type { HelplineFeatures } from './filePaths';

// Where each switch lives in the service configuration's attributes. Client profiles are
// read by the plugin from attributes.enableClientProfiles; the feature flag is kept in step.
const LOCATIONS: Record<keyof HelplineFeatures, string[][]> = {
  enableClientProfiles: [['attributes', 'enableClientProfiles'], ['attributes', 'feature_flags', 'enable_client_profiles']],
  enableCannedResponses: [['attributes', 'feature_flags', 'enable_canned_responses']],
  usePrepopulateMappings: [['attributes', 'feature_flags', 'use_prepopulate_mappings']],
};

const DEFAULTS: HelplineFeatures = {
  enableClientProfiles: true,
  enableCannedResponses: false,
  usePrepopulateMappings: false,
};

// The files Terraform merges, most specific last; switches are read as production sees them
const HELPLINE_FILES = ['common.json', 'staging.json', 'production.json'];

const serviceConfigDir = (helplinesConfigDir: string, code: string) =>
  path.join(helplinesConfigDir, code, 'configs', 'service-configuration');

const readJson = async (filePath: string) => {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return { text, json: JSON.parse(text.replace(/^﻿/, '')) as Record<string, unknown> };
  } catch {
    return undefined;
  }
};

const getIn = (node: unknown, keys: string[]): unknown =>
  keys.reduce<unknown>((current, key) => (current as Record<string, unknown> | undefined)?.[key], node);

const setIn = (node: Record<string, unknown>, [key, ...rest]: string[], value: unknown): Record<string, unknown> =>
  rest.length === 0
    ? { ...node, [key]: value }
    : { ...node, [key]: setIn((node[key] ?? {}) as Record<string, unknown>, rest, value) };

export const readHelplineFeatures = async (
  helplinesConfigDir: string,
  code: string,
): Promise<{ features: HelplineFeatures; permissionConfig?: string }> => {
  const files = [
    path.join(helplinesConfigDir, 'configs', 'service-configuration', 'defaults.json'),
    ...['common.json', 'production.json'].map((name) => path.join(serviceConfigDir(helplinesConfigDir, code), name)),
  ];
  const features = { ...DEFAULTS };
  let permissionConfig: string | undefined;
  for (const filePath of files) {
    const config = (await readJson(filePath))?.json;
    (Object.keys(LOCATIONS) as (keyof HelplineFeatures)[]).forEach((feature) => {
      const value = getIn(config, LOCATIONS[feature][0]);
      if (typeof value === 'boolean') features[feature] = value;
    });
    const permissions = getIn(config, ['attributes', 'permissionConfig']) ?? getIn(config, ['permissionConfig']);
    if (typeof permissions === 'string') permissionConfig = permissions;
  }
  return { features, permissionConfig };
};

/**
 * Writes the switches that changed into the helpline's service configuration: into every file
 * that already sets them (so staging and production overrides follow), else into common.json.
 * Returns the files written.
 */
export const applyHelplineFeatures = async (
  helplinesConfigDir: string,
  code: string,
  features: Partial<HelplineFeatures>,
): Promise<string[]> => {
  const { features: current } = await readHelplineFeatures(helplinesConfigDir, code);
  const changed = (Object.keys(LOCATIONS) as (keyof HelplineFeatures)[]).filter(
    (feature) => typeof features[feature] === 'boolean' && features[feature] !== current[feature],
  );
  if (changed.length === 0) return [];

  const dir = serviceConfigDir(helplinesConfigDir, code);
  const loaded = await Promise.all(
    HELPLINE_FILES.map(async (name) => ({ name, file: await readJson(path.join(dir, name)) })),
  );
  const updated = new Map(loaded.filter(({ file }) => file).map(({ name, file }) => [name, file!.json]));

  changed.forEach((feature) => {
    LOCATIONS[feature].forEach((location) => {
      const setting = [...updated.keys()].filter((name) => getIn(updated.get(name), location) !== undefined);
      (setting.length > 0 ? setting : ['common.json']).forEach((name) => {
        updated.set(name, setIn(updated.get(name) ?? {}, location, features[feature]));
      });
    });
  });

  const written: string[] = [];
  for (const { name, file } of loaded) {
    const json = updated.get(name);
    if (!json || JSON.stringify(json) === JSON.stringify(file?.json)) continue;
    const target = path.join(dir, name);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(target, serializeLike(json, file?.text));
    written.push(target);
  }
  return written;
};
