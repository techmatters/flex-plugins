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
 * Issue categories (tabbedForms/IssueCategorizationTab.json), keyed by the helpline's display
 * name (e.g. "Kids Help Phone"), each with { categories: { <name>: { color, subcategories } },
 * maxSelections? }.
 *
 * Contacts save the category and subcategory names they were given ({ <category>:
 * [<subcategory>, ...] }), and reports group by them, so an existing name is only renamed by
 * Aselo staff. Order, colours, help links and the selection limit are free to change.
 */
import type { CategoriesDefinition, CategoryEntry } from '@hrm-form-definitions/formDefinition/types';
import { CATEGORIES_FILE, DefinitionFileMap, getCategoriesByHelpline } from './definitions';
import { isSameJson } from './changes';
import type { ValidationIssue } from './validation';

// plugin-hrm-form/src/components/contact/IssueCategorizationSectionForm.tsx
export const DEFAULT_MAX_SELECTIONS = 3;

export type Subcategory = CategoryEntry['subcategories'][number];

// Colours offered for new categories (the ones helplines use most)
export const CATEGORY_COLORS = ['#085f63', '#BBE3FF', '#F5A623', '#ffbbbb', '#0095C8', '#355c7d', '#f79d8f', '#8b5fbf'];

export const getHelplineCategories = (files: DefinitionFileMap, helpline: string) =>
  getCategoriesByHelpline(files)[helpline] as CategoriesDefinition | undefined;

export const setHelplineCategories = (
  files: DefinitionFileMap,
  helpline: string,
  definition: CategoriesDefinition,
): DefinitionFileMap => ({
  ...files,
  [CATEGORIES_FILE]: { ...getCategoriesByHelpline(files), [helpline]: definition },
});

/**
 * Checks, for the workspace and review
 */
const checkCategories = (files: DefinitionFileMap): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const byHelpline = getCategoriesByHelpline(files);
  const several = Object.keys(byHelpline).length > 1;
  Object.entries(byHelpline).forEach(([helpline, definition]) => {
    const where = several ? ` (${helpline})` : '';
    const add = (message: string) =>
      issues.push({ severity: 'error', message: `Issue categories${where}: ${message}` });
    const categories = Object.entries(definition?.categories ?? {});
    if (categories.length === 0) add('there are no categories.');
    if (definition?.maxSelections !== undefined && !(definition.maxSelections >= 1)) {
      add('counselors must be able to choose at least one.');
    }
    categories.forEach(([name, entry]) => {
      if (!name.trim()) add('a category has no name.');
      const labels = (entry.subcategories ?? []).map((sub) => String(sub.label ?? '').trim());
      if (labels.length === 0) add(`“${name}” has no subcategories.`);
      if (labels.some((label) => !label)) add(`a subcategory of “${name}” has no name.`);
      const repeated = labels.filter((label, index) => label && labels.indexOf(label) !== index);
      if (repeated.length > 0) add(`“${name}” has “${repeated[0]}” more than once.`);
    });
  });
  return issues;
};

// Problems that were already there before the user's changes are only warnings
export const validateCategories = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const before = new Set(checkCategories(originalFiles).map((found) => found.message));
  return checkCategories(draftFiles).map((found) =>
    before.has(found.message)
      ? {
          ...found,
          severity: 'warning' as const,
          message: `${found.message} (This was already the case before your changes.)`,
        }
      : found,
  );
};

/**
 * Plain-language description of the changes, for the review dialog and CHANGES.md
 */
export const summarizeCategoryChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const before = getCategoriesByHelpline(originalFiles);
  const after = getCategoriesByHelpline(draftFiles);
  if (isSameJson(before, after)) return [];
  const helplines = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  const several = helplines.length > 1;
  const lines = helplines.flatMap((helpline) => {
    const prefix = several ? `${helpline}: ` : '';
    const was = before[helpline];
    const now = after[helpline];
    const result: string[] = [];
    if ((was?.maxSelections ?? DEFAULT_MAX_SELECTIONS) !== (now?.maxSelections ?? DEFAULT_MAX_SELECTIONS)) {
      result.push(`${prefix}Counselors can choose up to ${now?.maxSelections ?? DEFAULT_MAX_SELECTIONS}`);
    }
    const wasCategories = was?.categories ?? {};
    const nowCategories = now?.categories ?? {};
    Object.entries(nowCategories).forEach(([name, entry]) => {
      const previous = wasCategories[name];
      if (!previous) {
        result.push(`${prefix}Added category “${name}” (${entry.subcategories.map((sub) => sub.label).join(', ')})`);
        return;
      }
      const wasLabels = previous.subcategories.map((sub) => sub.label);
      const nowLabels = entry.subcategories.map((sub) => sub.label);
      nowLabels
        .filter((label) => !wasLabels.includes(label))
        .forEach((label) => result.push(`${prefix}Added “${label}” to “${name}”`));
      wasLabels
        .filter((label) => !nowLabels.includes(label))
        .forEach((label) => result.push(`${prefix}Removed “${label}” from “${name}”`));
      if (previous.color !== entry.color) result.push(`${prefix}New colour for “${name}”`);
      const linksChanged = entry.subcategories.some(
        (sub) => previous.subcategories.find((old) => old.label === sub.label)?.toolkitUrl !== sub.toolkitUrl &&
          wasLabels.includes(sub.label),
      );
      if (linksChanged) result.push(`${prefix}Help links changed in “${name}”`);
      const kept = (labels: string[], others: string[]) => labels.filter((label) => others.includes(label));
      if (!isSameJson(kept(wasLabels, nowLabels), kept(nowLabels, wasLabels))) {
        result.push(`${prefix}Reordered the subcategories of “${name}”`);
      }
    });
    Object.keys(wasCategories)
      .filter((name) => !(name in nowCategories))
      .forEach((name) => result.push(`${prefix}Removed category “${name}”`));
    const keptNames = (names: string[], others: object) => names.filter((name) => name in others);
    if (!isSameJson(keptNames(Object.keys(wasCategories), nowCategories), keptNames(Object.keys(nowCategories), wasCategories))) {
      result.push(`${prefix}Reordered the categories`);
    }
    return result;
  });
  return [{ title: 'Issue categories', lines }];
};
