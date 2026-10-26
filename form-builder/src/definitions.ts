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
 * Helpers to read the raw definition files (as stored in the repo) for display.
 * Nothing here modifies the files - they must stay round-trippable for export.
 */
import type {
  CategoriesDefinition,
  FormItemJsonDefinition,
  SelectOption,
  StatusInfo,
} from '@hrm-form-definitions/formDefinition/types';

export type DefinitionFileMap = Record<string, unknown>;

export type ContactTab = {
  key: 'CallerInformationTab' | 'ChildInformationTab' | 'CaseInformationTab';
  title: string;
  filePath: string;
  // Key used for this tab in LayoutDefinitions.json -> contact
  layoutKey: string;
};

export const CONTACT_TABS: ContactTab[] = [
  {
    key: 'CallerInformationTab',
    title: 'Caller information',
    filePath: 'tabbedForms/CallerInformationTab.json',
    layoutKey: 'callerInformation',
  },
  {
    key: 'ChildInformationTab',
    title: 'Child information',
    filePath: 'tabbedForms/ChildInformationTab.json',
    layoutKey: 'childInformation',
  },
  {
    key: 'CaseInformationTab',
    title: 'Case information',
    filePath: 'tabbedForms/CaseInformationTab.json',
    layoutKey: 'caseInformation',
  },
];

export const CATEGORIES_FILE = 'tabbedForms/IssueCategorizationTab.json';
const CASE_SECTIONS_FILE = 'CaseSections.json';
const CASE_STATUS_FILE = 'CaseStatus.json';
export const LAYOUT_FILE = 'LayoutDefinitions.json';
export const REFERENCE_DATA_FILE = 'ReferenceData.json';

export type CaseSection = {
  key: string;
  label: string;
  formPath: string;
};

type LayoutEntry = { splitFormAt?: number };

type LayoutDefinitions = {
  contact?: Record<string, LayoutEntry>;
  case?: { sectionTypes?: Record<string, LayoutEntry> };
};

export const getForm = (
  files: DefinitionFileMap,
  filePath: string,
): FormItemJsonDefinition[] | undefined => {
  const form = files[filePath];
  return Array.isArray(form) ? (form as FormItemJsonDefinition[]) : undefined;
};

export const getReferenceData = (files: DefinitionFileMap): Record<string, unknown> =>
  (files[REFERENCE_DATA_FILE] as Record<string, unknown>) ?? {};

const getLayout = (files: DefinitionFileMap): LayoutDefinitions =>
  (files[LAYOUT_FILE] as LayoutDefinitions) ?? {};

export const getContactSplitFormAt = (files: DefinitionFileMap, tab: ContactTab) =>
  getLayout(files).contact?.[tab.layoutKey]?.splitFormAt;

export const getCaseSectionSplitFormAt = (files: DefinitionFileMap, sectionKey: string) =>
  getLayout(files).case?.sectionTypes?.[sectionKey]?.splitFormAt;

export const getCaseSections = (files: DefinitionFileMap): CaseSection[] => {
  const sections = (files[CASE_SECTIONS_FILE] ?? {}) as Record<
    string,
    { label: string; formPath: string }
  >;
  return Object.entries(sections).map(([key, { label, formPath }]) => ({ key, label, formPath }));
};

// A readable name for a form file, e.g. "Child information" or "Household Member (case)"
export const describeDefinitionFile = (files: DefinitionFileMap, filePath: string): string => {
  const tab = CONTACT_TABS.find((contactTab) => contactTab.filePath === filePath);
  if (tab) return tab.title;
  const section = getCaseSections(files).find((caseSection) => caseSection.formPath === filePath);
  return section ? `${section.label} (case)` : filePath;
};

// The default helpline's name from HelplineInformation.json (e.g. "NAMI"), else the code
export const getHelplineName = (files: DefinitionFileMap, code: string): string => {
  const info = files['HelplineInformation.json'] as
    | { helplines?: { label?: string; value: string; default?: boolean }[] }
    | undefined;
  const helplines = info?.helplines ?? [];
  const helpline = helplines.find((h) => h.default) ?? helplines[0];
  return helpline?.label || helpline?.value || code.toUpperCase();
};

export const getCaseStatuses = (files: DefinitionFileMap): StatusInfo[] =>
  Object.values((files[CASE_STATUS_FILE] ?? {}) as Record<string, StatusInfo>);

// IssueCategorizationTab is keyed by the helpline display name (e.g. "NAMI"), not the short code
export const getCategoriesByHelpline = (
  files: DefinitionFileMap,
): Record<string, CategoriesDefinition> =>
  (files[CATEGORIES_FILE] ?? {}) as Record<string, CategoriesDefinition>;

/**
 * Resolves select options the same way the plugin does: either inline `options`,
 * or `optionsReferenceKey` pointing into ReferenceData.json.
 */
export const resolveOptions = <T = SelectOption[]>(
  item: FormItemJsonDefinition,
  referenceData: Record<string, unknown>,
): T | undefined => {
  if ('optionsReferenceKey' in item && typeof item.optionsReferenceKey === 'string') {
    return referenceData[item.optionsReferenceKey] as T | undefined;
  }
  return 'options' in item ? (item.options as T) : undefined;
};

// Mirrors splitAt / splitInHalf in plugin-hrm-form/src/components/common/forms/formGenerators.tsx
export const splitIntoColumns = <T>(items: T[], splitFormAt?: number): [T[], T[]] => {
  const splitIndex = splitFormAt ?? Math.ceil(items.length / 2);
  return [items.slice(0, splitIndex), items.slice(splitIndex)];
};
