/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { DefinitionVersion, FormDefinition, FormItemDefinition } from '@tech-matters/hrm-form-definitions';

import { CaseSectionTypeSpecificData } from '../../../services/caseSectionService';

type FormValue = string | boolean | number | string[];

/**
 * This will filter out invalid selections from form items that involve selecting from a predefined list
 * This is specifically to cater for the case where both of the form items are of the same type but have different sets of options defined
 * Scenarios where form items have the same name but different types (so free text tries to be set for a checkbox field, for example) should not occur
 * This is because items with matched names but mismatched types are not considered valid for copying in the first place.
 * @param item
 * @param value
 * @param form - the entire set of form values - dependent selects need this context
 */
const removeInvalidFormSelections = (
  item: FormItemDefinition,
  value: FormValue,
  form: Record<string, FormValue>,
): FormValue | undefined => {
  switch (item.type) {
    case 'select':
      return item.options.find(opt => opt.value === value) ? value : undefined;
    case 'listbox-multiselect': {
      const validValues = item.options.map(opt => opt.value);
      return Array.isArray(value) ? value.filter(selectedOption => validValues.includes(selectedOption)) : [];
    }
    case 'dependent-select': {
      const dependentValue = form[item.dependsOn];
      if (typeof dependentValue !== 'string') return undefined;
      const valueSet = item.options[dependentValue];
      if (!Array.isArray(valueSet)) return undefined;
      return valueSet.find(opt => opt.value === value) ? value : undefined;
    }
    default:
      return value;
  }
};

const createCopyForDifferentSection = (
  sourceItem: CaseSectionTypeSpecificData,
  sourceDefinition: FormDefinition,
  targetDefinition: FormDefinition,
): CaseSectionTypeSpecificData => {
  const validTargetFormElements: FormDefinition = targetDefinition.filter(sfi =>
    sourceDefinition.find(tfi => sfi.name === tfi.name && sfi.type === tfi.type),
  );
  const validTargetFormElementMap = Object.fromEntries(validTargetFormElements.map(fe => [fe.name, fe]));
  const targetFormEntries = Object.entries(sourceItem).filter(([k]) => validTargetFormElementMap[k]);
  const targetForm = Object.fromEntries(targetFormEntries);
  // Have to do this ugly second pass because dependent selects need the value of the item depended to have been written prior to validating it's own value
  const sanitisedTargetFormEntries = targetFormEntries
    .map(([name, value]) => [name, removeInvalidFormSelections(validTargetFormElementMap[name], value, targetForm)])
    .filter(([, val]) => val !== undefined);
  return Object.fromEntries(sanitisedTargetFormEntries);
};

export const copyCaseSectionItem = ({
  definition,
  fromSection,
  fromSectionType,
  toSectionType,
}: {
  definition: DefinitionVersion;
  fromSection: CaseSectionTypeSpecificData;
  fromSectionType: string;
  toSectionType: string;
}) =>
  createCopyForDifferentSection(
    fromSection,
    definition.caseSectionTypes[fromSectionType].form,
    definition.caseSectionTypes[toSectionType].form,
  );
