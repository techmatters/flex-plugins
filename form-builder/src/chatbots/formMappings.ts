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
 * Which contact form fields a chatbot's answers fill in: the "survey" part of the helpline's
 * PrepopulateMappings.json (form definitions). When a contact reaches a counselor, the
 * populateHrmContactFormFromTaskByMappings lambda takes the chatbot's answers (task attribute
 * `memory`, by slot name) and copies each into its fields, on the tabs the helpline's form
 * selector picks (Forms › formSelector). A dropdown field only takes an answer that is one of its
 * options (ignoring case); anything else is saved as its "Unknown" option. "age" is special: a
 * number is matched to the age options ("16", ">25").
 */
import type { AnswerType, ChatbotDesign, FormMappings } from './model';

export const PREPOPULATE_FILE = 'PrepopulateMappings.json';

export const formDefinitionsPath = (code: string, version: string) =>
  `lambdas/packages/hrm-form-definitions/form-definitions/${code}/${version}/${PREPOPULATE_FILE}`;

// "a", ["a", "b"] and [["a", "b"], ["c"]] as the lambda reads them: a list of "first of" lists
export const normaliseMapping = (value: unknown): string[][] => {
  const entries = Array.isArray(value) ? value : [value];
  return entries
    .map((entry) => (Array.isArray(entry) ? entry : [entry]).filter((item): item is string => typeof item === 'string'))
    .filter((group) => group.length > 0);
};

// The simplest JSON for it: "a", ["a", "b"], or [["a", "b"], ["c"]] when a field has alternatives
export const mappingJson = (groups: string[][]): unknown => {
  if (groups.every((group) => group.length === 1)) {
    const flat = groups.map((group) => group[0]);
    return flat.length === 1 ? flat[0] : flat;
  }
  return groups;
};

export const readSurveyMappings = (prepopulate: unknown): FormMappings => {
  const survey = (prepopulate as { survey?: Record<string, unknown> } | undefined)?.survey ?? {};
  return Object.fromEntries(
    Object.entries(survey)
      .map(([key, value]) => [key, normaliseMapping(value)] as const)
      .filter(([, groups]) => groups.length > 0),
  );
};

export const setFormTargets = (design: ChatbotDesign, slot: string, groups: string[][]): ChatbotDesign => {
  const { [slot]: removed, ...others } = design.formMappings ?? {};
  return { ...design, formMappings: groups.length > 0 ? { ...others, [slot]: groups } : others };
};

// A question's answer saved under a new name: its fields follow, unless another question still uses the old one
export const renameFormTargets = (design: ChatbotDesign, from: string, to: string): ChatbotDesign => {
  const groups = design.formMappings?.[from];
  if (!groups || from === to || design.formMappings?.[to]) return design;
  const stillUsed = design.bots.some((bot) =>
    bot.intents.some((intent) => intent.questions.some((question) => question.slot === from)),
  );
  if (stillUsed) return design;
  return setFormTargets(setFormTargets(design, from, []), to, groups);
};

/**
 * The contact form fields there are to fill in, from the helpline's form definitions files
 */
export type FormField = { name: string; label: string; type: string; options?: string[]; unknownOption?: string };
export type FormTab = { key: string; label: string; fields: FormField[] };
export type ContactForms = {
  version: string;
  tabs: FormTab[];
  // The survey mappings in the form definitions now
  survey: FormMappings;
  // Whether the helpline reads PrepopulateMappings.json (else the older PrepopulateKeys.json)
  inUse?: boolean;
  // The helpline's formSelector, as in the file (Forms explains it)
  formSelector?: unknown;
};

const TAB_FILES: { key: string; label: string; file: string }[] = [
  { key: 'ChildInformationTab', label: 'Child information', file: 'tabbedForms/ChildInformationTab.json' },
  { key: 'CallerInformationTab', label: 'Caller information', file: 'tabbedForms/CallerInformationTab.json' },
  { key: 'CaseInformationTab', label: 'Case information', file: 'tabbedForms/CaseInformationTab.json' },
];

const SKIPPED_TYPES = ['button', 'copy-to', 'custom-contact-component', 'file-upload'];

export const contactFormsOf = (
  version: string,
  files: Record<string, unknown>,
  featureFlags?: Record<string, boolean>,
): ContactForms => ({
  version,
  tabs: TAB_FILES.map(({ key, label, file }) => ({
    key,
    label,
    fields: (Array.isArray(files[file]) ? (files[file] as Record<string, unknown>[]) : [])
      .filter((item) => typeof item.name === 'string' && !SKIPPED_TYPES.includes(String(item.type)))
      .map((item) => ({
        name: String(item.name),
        label: typeof item.label === 'string' && item.label.trim() ? item.label : String(item.name),
        type: String(item.type),
        ...(Array.isArray(item.options)
          ? { options: (item.options as { value?: unknown }[]).map((option) => String(option.value ?? '')) }
          : {}),
        ...(typeof item.unknownOption === 'string' ? { unknownOption: item.unknownOption } : {}),
      })),
  })).filter((tab) => tab.fields.length > 0),
  survey: readSurveyMappings(files[PREPOPULATE_FILE]),
  ...(featureFlags && 'use_prepopulate_mappings' in featureFlags
    ? { inUse: featureFlags.use_prepopulate_mappings === true }
    : {}),
  formSelector: (files[PREPOPULATE_FILE] as { formSelector?: unknown } | undefined)?.formSelector,
});

export const findFormField = (forms: ContactForms, target: string) => {
  const [tabKey, name] = target.split('.');
  const tab = forms.tabs.find((candidate) => candidate.key === tabKey);
  const field = tab?.fields.find((candidate) => candidate.name === name);
  return tab && field ? { tab, field } : undefined;
};

export const targetLabel = (forms: ContactForms | undefined, target: string) => {
  const found = forms && findFormField(forms, target);
  return found ? `${found.tab.label} › ${found.field.label}` : target;
};

/**
 * Answers a dropdown field doesn't have as an option: they'd be saved as "Unknown". Answers from a
 * pattern or Lex's own types can be anything, so they're reported as "any".
 */
export const unmatchedAnswers = (
  slot: string,
  type: AnswerType | undefined,
  forms: ContactForms,
  target: string,
): string[] | 'any' => {
  const found = findFormField(forms, target);
  if (!found?.field.options || slot === 'age') return [];
  if (!type || type.builtin || type.pattern !== undefined || type.values.length === 0) return 'any';
  const options = new Set(found.field.options.map((option) => option.toLowerCase()));
  return type.values.map((option) => option.value).filter((value) => !options.has(value.toLowerCase()));
};
