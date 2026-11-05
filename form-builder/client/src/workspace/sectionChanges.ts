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
 * Whether the draft changes what a section of the menu shows, so the menu can mark it "Edited":
 * the files each section writes (a form's own file for the contact tabs and case section forms).
 * Where two sections share a file, the part each writes: PrepopulateMappings.json's formSelector
 * (Filling in the contact) and preEngagement (the webchat form).
 */
import {
  isOperatingInfoPath,
  isPermissionRulesPath,
  isServiceConfigPath,
  isWebchatTranslationsPath,
} from '@tech-matters/form-builder-shared';

import { CATEGORIES_FILE, type DefinitionFileMap, LAYOUT_FILE } from '../common/definitions';
import { isSameJson } from '../drafts/changes';
import {
  CALL_TYPE_BUTTONS_FILE,
  CANNED_RESPONSES_FILE,
  MESSAGES_FILE,
  POST_SURVEY_MESSAGES_FILE,
} from '../chatsAndCalls/sections';
import { CASE_SECTIONS_FILE } from '../cases/caseSections';
import { CASE_STATUS_FILE } from '../cases/caseStatuses';
import { HELPLINE_TERMS_FILE, SUBSTITUTIONS_FILE } from '../translations/translations';
import { PRE_ENGAGEMENT_FILE, PREPOPULATE_MAPPINGS_FILE } from '../webchat/webchat';
import type { View } from './workspaceSlice';

type SectionKind = Exclude<View['kind'], 'contactTab' | 'caseSection'>;

const is =
  (...filePaths: string[]) =>
  (filePath: string) =>
    filePaths.includes(filePath);

// The files each section writes
const SECTION_FILES: Record<SectionKind, (filePath: string) => boolean> = {
  categories: is(CATEGORIES_FILE),
  callTypes: is(CALL_TYPE_BUTTONS_FILE),
  cannedResponses: is(CANNED_RESPONSES_FILE),
  messages: is(MESSAGES_FILE, POST_SURVEY_MESSAGES_FILE),
  // (its labels are in the webchat's translations too)
  webchat: filePath => filePath === PRE_ENGAGEMENT_FILE || isWebchatTranslationsPath(filePath),
  formSelector: () => false,
  caseStatus: is(CASE_STATUS_FILE),
  caseSections: is(CASE_SECTIONS_FILE, LAYOUT_FILE),
  features: isServiceConfigPath,
  serviceConfig: isServiceConfigPath,
  translations: filePath => filePath === SUBSTITUTIONS_FILE || isWebchatTranslationsPath(filePath),
  helplineTerms: is(HELPLINE_TERMS_FILE),
  operatingHours: isOperatingInfoPath,
  permissions: isPermissionRulesPath,
  profiles: filePath => filePath.startsWith('profileForms/'),
};

// The part of PrepopulateMappings.json a section writes
const MAPPINGS_KEYS: Partial<Record<SectionKind, string>> = { formSelector: 'formSelector', webchat: 'preEngagement' };

const mappingsKeyChanged = (original: DefinitionFileMap, files: DefinitionFileMap, key: string) =>
  !isSameJson(
    (original[PREPOPULATE_MAPPINGS_FILE] as Record<string, unknown> | undefined)?.[key],
    (files[PREPOPULATE_MAPPINGS_FILE] as Record<string, unknown> | undefined)?.[key],
  );

/**
 * Whether the draft changes a section. changedPaths are the draft's changed files; formFileOf
 * gives a contact tab's or case section form's file.
 */
export const isSectionChanged = (
  view: View,
  changedPaths: string[],
  original: DefinitionFileMap,
  files: DefinitionFileMap,
  formFileOf: (view: View) => string | undefined,
) => {
  if (view.kind === 'contactTab' || view.kind === 'caseSection') {
    const filePath = formFileOf(view);
    return filePath !== undefined && changedPaths.includes(filePath);
  }
  const mappingsKey = MAPPINGS_KEYS[view.kind];
  if (
    mappingsKey &&
    changedPaths.includes(PREPOPULATE_MAPPINGS_FILE) &&
    mappingsKeyChanged(original, files, mappingsKey)
  ) {
    return true;
  }
  return changedPaths.some(SECTION_FILES[view.kind]);
};
