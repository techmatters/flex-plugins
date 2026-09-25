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

import {
  DefinitionVersion,
  FormInputType,
  FormItemDefinition,
} from '@tech-matters/hrm-form-definitions';
import { HrmContact, FormValue } from '@tech-matters/hrm-types';
import { format, startOfDay } from 'date-fns';

const getInitialValue = (def: FormItemDefinition): FormValue => {
  switch (def.type) {
    case FormInputType.Input:
    case FormInputType.NumericInput:
    case FormInputType.Email:
    case FormInputType.Textarea:
    case FormInputType.FileUpload:
      return '';
    case FormInputType.DateInput: {
      if (def.initializeWithCurrent) {
        return format(startOfDay(new Date()), 'yyyy-MM-dd');
      }
      return '';
    }
    case FormInputType.TimeInput: {
      if (def.initializeWithCurrent) {
        return format(new Date(), 'HH:mm');
      }

      return '';
    }
    case FormInputType.RadioInput:
      return def.defaultOption?.value ?? '';
    case FormInputType.ListboxMultiselect:
      return [];
    case FormInputType.Select:
      if (def.defaultOption) return def.defaultOption.value;
      return def.options && def.options[0] ? def.options[0].value : null;
    case FormInputType.DependentSelect:
      return def.defaultOption?.value ?? '';
    case FormInputType.CopyTo:
    case FormInputType.Checkbox:
      return Boolean(def.initialChecked);
    case 'mixed-checkbox':
      return def.initialChecked === undefined ? 'mixed' : def.initialChecked;
    default:
      return null;
  }
};

export const populateInitialValues = async (
  contact: HrmContact,
  { tabbedForms, helplineInformation }: DefinitionVersion,
) => {
  const tabNamesAndRawJsonSections: [
    keyof DefinitionVersion['tabbedForms'],
    Record<string, FormValue>,
  ][] = [
    ['CaseInformationTab', contact.rawJson.caseInformation],
    ['ChildInformationTab', contact.rawJson.childInformation],
    ['CallerInformationTab', contact.rawJson.callerInformation],
  ];

  type DefinitionAndJson = [FormItemDefinition[], Record<string, FormValue>];
  const definitionsAndJsons: DefinitionAndJson[] = await Promise.all(
    tabNamesAndRawJsonSections.map(
      async ([tabbedFormsSection, rawJsonSection]): Promise<DefinitionAndJson> => [
        tabbedForms[tabbedFormsSection] as FormItemDefinition[],
        rawJsonSection,
      ],
    ),
  );
  for (const [tabFormDefinition, rawJson] of definitionsAndJsons) {
    for (const formItemDefinition of tabFormDefinition) {
      rawJson[formItemDefinition.name] = getInitialValue(formItemDefinition);
    }
  }

  const defaultHelplineOption = (
    helplineInformation.helplines.find((helpline: any) => helpline.default) ||
    helplineInformation.helplines[0]
  ).value;
  Object.assign(contact.rawJson.contactlessTask, {
    helpline: defaultHelplineOption,
  });
};
