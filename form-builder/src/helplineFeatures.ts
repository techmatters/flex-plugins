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
 * Helpline features Aselo staff switch on or off (see server/features.ts for where they live).
 */
import type { DefinitionFileMap } from './definitions';
import { isSameJson } from './changes';
import type { ValidationIssue } from './validation';
import { FEATURES_FILE, HelplineFeatures } from '../server/filePaths';

export { FEATURES_FILE };
export type { HelplineFeatures };

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

export const getFeatures = (files: DefinitionFileMap) => files[FEATURES_FILE] as HelplineFeatures | undefined;

export const featuresNote = (originalFiles: DefinitionFileMap, draftFiles: DefinitionFileMap): ValidationIssue[] =>
  !isSameJson(getFeatures(originalFiles), getFeatures(draftFiles))
    ? [
        {
          severity: 'warning',
          message:
            'Helpline features changed. They live in the Flex service configuration (twilio-iac/helplines/<code>/configs/service-configuration), so after the PR is merged, apply the service configuration (manageServiceConfig.py) for staging and production.',
        },
      ]
    : [];

export const summarizeFeatureChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const before = getFeatures(originalFiles);
  const after = getFeatures(draftFiles);
  if (!before || !after) return [];
  const lines = FEATURE_INFO.filter((info) => before[info.key] !== after[info.key]).map(
    (info) => `${info.title}: switched ${after[info.key] ? 'on' : 'off'}`,
  );
  return lines.length > 0 ? [{ title: 'Helpline features', lines }] : [];
};
