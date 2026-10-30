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
 * The kinds of things counselors add to a case (Note, Referral, Household member...):
 *
 * - CaseSections.json: { <key>: { label, formPath } }. Cases save section items under the key,
 *   so it never changes once a section exists.
 * - caseForms/<Name>Form.json: the section's form (edited with the form editor).
 * - LayoutDefinitions.json case.sectionTypes.<key>: where it shows on the case
 *   (caseHomeLocation 'list' or 'timeline'), its order (caseHomeOrder), the fields shown in the
 *   list (previewFields) and the form's column split.
 * - The heading and add button come from the translation keys
 *   Case-SectionList-Title/<key> and Case-SectionList-Add/<key> (plugin translations, or the
 *   helpline's customStrings/Substitutions.json).
 */
import type { DefinitionFileMap } from './definitions';
import { getCaseSections, getForm, LAYOUT_FILE } from './definitions';
import { isSameJson } from './changes';
import { toFieldName } from './formEditing';
import type { ValidationIssue } from './validation';

export const CASE_SECTIONS_FILE = 'CaseSections.json';
export const SUBSTITUTIONS_FILE = 'customStrings/Substitutions.json';

export const titleKey = (sectionKey: string) => `Case-SectionList-Title/${sectionKey}`;
export const addKey = (sectionKey: string) => `Case-SectionList-Add/${sectionKey}`;

export type SectionLayout = {
  splitFormAt?: number;
  caseHomeOrder?: number;
  caseHomeLocation?: 'list' | 'timeline';
  previewFields?: string[];
  [other: string]: unknown;
};

type Layout = { case?: { sectionTypes?: Record<string, SectionLayout> }; [other: string]: unknown };

export const getSectionLayout = (files: DefinitionFileMap, key: string): SectionLayout =>
  ((files[LAYOUT_FILE] as Layout | undefined)?.case?.sectionTypes?.[key] ?? {}) as SectionLayout;

export const setSectionLayout = (files: DefinitionFileMap, key: string, layout: SectionLayout | undefined) => {
  const current = (files[LAYOUT_FILE] ?? {}) as Layout;
  const { [key]: _old, ...others } = current.case?.sectionTypes ?? {};
  return {
    ...files,
    [LAYOUT_FILE]: {
      ...current,
      case: { ...current.case, sectionTypes: layout ? { ...current.case?.sectionTypes, [key]: layout } : others },
    },
  };
};

// The helpline's own wording, by base language (e.g. 'en' for 'en-US')
export const baseLanguageOf = (helplineLanguage = 'en-US') => helplineLanguage.split('-')[0];

export const setSubstitution = (
  files: DefinitionFileMap,
  language: string,
  key: string,
  text: string | undefined,
): DefinitionFileMap => {
  const substitutions = (files[SUBSTITUTIONS_FILE] ?? {}) as Record<string, Record<string, string>>;
  const { [key]: _old, ...others } = substitutions[language] ?? {};
  return {
    ...files,
    [SUBSTITUTIONS_FILE]: {
      ...substitutions,
      [language]: text === undefined ? others : { ...substitutions[language], [key]: text },
    },
  };
};

const pascalCase = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

/**
 * Adds a section: its entry, a form with one "Details" field to start from, where it shows,
 * and its heading and add button in the helpline's language.
 */
export const addCaseSection = (
  files: DefinitionFileMap,
  label: string,
  language: string,
): { files: DefinitionFileMap; key: string } => {
  const sections = (files[CASE_SECTIONS_FILE] ?? {}) as Record<string, { label: string; formPath: string }>;
  const base = toFieldName(label) || 'section';
  let key = base;
  for (let n = 2; key in sections || `caseForms/${pascalCase(key)}Form.json` in files; n += 1) key = `${base}${n}`;
  const formPath = `caseForms/${pascalCase(key)}Form.json`;

  let next: DefinitionFileMap = {
    ...files,
    [CASE_SECTIONS_FILE]: { ...sections, [key]: { label, formPath } },
    [formPath]: [{ name: 'details', label: 'Details', type: 'textarea', isPII: true }],
  };
  const orders = getCaseSections(files).map((section) => getSectionLayout(files, section.key).caseHomeOrder ?? 0);
  next = setSectionLayout(next, key, {
    caseHomeOrder: Math.max(0, ...orders) + 1,
    previewFields: ['details'],
  });
  next = setSubstitution(next, language, titleKey(key), label);
  next = setSubstitution(next, language, addKey(key), label);
  return { files: next, key };
};

/**
 * Removes a section and its settings. Drafts add or change files but don't delete them, so
 * the form file of a section the repo already has stays there, unused; a section added in
 * this draft disappears completely. Its texts are left: they're harmless.
 */
export const removeCaseSection = (files: DefinitionFileMap, key: string): DefinitionFileMap => {
  const sections = { ...((files[CASE_SECTIONS_FILE] ?? {}) as Record<string, { label: string; formPath: string }>) };
  const { formPath } = sections[key] ?? {};
  delete sections[key];
  const next: DefinitionFileMap = setSectionLayout({ ...files, [CASE_SECTIONS_FILE]: sections }, key, undefined);
  // Another section could share the form file
  if (formPath && !Object.values(sections).some((section) => section.formPath === formPath)) delete next[formPath];
  return next;
};

/**
 * Checks, for the workspace and review
 */
const checkCaseSections = (files: DefinitionFileMap): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  getCaseSections(files).forEach((section) => {
    const add = (message: string) => issues.push({ severity: 'error', message: `Case sections: ${message}` });
    if (!String(section.label ?? '').trim()) add(`the section saved as “${section.key}” has no name.`);
    const form = getForm(files, section.formPath);
    if (!form) add(`“${section.label}” has no form (${section.formPath}).`);
    else if (form.length === 0) add(`“${section.label}” has no fields.`);
    (getSectionLayout(files, section.key).previewFields ?? [])
      .filter((name) => form && !form.some((item) => item.name === name))
      .forEach((name) =>
        issues.push({
          severity: 'warning',
          message: `Case sections: “${section.label}” shows “${name}” in its list, but its form has no such field.`,
        }),
      );
  });
  return issues;
};

