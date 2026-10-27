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
 * The main helpline features, as switches Aselo staff turn on or off. They're settings in the
 * helpline's service configuration (serviceConfig.ts); the Service configuration page shows
 * them all, per environment.
 */
import type { DefinitionFileMap } from './definitions';
import {
  ConfigObject,
  getIn,
  getServiceConfigFile,
  hasServiceConfig,
  mergedServiceConfig,
  setServiceConfigValue,
} from './serviceConfig';
import { SERVICE_CONFIG_FILE_NAMES } from '../server/filePaths';

export type HelplineFeatures = {
  enableClientProfiles: boolean;
  enableCannedResponses: boolean;
  usePrepopulateMappings: boolean;
};

// Where each switch lives. Client profiles are read by the plugin from
// attributes.enableClientProfiles; the feature flag is kept in step.
const LOCATIONS: Record<keyof HelplineFeatures, string[][]> = {
  enableClientProfiles: [['attributes', 'enableClientProfiles'], ['attributes', 'feature_flags', 'enable_client_profiles']],
  enableCannedResponses: [['attributes', 'feature_flags', 'enable_canned_responses']],
  usePrepopulateMappings: [['attributes', 'feature_flags', 'use_prepopulate_mappings']],
};

// What the plugin does when a switch isn't set at all
const UNSET: HelplineFeatures = {
  enableClientProfiles: true,
  enableCannedResponses: false,
  usePrepopulateMappings: false,
};

export const FEATURE_INFO: { key: keyof HelplineFeatures; title: string; description: string }[] = [
  {
    key: 'enableClientProfiles',
    title: 'Client profiles',
    description:
      'Counselors see a profile for each person who gets in touch (their past contacts and cases, and flags such as “abusive”).',
  },
  {
    key: 'enableCannedResponses',
    title: 'Canned responses',
    description: 'Counselors can insert prepared replies in chats.',
  },
  {
    key: 'usePrepopulateMappings',
    title: 'Fill in contacts with PrepopulateMappings.json',
    description:
      'Survey and webchat answers fill in the contact form as set in PrepopulateMappings.json (instead of the older PrepopulateKeys.json).',
  },
];

const readFeatures = (config: ConfigObject): HelplineFeatures =>
  Object.fromEntries(
    FEATURE_INFO.map(({ key }) => {
      const value = getIn(config, LOCATIONS[key][0]);
      return [key, typeof value === 'boolean' ? value : UNSET[key]];
    }),
  ) as HelplineFeatures;

// As production sees them
export const getFeatures = (files: DefinitionFileMap, defaults?: ConfigObject): HelplineFeatures | undefined =>
  hasServiceConfig(files) ? readFeatures(mergedServiceConfig(files, defaults, 'production')) : undefined;

export const getPermissionConfig = (files: DefinitionFileMap, defaults?: ConfigObject) => {
  const value = getIn(mergedServiceConfig(files, defaults, 'production'), ['attributes', 'permissionConfig']);
  return typeof value === 'string' ? value : undefined;
};

/**
 * Switches a feature in every file that already sets it (so staging and production overrides
 * follow), else in common.json.
 */
export const setFeature = (files: DefinitionFileMap, feature: keyof HelplineFeatures, value: boolean) =>
  LOCATIONS[feature].reduce((current, location) => {
    const setting = SERVICE_CONFIG_FILE_NAMES.filter((name) => getIn(getServiceConfigFile(current, name), location) !== undefined);
    return (setting.length > 0 ? setting : (['common'] as const)).reduce(
      (updated, name) => setServiceConfigValue(updated, name, location, value),
      current,
    );
  }, files);

export const summarizeFeatureChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  // A switch changes when a file writes it differently (setFeature writes the same value everywhere)
  const lines = FEATURE_INFO.flatMap((info) => {
    const written = SERVICE_CONFIG_FILE_NAMES.map((name) => ({
      before: getIn(getServiceConfigFile(originalFiles, name), LOCATIONS[info.key][0]),
      after: getIn(getServiceConfigFile(draftFiles, name), LOCATIONS[info.key][0]),
    })).find(({ before, after }) => before !== after && typeof after === 'boolean');
    return written ? [`${info.title}: switched ${written.after ? 'on' : 'off'}`] : [];
  });
  return lines.length > 0 ? [{ title: 'Helpline features', lines }] : [];
};
