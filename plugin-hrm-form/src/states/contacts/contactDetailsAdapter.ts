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

import { DefinitionVersion, FormDefinition, FormItemDefinition, isNonSaveable } from '@tech-matters/hrm-form-definitions';

import { ContactRawJson } from '../../types/types';

const transformValue = (e: FormItemDefinition) => (value: string | boolean | null) => {
  if (e.type === 'mixed-checkbox' && value === 'mixed') return null;

  return value;
};

export const transformValues = (def: FormDefinition) => (values: { [key: string]: string | boolean }) =>
  def.reduce((acc, e) => (isNonSaveable(e) ? acc : { ...acc, [e.name]: transformValue(e)(values[e.name]) }), {});

export const transformValuesForContactForm = (definition: DefinitionVersion) => (
  form: Partial<ContactRawJson>,
): Partial<ContactRawJson> => {
  // Transform from RHF friendly values to the state we want in redux
  if (!form) return form;
  const transformed = {
    ...form,
  };
  [
    { property: 'callerInformation', formDefinition: definition.tabbedForms.CallerInformationTab },
    { property: 'childInformation', formDefinition: definition.tabbedForms.ChildInformationTab },
    { property: 'caseInformation', formDefinition: definition.tabbedForms.CaseInformationTab },
  ].forEach(({ property, formDefinition }) => {
    if (form[property]) {
      transformed[property] = transformValues(formDefinition)(form[property]);
    }
  });
  return transformed;
};
