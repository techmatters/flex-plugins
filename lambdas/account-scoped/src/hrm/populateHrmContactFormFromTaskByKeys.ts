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
} from '@tech-matters/hrm-form-definitions';
import { FormValue, HrmContact, callTypes } from '@tech-matters/hrm-types';
import { newErr, newOk, Result } from '../Result';
import { getDefinitionVersion } from './formDefinitionsCache';

type MapperFunction = (options: string[]) => (value: string) => string;

// Exported for testing purposes
type PrepopulateKeys = DefinitionVersion['prepopulateKeys'];

// This hardcoded logic should be moved into the form definition JSON or some other configuration
const MANDATORY_CHATBOT_FIELDS = ['age', 'gender', 'ethnicity'];

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

const populateInitialValues = async (
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

  const definitionsAndJsons: [FormItemDefinition[], Record<string, FormValue>][] =
    await Promise.all(
      tabNamesAndRawJsonSections.map(async ([tabbedFormsSection, rawJsonSection]) => [
        tabbedForms[tabbedFormsSection] as FormItemDefinition[],
        rawJsonSection,
      ]),
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

const populateContactSection = async (
  target: Record<string, FormValue>,
  valuesToPopulate: Record<string, string>,
  keys: Set<string>,
  definitionVersion: DefinitionVersion,
  tabbedFormsSection:
    | 'CaseInformationTab'
    | 'ChildInformationTab'
    | 'CallerInformationTab',
  converter: (
    keys: Set<string>,
    formTabDefinition: FormItemDefinition[],
    values: Record<string, string>,
  ) => Record<string, string | boolean>,
) => {
  console.debug('Populating', tabbedFormsSection);
  console.debug('Keys', Array.from(keys));
  console.debug('Using Values', valuesToPopulate);

  if (keys.size > 0) {
    const childInformationTabDefinition =
      definitionVersion.tabbedForms[tabbedFormsSection];
    Object.assign(
      target,
      converter(keys, childInformationTabDefinition, valuesToPopulate),
    );
  }
};

export const populateHrmContactFormFromTaskByKeys = async (
  taskAttributes: Record<string, any>,
  contact: HrmContact,
  formDefinitionRootUrl: URL,
): Promise<Result<Error, HrmContact>> => {
  try {
    const { memory, preEngagementData, firstName, language } = taskAttributes;
    const answers = { ...memory, firstName, language };
    const definitionVersion = await getDefinitionVersion(formDefinitionRootUrl);
    console.debug(definitionVersion.tabbedForms);
    await populateInitialValues(contact, definitionVersion);
    if (!memory && !firstName && !preEngagementData) return newOk(contact);
    const { preEngagement: preEngagementKeys, survey: surveyKeys }: PrepopulateKeys =
      definitionVersion.prepopulateKeys;

    const isValidSurvey = Boolean(answers?.aboutSelf); // determines if the memory has valid values or if it was aborted
    const isAboutSelf = answers.aboutSelf === 'Yes';
    if (isValidSurvey) {
      // eslint-disable-next-line no-param-reassign
      contact.rawJson.callType = isAboutSelf ? callTypes.child : callTypes.caller;
    } else {
      // eslint-disable-next-line no-param-reassign
      contact.rawJson.callType = callTypes.child;
    }

    if (isValidSurvey) {
      if (isAboutSelf) {
        await populateContactSection(
          contact.rawJson.childInformation,
          answers,
          new Set<string>([
            ...MANDATORY_CHATBOT_FIELDS,
            ...surveyKeys.ChildInformationTab,
          ]),
          definitionVersion,
          'ChildInformationTab',
          getValuesFromAnswers,
        );
      } else {
        await populateContactSection(
          contact.rawJson.callerInformation,
          answers,
          new Set<string>([
            ...MANDATORY_CHATBOT_FIELDS,
            ...surveyKeys.CallerInformationTab,
          ]),
          definitionVersion,
          'CallerInformationTab',
          getValuesFromAnswers,
        );
      }
    }

    if (preEngagementData) {
      await populateContactSection(
        contact.rawJson.caseInformation,
        preEngagementData,
        new Set<string>(preEngagementKeys.CaseInformationTab),
        definitionVersion,
        'CaseInformationTab',
        getValuesFromPreEngagementData,
      );

      if (!isValidSurvey || isAboutSelf) {
        await populateContactSection(
          contact.rawJson.childInformation,
          preEngagementData,
          new Set<string>(preEngagementKeys.ChildInformationTab),
          definitionVersion,
          'ChildInformationTab',
          getValuesFromPreEngagementData,
        );
      } else {
        await populateContactSection(
          contact.rawJson.callerInformation,
          preEngagementData,
          new Set<string>(preEngagementKeys.CallerInformationTab),
          definitionVersion,
          'CallerInformationTab',
          getValuesFromPreEngagementData,
        );
      }
    }

    return newOk(contact);
  } catch (err) {
    const error = err as Error;
    console.error(
      `Error prepopulating contact ${contact.id}`,
      error,
      'task attributes:',
      taskAttributes,
    );
    return newErr({ error, message: error.message });
  }
};
