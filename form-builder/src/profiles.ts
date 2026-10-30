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
 * Client profiles (profileForms/):
 *
 * - Sections.json: the free-text sections of a profile (e.g. Summary). Profiles save each
 *   section under its name, so names never change once they exist.
 * - FlagDurations.json: the options counselors get when flagging a profile, e.g. blocking it
 *   for 24 hours. The plugin's menu tells options apart by duration
 *   (plugin-hrm-form/src/components/profile/profileFlag/ProfileFlagEdit.tsx), so each flag's
 *   durations must differ. durationInHours is stored as text.
 * - ProfileOverview.json: whether the profile's name and identifiers are personal data.
 */
import type {
  ProfileFlagDurationDefinition,
  ProfileSectionDefinition,
} from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from './definitions';
import { isSameJson } from './changes';
import type { ValidationIssue } from './validation';

export const PROFILE_SECTIONS_FILE = 'profileForms/Sections.json';
export const FLAG_DURATIONS_FILE = 'profileForms/FlagDurations.json';
export const PROFILE_OVERVIEW_FILE = 'profileForms/ProfileOverview.json';

export type ProfileOverview = Record<string, { isPII?: boolean }>;

export const getProfileSections = (files: DefinitionFileMap) =>
  (files[PROFILE_SECTIONS_FILE] ?? []) as ProfileSectionDefinition[];
export const getFlagDurations = (files: DefinitionFileMap) =>
  (files[FLAG_DURATIONS_FILE] ?? []) as ProfileFlagDurationDefinition[];
export const getProfileOverview = (files: DefinitionFileMap) =>
  files[PROFILE_OVERVIEW_FILE] as ProfileOverview | undefined;

export const hasProfiles = (files: DefinitionFileMap) =>
  PROFILE_SECTIONS_FILE in files || FLAG_DURATIONS_FILE in files;

// What a new section looks like, following the helplines' existing sections
export const newProfileSection = (label: string, name: string): ProfileSectionDefinition => ({
  name,
  label,
  editLabel: `Edit ${label}`,
  type: 'textarea',
  rows: 20,
  width: 500,
  placeholder: '',
  isPII: true,
});

/**
 * Durations, shown in the largest unit that divides them exactly
 */
export const DURATION_UNITS = [
  { unit: 'weeks', hours: 168 },
  { unit: 'days', hours: 24 },
  { unit: 'hours', hours: 1 },
] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number]['unit'];

export const splitDuration = (hours: number): { amount: number; unit: DurationUnit } => {
  const fit = DURATION_UNITS.find((candidate) => hours > 0 && hours % candidate.hours === 0) ?? DURATION_UNITS[2];
  return { amount: hours / fit.hours, unit: fit.unit };
};

export const toHours = (amount: number, unit: DurationUnit) =>
  amount * DURATION_UNITS.find((candidate) => candidate.unit === unit)!.hours;

// e.g. 43848 -> "about 5 years"; undefined when the exact amount says it all
export const approximateDuration = (hours: number): string | undefined => {
  if (hours >= 8760) {
    const years = Math.round((hours / 8766) * 10) / 10;
    return `about ${years} year${years === 1 ? '' : 's'}`;
  }
  if (hours >= 720 && hours % 168 !== 0) {
    const months = Math.round((hours / 730.5) * 10) / 10;
    return `about ${months} month${months === 1 ? '' : 's'}`;
  }
  return undefined;
};

/**
 * Checks, for the workspace and review
 */
const checkProfiles = (files: DefinitionFileMap): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const add = (message: string) => issues.push({ severity: 'error', message: `Client profiles: ${message}` });
  const sections = getProfileSections(files);
  const names = sections.map((section) => section.name);
  sections.forEach((section, index) => {
    if (!String(section.label ?? '').trim()) add(`profile section ${index + 1} has no title.`);
    if (names.indexOf(section.name) !== index) add(`more than one section is saved as “${section.name}”.`);
  });
  const durations = getFlagDurations(files);
  durations.forEach((duration, index) => {
    const hours = Number(duration.durationInHours);
    if (!String(duration.label ?? '').trim()) add(`a “${duration.flag}” option has no name.`);
    if (!(hours > 0)) add(`“${duration.label}” needs a duration of at least one hour.`);
    if (
      durations.findIndex(
        (other) => other.flag === duration.flag && Number(other.durationInHours) === hours,
      ) !== index
    ) {
      add(`two “${duration.flag}” options last ${duration.durationInHours} hours; each needs a different duration.`);
    }
  });
  return issues;
};

export const validateProfiles = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const before = new Set(checkProfiles(originalFiles).map((found) => found.message));
  return checkProfiles(draftFiles).map((found) =>
    before.has(found.message)
      ? {
          ...found,
          severity: 'warning' as const,
          message: `${found.message} (This was already the case before your changes.)`,
        }
      : found,
  );
};

export const summarizeProfileChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const lines: string[] = [];
  const sectionsBefore = getProfileSections(originalFiles);
  const sectionsAfter = getProfileSections(draftFiles);
  sectionsAfter.forEach((section) => {
    const previous = sectionsBefore.find((old) => old.name === section.name);
    if (!previous) lines.push(`Added the section “${section.label}”`);
    else if (!isSameJson(previous, section)) lines.push(`Changed the section “${section.label}”`);
  });
  sectionsBefore
    .filter((section) => !sectionsAfter.some((other) => other.name === section.name))
    .forEach((section) => lines.push(`Removed the section “${section.label}”`));
  const order = (list: ProfileSectionDefinition[], others: ProfileSectionDefinition[]) =>
    list.map((section) => section.name).filter((name) => others.some((other) => other.name === name));
  if (!isSameJson(order(sectionsBefore, sectionsAfter), order(sectionsAfter, sectionsBefore))) {
    lines.push('Reordered the sections');
  }

  const durationsBefore = getFlagDurations(originalFiles);
  const durationsAfter = getFlagDurations(draftFiles);
  if (!isSameJson(durationsBefore, durationsAfter)) {
    lines.push(
      `Flag options are now: ${
        durationsAfter.map((duration) => `“${duration.label}” (${duration.durationInHours} hours)`).join(', ') || 'none'
      }`,
    );
  }
  if (!isSameJson(getProfileOverview(originalFiles), getProfileOverview(draftFiles))) {
    lines.push('Changed which profile details count as personal data');
  }
  return lines.length > 0 ? [{ title: 'Client profiles', lines }] : [];
};
