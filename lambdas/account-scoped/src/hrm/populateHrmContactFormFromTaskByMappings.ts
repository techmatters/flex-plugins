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

import { capitalize } from 'lodash';
import { format, startOfDay } from 'date-fns';
import {
  DefinitionVersion,
  FormInputType,
  FormItemDefinition,
  FORM_DEFINITION_MAP,
  lookupFormSelector,
  ContactFormDefinitionName,
  ContactFormName,
} from '@tech-matters/hrm-form-definitions';
import { FormValue, HrmContact, HrmContactRawJson } from '@tech-matters/hrm-types';
import { newErr, newOk, Result } from '../Result';
import { loadConfigJson } from './formDefinitionsCache';

type MapperFunction = (options: string[]) => (value: string) => string;

// Exported for testing purposes
type PrepopulateMappings = DefinitionVersion['prepopulateMappings'];

const CUSTOM_MAPPERS: Record<string, MapperFunction> = {
  age:
    (ageOptions: string[]) =>
    (age: string): string => {
      const ageInt = parseInt(age, 10);

      const maxAge = ageOptions.find(e => e.includes('>'));

      if (maxAge) {
        const maxAgeInt = parseInt(maxAge.replace('>', ''), 10);

        if (ageInt >= 0 && ageInt <= maxAgeInt) {
          return ageOptions.find(o => parseInt(o, 10) === ageInt) || 'Unknown';
        }

        if (ageInt > maxAgeInt) return maxAge;
      } else {
        console.error('Pre populate form error: no maxAge option provided.');
      }

      return 'Unknown';
    },
};

/**
 * Utility functions to create initial state from definition
 * @param {FormItemDefinition} def Definition for a single input of a Form
 */
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

const mapGenericOption = (options: string[]) => (value: string) => {
  const validOption = options.find(e => e.toLowerCase() === value.toLowerCase());

  if (!validOption) {
    return 'Unknown';
  }

  return validOption;
};

const getUnknownOption = (key: string, definition: FormItemDefinition[]) => {
  const inputDef = definition.find(e => e.name === key);

  // inputDef.options check needed whilst we use an el cheapo copy of the type, once we share the flex type it won't be needed
  if (inputDef?.type === 'select' && inputDef.options) {
    const unknownOption = inputDef.unknownOption
      ? inputDef.options.find(e => e.value === inputDef.unknownOption)
      : inputDef.options.find(e => e.value === 'Unknown');
    if (unknownOption && unknownOption.value) return unknownOption.value;

    console.error(
      `getUnknownOption couldn't determine a valid unknown option for key ${key}.`,
    );
  }

  return 'Unknown';
};

/**
 * Given a key and a form definition, grabs the input with name that equals the key and return the options values, or empty array.
 */
const getSelectOptions = (key: string) => (definition: FormItemDefinition[]) => {
  const inputDef = definition.find(e => e.name === key);
  // inputDef.options check needed whilst we use an el cheapo copy of the type, once we share the flex type it won't be needed
  if (inputDef?.type === 'select' && inputDef.options) {
    return inputDef.options.map(e => e.value) || [];
  }

  console.error(
    `getSelectOptions called with key ${key} but is a non-select input type.`,
  );
  return [];
};

const getAnswerOrUnknown = (
  answers: any,
  key: string,
  definition: FormItemDefinition[],
  mapperFunction: MapperFunction = mapGenericOption,
) => {
  // This keys must be set with 'Unknown' value even if there's no answer
  const isRequiredKey = key === 'age' || key === 'gender';

  // This prevents setting redux state with the 'Unknown' value for a property that is not asked by the pre-survey
  if (!isRequiredKey && !answers[key]) return null;

  const itemDefinition = definition.find(e => e.name === key);

  // This prevents setting redux state with the 'Unknown' value for a property that is not present on the definition
  if (!itemDefinition) {
    console.error(`${key} does not exist in the current definition`);
    return null;
  }

  if (itemDefinition.type === 'select') {
    const unknown = getUnknownOption(key, definition);
    const isUnknownAnswer = !answers[key] || answers[key] === unknown;

    if (isUnknownAnswer) return unknown;

    const options = getSelectOptions(key)(definition);
    const result = mapperFunction(options)(answers[key]);

    return result === 'Unknown' ? unknown : result;
  }

  return answers[key];
};

