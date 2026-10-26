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
 * Finds the other places in a helpline's definitions that refer to a contact form field by
 * name, so staff are warned before removing a field that reporting or automation relies on.
 */
import type { OneToManyConfigSpecs, OneToOneConfigSpec } from '@hrm-form-definitions/formDefinition/insightsConfig';
import type { DefinitionFileMap, FormTarget } from './definitions';
import { getForm, isContactTab } from './definitions';

const ONE_TO_ONE_FILE = 'insights/oneToOneConfigSpec.json';
const ONE_TO_MANY_FILE = 'insights/oneToManyConfigSpecs.json';
const PREPOPULATE_MAPPINGS_FILE = 'PrepopulateMappings.json';
const PREPOPULATE_KEYS_FILE = 'PrepopulateKeys.json';

const PREPOPULATE_SOURCE_NAMES: Record<string, string> = {
  survey: 'the pre-chat survey',
  preEngagement: 'the webchat pre-engagement form',
};

const flattenStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  return Array.isArray(value) ? value.flatMap(flattenStrings) : [];
};

export const findFieldReferences = (
  files: DefinitionFileMap,
  tab: FormTarget,
  fieldName: string,
): string[] => {
  const references: string[] = [];

  const oneToOne = files[ONE_TO_ONE_FILE] as OneToOneConfigSpec | undefined;
  ((oneToOne?.[tab.insights.group] as Record<string, { name: string; insights: string[] }[]> | undefined)?.[
    tab.insights.key
  ] ?? [])
    .filter((spec) => spec.name === fieldName)
    .forEach((spec) =>
      references.push(`Reporting: saved to the Insights column “${spec.insights[1]}”`),
    );

  const oneToMany = files[ONE_TO_MANY_FILE] as OneToManyConfigSpecs | undefined;
  (Array.isArray(oneToMany) ? oneToMany : [])
    .filter((spec) => spec.paths?.some((p) => p.endsWith(`${tab.insights.key}.${fieldName}`)))
    .forEach((spec) =>
      references.push(`Reporting: part of the Insights column “${spec.attributeName}”`),
    );

  // Only contact forms are filled in from surveys and the webchat
  const mappings = (isContactTab(tab) ? (files[PREPOPULATE_MAPPINGS_FILE] ?? {}) : {}) as Record<string, unknown>;
  const target = `${tab.key}.${fieldName}`;
  Object.entries(PREPOPULATE_SOURCE_NAMES).forEach(([sourceSet, sourceName]) => {
    const sourceFields = (mappings[sourceSet] ?? {}) as Record<string, unknown>;
    Object.entries(sourceFields)
      .filter(([, targets]) => flattenStrings(targets).includes(target))
      .forEach(([sourceField]) =>
        references.push(`Filled in automatically from “${sourceField}” in ${sourceName}`),
      );
  });

  // Legacy prepopulation config, still used by some helplines
  const legacyKeys = (files[PREPOPULATE_KEYS_FILE] ?? {}) as Record<
    string,
    Record<string, string[]>
  >;
  Object.entries(PREPOPULATE_SOURCE_NAMES).forEach(([sourceSet, sourceName]) => {
    if (isContactTab(tab) && legacyKeys[sourceSet]?.[tab.key]?.includes(fieldName)) {
      references.push(`Filled in automatically from ${sourceName}`);
    }
  });

  (getForm(files, tab.filePath) ?? [])
    .filter((item) => item.type === 'dependent-select' && item.dependsOn === fieldName)
    .forEach((item) =>
      references.push(`The “${item.label || item.name}” dropdown depends on this field`),
    );

  return references;
};
