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
 * Checks a contact form before export. Combines the Aselo specification from the
 * hrm-form-definitions package with checks for mistakes the editor makes possible.
 *
 * Problems that already existed before the user's changes are reported as warnings, so a
 * helpline with an old quirk can still export unrelated edits.
 */
import type {
  DependentOptions,
  FormDefinition,
  FormItemJsonDefinition,
  SelectOption,
} from '@hrm-form-definitions/formDefinition/types';
import type { OneToOneConfigSpec } from '@hrm-form-definitions/formDefinition/insightsConfig';
import type { ContactTab, DefinitionFileMap } from './definitions';
import { getForm, getReferenceData, resolveOptions } from './definitions';
import { isBlankOption, isChoiceType } from './formEditing';
import { getContactTabSpecification, validateFormDefinition } from './specification';

export type ValidationIssue = {
  severity: 'error' | 'warning';
  message: string;
  fieldName?: string;
};

const FIELD_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const ONE_TO_ONE_FILE = 'insights/oneToOneConfigSpec.json';

const describeField = (item: FormItemJsonDefinition) => `“${item.label || item.name}”`;

const checkOptions = (item: FormItemJsonDefinition, options: SelectOption[]): string[] => {
  const problems: string[] = [];
  const realOptions = options.filter((option, index) => !isBlankOption(option, index));
  if (realOptions.length === 0) {
    problems.push(`${describeField(item)} needs at least one answer to choose from.`);
  }
  if (realOptions.some((option) => String(option.label ?? '').trim() === '')) {
    problems.push(`${describeField(item)} has an answer with no text.`);
  }
  const values = options.map((option) => String(option.value));
  const duplicates = [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
  if (duplicates.length > 0) {
    problems.push(
      `${describeField(item)} has the same answer more than once: ${duplicates.join(', ')}.`,
    );
  }
  return problems;
};

// Every value a field can have: its answers, or for a linked dropdown, all of its lists
const allValuesOf = (item: FormItemJsonDefinition, referenceData: Record<string, unknown>) => {
  const options = resolveOptions<SelectOption[] | DependentOptions>(item, referenceData);
  if (!options) return [];
  const lists = Array.isArray(options) ? [options] : Object.values(options);
  return lists.flat().map((option) => String(option.value));
};

const checkLinkedDropdown = (
  item: Extract<FormItemJsonDefinition, { dependsOn: string }>,
  form: FormItemJsonDefinition[],
  referenceData: Record<string, unknown>,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const lists = resolveOptions<DependentOptions>(item, referenceData);
  if (!lists) {
    return [
      {
        severity: 'error',
        message: `The answers for ${describeField(item)} could not be found.`,
        fieldName: item.name,
      },
    ];
  }
  if (Object.keys(lists).length === 0) {
    return [
      {
        severity: 'error',
        message: `${describeField(item)} has no answers yet.`,
        fieldName: item.name,
      },
    ];
  }

  Object.entries(lists).forEach(([key, options]) => {
    const values = options.map((option) => String(option.value));
    if (new Set(values).size !== values.length) {
      issues.push({
        severity: 'error',
        message: `${describeField(item)} has the same answer more than once under “${key}”.`,
        fieldName: item.name,
      });
    }
    if (options.some((option) => !String(option.label ?? '').trim())) {
      issues.push({
        severity: 'error',
        message: `${describeField(item)} has an answer with no text under “${key}”.`,
        fieldName: item.name,
      });
    }
  });

  const parent = form.find((other) => other.name === item.dependsOn);
  if (!parent) return issues;
  const parentValues = allValuesOf(parent, referenceData);
  const parentValueCounts = new Map<string, number>();
  parentValues.forEach((value) => parentValueCounts.set(value, (parentValueCounts.get(value) ?? 0) + 1));

  const unused = Object.keys(lists).filter((key) => !parentValueCounts.has(key));
  if (unused.length > 0) {
    issues.push({
      severity: 'warning',
      message: `${describeField(item)} has answers filed under ${unused.length} value(s) that aren't answers of ${describeField(parent)} (e.g. “${unused[0]}”), so counselors never see them.`,
      fieldName: item.name,
    });
  }
  const shared = Object.keys(lists).filter((key) => (parentValueCounts.get(key) ?? 0) > 1);
  if (shared.length > 0) {
    issues.push({
      severity: 'warning',
      message: `${shared.length} answer(s) of ${describeField(parent)} share a name with another (e.g. “${shared[0]}”), so they all show the same ${describeField(item)} answers. Re-importing the list from a spreadsheet fixes this.`,
      fieldName: item.name,
    });
  }
  return issues;
};

const checkForm = (
  form: FormItemJsonDefinition[],
  tab: ContactTab,
  files: DefinitionFileMap,
): ValidationIssue[] => {
  const referenceData = getReferenceData(files);
  const issues: ValidationIssue[] = [];
  const error = (message: string, fieldName?: string) =>
    issues.push({ severity: 'error', message, fieldName });

  const names = form.map((item) => item.name);
  form.forEach((item) => {
    if (!item.name) {
      error(`A field in ${tab.title} has no name.`);
    } else if (!FIELD_NAME_PATTERN.test(item.name)) {
      error(`Field name “${item.name}” can only use letters and numbers.`, item.name);
    }
    if (names.filter((name) => name === item.name).length > 1) {
      error(`More than one field is saved as “${item.name}”. Field names must be unique.`, item.name);
    }
    if (!String(item.label ?? '').trim() && item.type !== 'custom-contact-component') {
      error(`A field in ${tab.title} has no label (saved as “${item.name}”).`, item.name);
    }
    if (isChoiceType(item.type)) {
      const options = resolveOptions(item, referenceData);
      if (!options) {
        error(`The answers for ${describeField(item)} could not be found.`, item.name);
      } else {
        checkOptions(item, options).forEach((message) => error(message, item.name));
      }
    }
    if (item.type === 'dependent-select') {
      if (!names.includes(item.dependsOn)) {
        error(
          `${describeField(item)} depends on “${item.dependsOn}”, which isn't in this form.`,
          item.name,
        );
      }
      checkLinkedDropdown(item, form, referenceData).forEach((issue) => issues.push(issue));
    }
  });

  // The Aselo specification, using the package's own validator
  const expandedForm = form.map((item) => {
    const options = resolveOptions(item, referenceData);
    return (options ? { ...item, options } : item) as FormDefinition[number];
  });
  const report = validateFormDefinition(getContactTabSpecification(tab.key), expandedForm);
  report.issues.forEach((message) => error(message));
  Object.entries(report.itemReports).forEach(([fieldName, itemReport]) =>
    itemReport.issues.forEach((message) =>
      error(
        message === 'Required form item not found'
          ? `Aselo requires a field saved as “${fieldName}” in ${tab.title}.`
          : message,
        fieldName,
      ),
    ),
  );

  // Reporting config pointing at fields that no longer exist. Only Aselo staff can fix this,
  // so it doesn't block export - reviewers update the Insights mapping in the same PR.
  const oneToOne = files[ONE_TO_ONE_FILE] as OneToOneConfigSpec | undefined;
  (oneToOne?.contactForm?.[tab.layoutKey] ?? [])
    .filter((spec) => !names.includes(spec.name))
    .forEach((spec) =>
      issues.push({
        severity: 'warning',
        message: `Reporting still expects a field saved as “${spec.name}” in ${tab.title} (Insights column “${spec.insights[1]}”). Aselo staff will need to update the reporting setup.`,
        fieldName: spec.name,
      }),
    );

  // A problem found on several fields (e.g. a duplicate name) is only reported once
  return issues.filter(
    (issue, index) => issues.findIndex((other) => other.message === issue.message) === index,
  );
};

export const validateContactTab = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
  tab: ContactTab,
): ValidationIssue[] => {
  const draftForm = getForm(draftFiles, tab.filePath);
  if (!draftForm) return [];

  const draftIssues = checkForm(draftForm, tab, draftFiles);
  const originalForm = getForm(originalFiles, tab.filePath);
  const originalMessages = new Set(
    originalForm ? checkForm(originalForm, tab, originalFiles).map((issue) => issue.message) : [],
  );

  return draftIssues.map(
    (issue): ValidationIssue =>
      originalMessages.has(issue.message) && issue.severity === 'error'
        ? {
            ...issue,
            severity: 'warning',
            message: `${issue.message} (This was already the case before your changes.)`,
          }
        : issue,
  );
};