const getValuesFromAnswers = (
  prepopulateKeys: Set<string>,
  tabFormDefinition: FormItemDefinition[],
  answers: any,
): Record<string, string> => {
  // Get values from task attributes
  const { firstName, language } = answers;

  // Get the customizable values from the bot's memory if there's any value (defined in PrepopulateKeys.json)
  const customizableValues = Array.from(prepopulateKeys).reduce((accum, key) => {
    const value = getAnswerOrUnknown(
      answers,
      key,
      tabFormDefinition,
      CUSTOM_MAPPERS[key] || mapGenericOption,
    );
    return value ? { ...accum, [key]: value } : accum;
  }, {});

  return {
    ...(firstName && { firstName }),
    ...(language && { language: capitalize(language) }),
    ...customizableValues,
  };
};

const getValuesFromPreEngagementData = (
  prepopulateKeySet: Set<string>,
  tabFormDefinition: FormItemDefinition[],
  preEngagementData: Record<string, string>,
) => {
  // Get values from task attributes
  const values: Record<string, string | boolean> = {};
  const prepopulateKeys = Array.from(prepopulateKeySet);
  const specifiedKeys = Object.keys(preEngagementData);
  tabFormDefinition
    .filter(
      (field: FormItemDefinition) =>
        prepopulateKeys.includes(field.name) && specifiedKeys.includes(field.name),
    )
    .forEach((field: FormItemDefinition) => {
      if (['mixed-checkbox', 'checkbox'].includes(field.type)) {
        const fieldValue = preEngagementData[field.name]?.toLowerCase();
        if (fieldValue === 'yes') {
          values[field.name] = true;
        } else if (fieldValue === 'no' || field.type === 'checkbox') {
          values[field.name] = false;
        }
        return;
      }
      values[field.name] = preEngagementData[field.name] || '';
    });
  return values;
};

const populateInitialValues = async (contact: HrmContact, formDefinitionRootUrl: URL) => {
  const tabNamesAndRawJsonSections: [string, Record<string, FormValue>][] = [
    ['CaseInformationTab', contact.rawJson.caseInformation],
    ['ChildInformationTab', contact.rawJson.childInformation],
    ['CallerInformationTab', contact.rawJson.callerInformation],
  ];

  const defintionsAndJsons: [FormItemDefinition[], Record<string, FormValue>][] =
    await Promise.all(
      tabNamesAndRawJsonSections.map(async ([tabbedFormsSection, rawJsonSection]) => [
        await loadConfigJson(formDefinitionRootUrl, `tabbedForms/${tabbedFormsSection}`),
        rawJsonSection,
      ]),
    );
  for (const [tabFormDefinition, rawJson] of defintionsAndJsons) {
    for (const formItemDefinition of tabFormDefinition) {
      rawJson[formItemDefinition.name] = getInitialValue(formItemDefinition);
    }
  }
  const helplineInformation = await loadConfigJson(
    formDefinitionRootUrl,
    'HelplineInformation',
  );
  const defaultHelplineOption = (
    helplineInformation.helplines.find((helpline: any) => helpline.default) ||
    helplineInformation.helplines[0]
  ).value;
  Object.assign(contact.rawJson.contactlessTask, {
    helpline: defaultHelplineOption,
  });
};

