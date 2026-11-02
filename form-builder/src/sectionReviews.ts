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
 * Aselo staff reviewing a draft mark each section of the builder as reviewed, or as needing
 * changes (explained in the section's comments), so they can track what's left and the helpline
 * sees what to fix. A review keeps a fingerprint of the section's own files: when they change
 * after the review (whoever changes them), the section shows as changed since it was reviewed.
 *
 * Only the files a section is about count (e.g. the Caller information form, not the column
 * split in LayoutDefinitions.json it shares with the other tabs), so a change in one section
 * doesn't undo the reviews of the others.
 */
import type { SectionReview } from '../server/drafts';
import { SERVICE_CONFIG_PREFIX, WEBCHAT_TRANSLATIONS_PREFIX } from '../server/filePaths';
import { CASE_SECTIONS_FILE } from './caseSections';
import { CASE_STATUS_FILE } from './caseStatuses';
import { CATEGORIES_FILE, CONTACT_TABS, DefinitionFileMap, FormTarget } from './definitions';
import { FLAG_DURATIONS_FILE, PROFILE_OVERVIEW_FILE, PROFILE_SECTIONS_FILE } from './profiles';
import {
  CALL_TYPE_BUTTONS_FILE,
  CANNED_RESPONSES_FILE,
  MESSAGES_FILE,
  POST_SURVEY_MESSAGES_FILE,
} from './sections';
import { hashJson } from './useDraft';
import { PRE_ENGAGEMENT_FILE, PREPOPULATE_MAPPINGS_FILE } from './webchat';

// The builder's screens (HelplineWorkspace's View)
export type SectionView =
  | { kind: 'contactTab'; tabKey: string }
  | { kind: 'caseSection'; sectionKey: string }
  | {
      kind:
        | 'categories'
        | 'callTypes'
        | 'cannedResponses'
        | 'messages'
        | 'webchat'
        | 'formSelector'
        | 'caseStatus'
        | 'caseSections'
        | 'features'
        | 'serviceConfig'
        | 'profiles';
    };

// reviewed: reviewed and unchanged since; changed: reviewed, then changed; changes-needed: the
// reviewer asked for changes (whether or not it changed since)
export type ReviewState = 'reviewed' | 'changed' | 'changes-needed' | 'none';

export const sectionId = (view: SectionView) => {
  if (view.kind === 'contactTab') return `contactTab:${view.tabKey}`;
  if (view.kind === 'caseSection') return `caseSection:${view.sectionKey}`;
  return view.kind;
};

const FIXED_FILES: Record<string, string[]> = {
  categories: [CATEGORIES_FILE],
  callTypes: [CALL_TYPE_BUTTONS_FILE],
  cannedResponses: [CANNED_RESPONSES_FILE],
  messages: [MESSAGES_FILE, POST_SURVEY_MESSAGES_FILE],
  formSelector: [PREPOPULATE_MAPPINGS_FILE],
  caseStatus: [CASE_STATUS_FILE],
  caseSections: [CASE_SECTIONS_FILE],
  profiles: [PROFILE_SECTIONS_FILE, PROFILE_OVERVIEW_FILE, FLAG_DURATIONS_FILE],
};

// The files a section is about, as they are in `files`
const sectionFiles = (
  view: SectionView,
  files: DefinitionFileMap,
  caseTargets: FormTarget[],
): string[] => {
  const paths = Object.keys(files);
  switch (view.kind) {
    case 'contactTab':
      return CONTACT_TABS.filter((tab) => tab.key === view.tabKey).map((tab) => tab.filePath);
    case 'caseSection':
      return caseTargets
        .filter((target) => target.key === view.sectionKey)
        .map((target) => target.filePath);
    case 'webchat':
      return [
        PRE_ENGAGEMENT_FILE,
        ...paths.filter((filePath) => filePath.startsWith(WEBCHAT_TRANSLATIONS_PREFIX)),
      ];
    // Features are settings in the service configuration files
    case 'features':
    case 'serviceConfig':
      return paths.filter((filePath) => filePath.startsWith(SERVICE_CONFIG_PREFIX));
    default:
      return FIXED_FILES[view.kind] ?? [];
  }
};

export const sectionFingerprint = (
  view: SectionView,
  files: DefinitionFileMap,
  caseTargets: FormTarget[],
) =>
  hashJson(
    Object.fromEntries(
      sectionFiles(view, files, caseTargets)
        .sort()
        .map((filePath) => [filePath, files[filePath] ?? null]),
    ),
  );

export const reviewState = (
  view: SectionView,
  reviews: Record<string, SectionReview> | undefined,
  files: DefinitionFileMap,
  caseTargets: FormTarget[],
): ReviewState => {
  const review = reviews?.[sectionId(view)];
  if (!review) return 'none';
  if (review.status === 'changes-needed') return 'changes-needed';
  return changedSinceReview(review, view, files, caseTargets) ? 'changed' : 'reviewed';
};

export const changedSinceReview = (
  review: SectionReview,
  view: SectionView,
  files: DefinitionFileMap,
  caseTargets: FormTarget[],
) => review.fingerprint !== sectionFingerprint(view, files, caseTargets);