export const validateCaseSections = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const before = new Set(checkCaseSections(originalFiles).map((found) => found.message));
  return checkCaseSections(draftFiles).map((found) =>
    found.severity === 'error' && before.has(found.message)
      ? {
          ...found,
          severity: 'warning' as const,
          message: `${found.message} (This was already the case before your changes.)`,
        }
      : found,
  );
};

export const summarizeCaseSectionChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const before = getCaseSections(originalFiles);
  const after = getCaseSections(draftFiles);
  const lines: string[] = [];
  after.forEach((section) => {
    const previous = before.find((old) => old.key === section.key);
    if (!previous) {
      lines.push(`Added the section “${section.label}”`);
      return;
    }
    if (previous.label !== section.label) lines.push(`Renamed “${previous.label}” to “${section.label}”`);
    const layoutBefore = getSectionLayout(originalFiles, section.key);
    const layoutAfter = getSectionLayout(draftFiles, section.key);
    if ((layoutBefore.caseHomeLocation ?? 'list') !== (layoutAfter.caseHomeLocation ?? 'list')) {
      lines.push(`“${section.label}” now shows ${layoutAfter.caseHomeLocation === 'timeline' ? 'on the timeline' : 'as a list'}`);
    }
    if (!isSameJson(layoutBefore.previewFields, layoutAfter.previewFields)) {
      lines.push(`“${section.label}” shows different fields in its list`);
    }
  });
  before
    .filter((section) => !after.some((other) => other.key === section.key))
    .forEach((section) => lines.push(`Removed the section “${section.label}”`));
  const orderOf = (files: DefinitionFileMap, sections: typeof before) =>
    sections.map((section) => `${section.key}:${getSectionLayout(files, section.key).caseHomeOrder ?? ''}`);
  const kept = (files: DefinitionFileMap, sections: typeof before, others: typeof before) =>
    orderOf(files, sections.filter((section) => others.some((other) => other.key === section.key)));
  if (!isSameJson(kept(originalFiles, before, after), kept(draftFiles, after, before))) {
    lines.push('Sections were reordered');
  }
  return lines.length > 0 ? [{ title: 'Case sections', lines }] : [];
};