const populateContactSection = async (
  contact: HrmContact,
  targetFormDefinitionName: ContactFormDefinitionName,
  availableFormDefinitions: ContactFormDefinitionName[],
  valuesToPopulate: Record<string, string>,
  mappings: DefinitionVersion['prepopulateMappings'][keyof Omit<
    DefinitionVersion['prepopulateMappings'],
    'formSelector'
  >],
  formDefinitionRootUrl: URL,
  converter: (
    keys: Set<string>,
    formTabDefinition: FormItemDefinition[],
    values: Record<string, string>,
  ) => Record<string, string | boolean>,
) => {
  const targetFormName: ContactFormName = FORM_DEFINITION_MAP[targetFormDefinitionName];
  console.debug('Populating', targetFormName);
  console.debug('Mappings', mappings);
  console.debug('Using Values', valuesToPopulate);
  const target: HrmContactRawJson[ContactFormName] = contact.rawJson[targetFormName];
  const formMappings: Record<string, string[]> = {};
  // Convert mapping specification to a simple sourceKey -> formField of mappings that are valid for this form
  Object.entries(mappings).forEach(([key, mapping]) =>
    mapping.forEach(mappingItem => {
      for (const mappingChoice of mappingItem) {
        const [formDefinitionName, field] = mappingChoice.split('.');
        if (formDefinitionName === targetFormDefinitionName) {
          formMappings[key] = formMappings[key] ?? [];
          formMappings[key].push(field);
        }
        if (availableFormDefinitions.includes(formDefinitionName as any)) {
          return;
        }
      }
      return;
    }),
  );

  // Now if there are any valid mappings in the config, map the values in the source data to the target fields
  if (Object.keys(formMappings).length > 0) {
    const contactFormDefinition = await loadConfigJson(
      formDefinitionRootUrl,
      `tabbedForms/${targetFormDefinitionName}`,
    );
    const converted = converter(
      new Set(Object.keys(formMappings)),
      contactFormDefinition,
      valuesToPopulate,
    );
    const mapped: Record<string, string | boolean> = {};

    for (const [sourceField, formFields] of Object.entries(formMappings)) {
      for (const formField of formFields) {
        mapped[formField] = converted[sourceField];
      }
    }
    Object.assign(target, mapped);
  }
};

export const populateHrmContactFormFromTaskByMappings = async (
  taskAttributes: Record<string, any>,
  contact: HrmContact,
  formDefinitionRootUrl: URL,
): Promise<Result<Error, HrmContact>> => {
  try {
    const { memory, preEngagementData, firstName, language } = taskAttributes;
    const answers = { ...memory, firstName, language };
    await populateInitialValues(contact, formDefinitionRootUrl);
    if (!memory && !firstName && !preEngagementData) return newOk(contact);
    const prepopulateMappings: PrepopulateMappings = await loadConfigJson(
      formDefinitionRootUrl,
      'PrepopulateMappings',
    );
    const { selectCallType, selectForms } = lookupFormSelector(prepopulateMappings);
    contact.rawJson.callType = selectCallType(preEngagementData, answers);

    const availableFormsForSurveyPrepopulation = selectForms(
      'survey',
      preEngagementData,
      answers,
    );
    if (availableFormsForSurveyPrepopulation.length > 0) {
      for (const form of availableFormsForSurveyPrepopulation) {
        await populateContactSection(
          contact,
          form,
          availableFormsForSurveyPrepopulation,
          answers,
          prepopulateMappings.survey,
          formDefinitionRootUrl,
          getValuesFromAnswers,
        );
      }
    }

    const availableFormsForPreEngagementPrepopulation = selectForms(
      'preEngagement',
      preEngagementData,
      answers,
    );
    if (preEngagementData && availableFormsForPreEngagementPrepopulation.length > 0) {
      for (const form of availableFormsForPreEngagementPrepopulation) {
        await populateContactSection(
          contact,
          form,
          availableFormsForPreEngagementPrepopulation,
          preEngagementData,
          prepopulateMappings.preEngagement,
          formDefinitionRootUrl,
          getValuesFromPreEngagementData,
        );
      }
    }

    return newOk(contact);
  } catch (err) {
    const error = err as Error;
    console.error(
      `Error prepopulating contact ${contact.id} using mappings`,
      error,
      'task attributes:',
      taskAttributes,
    );
    return newErr({ error, message: error.message });
  }
};
