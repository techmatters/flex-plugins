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
 * Works out what changed between the files as loaded and the user's draft, in terms a
 * reviewer can read ("added field X") as well as the list of files to export.
 */
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import type { ContactTab, DefinitionFileMap } from './definitions';
import { CONTACT_TABS, getForm } from './definitions';

export type FormChangeSummary = {
  tab: ContactTab;
  added: string[];
  removed: string[];
  edited: string[];
  reordered: boolean;
};

const fieldLabel = (item: FormItemJsonDefinition) =>
  item.label ? `${item.label} (${item.name})` : item.name;

export const isSameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export const getChangedFilePaths = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): string[] =>
  Object.keys(draftFiles)
    .filter((filePath) => !isSameJson(originalFiles[filePath], draftFiles[filePath]))
    .sort();

export const summarizeFormChanges = (
  tab: ContactTab,
  originalForm: FormItemJsonDefinition[],
  draftForm: FormItemJsonDefinition[],
): FormChangeSummary => {
  const originalByName = new Map(originalForm.map((item) => [item.name, item]));
  const draftNames = new Set(draftForm.map((item) => item.name));

  const added = draftForm.filter((item) => !originalByName.has(item.name)).map(fieldLabel);
  const removed = originalForm.filter((item) => !draftNames.has(item.name)).map(fieldLabel);
  const edited = draftForm
    .filter((item) => {
      const original = originalByName.get(item.name);
      return original && !isSameJson(original, item);
    })
    .map(fieldLabel);

  // Compare the order of fields that exist in both versions
  const keptOriginalOrder = originalForm.map((item) => item.name).filter((n) => draftNames.has(n));
  const keptDraftOrder = draftForm.map((item) => item.name).filter((n) => originalByName.has(n));
  const reordered = !isSameJson(keptOriginalOrder, keptDraftOrder);

  return { tab, added, removed, edited, reordered };
};

export const summarizeContactFormChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): FormChangeSummary[] =>
  CONTACT_TABS.flatMap((tab) => {
    const originalForm = getForm(originalFiles, tab.filePath) ?? [];
    const draftForm = getForm(draftFiles, tab.filePath) ?? [];
    if (isSameJson(originalForm, draftForm)) return [];
    return [summarizeFormChanges(tab, originalForm, draftForm)];
  });
