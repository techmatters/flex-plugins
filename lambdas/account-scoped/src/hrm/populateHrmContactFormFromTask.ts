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
import { startOfDay, format } from 'date-fns';

type MapperFunction = (options: string[]) => (value: string) => string;

// When we move this into the flex repo we can depend on hrm-form-definitions for these types & enums
export enum FormInputType {
  Input = 'input',
  SearchInput = 'search-input',
  NumericInput = 'numeric-input',
  Email = 'email',
  RadioInput = 'radio-input',
  ListboxMultiselect = 'listbox-multiselect',
  Select = 'select',
  DependentSelect = 'dependent-select',
  Checkbox = 'checkbox',
  MixedCheckbox = 'mixed-checkbox',
  Textarea = 'textarea',
  DateInput = 'date-input',
  TimeInput = 'time-input',
  FileUpload = 'file-upload',
  Button = 'button',
  CopyTo = 'copy-to',
  CustomContactComponent = 'custom-contact-component',
}

export type FormItemDefinition = {
  name: string;
  unknownOption?: string;
  options?: { value: string }[];
  initialChecked?: boolean;
  initializeWithCurrent?: boolean;
} & (
  | {
      type: Exclude<FormInputType, FormInputType.DependentSelect>;
      defaultOption?: string;
    }
  | {
      type: FormInputType.DependentSelect;
      defaultOption: {
        value: string;
      };
    }
);

// Exported for testing purposes
export type PrepopulateKeys = {
  preEngagement: {
    ChildInformationTab: string[];
    CallerInformationTab: string[];
    CaseInformationTab: string[];
  };
  survey: { ChildInformationTab: string[]; CallerInformationTab: string[] };
};

type ChannelTypes =
  | 'voice'
  | 'sms'
  | 'facebook'
  | 'messenger'
  | 'whatsapp'
  | 'web'
  | 'telegram'
  | 'instagram'
  | 'line'
  | 'modica';

const callTypes = {
  child: 'Child calling about self',
  caller: 'Someone calling about a child',
};

type HrmContactRawJson = {
  definitionVersion?: string;
  callType: (typeof callTypes)[keyof typeof callTypes];
  childInformation: Record<string, FormValue>;
  callerInformation: Record<string, FormValue>;
  caseInformation: Record<string, FormValue>;
  categories: Record<string, string[]>;
  contactlessTask: {
    channel: ChannelTypes;
    date: string;
    time: string;
    createdOnBehalfOf: `WK${string}` | '';
    [key: string]: string | boolean;
  };
};

export type HrmContact = {
  id: string;
  accountSid?: `AC${string}`;
  twilioWorkerId?: `WK${string}`;
  number: string;
  conversationDuration: number;
  csamReports: unknown[];
  referrals?: unknown[];
  conversationMedia?: unknown[];
  createdAt: string;
  createdBy: string;
  helpline: string;
  taskId: `WT${string}` | null;
  profileId?: string;
  identifierId?: string;
  channel: ChannelTypes | 'default';
  updatedBy: string;
  updatedAt?: string;
  finalizedAt?: string;
  rawJson: HrmContactRawJson;
  timeOfContact: string;
  queueName: string;
  channelSid: string;
  serviceSid: string;
  caseId?: string;
};

type FormValue = string | string[] | boolean | null;

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
      return def.defaultOption ?? '';
    case FormInputType.ListboxMultiselect:
      return [];
    case FormInputType.Select:
      if (def.defaultOption) return def.defaultOption;
      return def.options && def.options[0] ? def.options[0].value : null;
    case FormInputType.DependentSelect:
      return def.defaultOption?.value;
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
  tabFormDefinition.forEach((field: FormItemDefinition) => {
    if (prepopulateKeys.indexOf(field.name) > -1) {
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
    }
  });
  return values;
};

const loadedConfigJsons: Record<string, any> = {};

const loadConfigJson = async (
  formDefinitionRootUrl: URL,
  section: string,
): Promise<any> => {
  if (!loadedConfigJsons[section]) {
    const url = `${formDefinitionRootUrl}/${section}.json`;
    const response = await fetch(url);
    loadedConfigJsons[section] = response.json();
  }
  return loadedConfigJsons[section];
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
    date: getInitialValue({
      type: FormInputType.DateInput,
      initializeWithCurrent: true,
      name: 'date',
    }),
    time: getInitialValue({
      type: FormInputType.TimeInput,
      initializeWithCurrent: true,
      name: 'time',
    }),
    helpline: defaultHelplineOption,
  });
};

const populateContactSection = async (
  target: Record<string, FormValue>,
  valuesToPopulate: Record<string, string>,
  keys: Set<string>,
  formDefinitionRootUrl: URL,
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
    const childInformationTabDefinition = await loadConfigJson(
      formDefinitionRootUrl,
      `tabbedForms/${tabbedFormsSection}`,
    );
    Object.assign(
      target,
      converter(keys, childInformationTabDefinition, valuesToPopulate),
    );
  }
};

export const populateHrmContactFormFromTask = async (
  taskAttributes: Record<string, any>,
  contact: HrmContact,
  formDefinitionRootUrl: URL,
): Promise<HrmContact> => {
  const { memory, preEngagementData, firstName, language } = taskAttributes;
  const answers = { ...memory, firstName, language };
  await populateInitialValues(contact, formDefinitionRootUrl);
  if (!answers && !preEngagementData) return contact;
  const { preEngagement: preEngagementKeys, survey: surveyKeys }: PrepopulateKeys =
    await loadConfigJson(formDefinitionRootUrl, 'PrepopulateKeys');

  const isValidSurvey = Boolean(answers?.aboutSelf); // determines if the memory has valid values or if it was aborted
  const isAboutSelf = answers.aboutSelf === 'Yes';
  if (isValidSurvey) {
    // eslint-disable-next-line no-param-reassign
    contact.rawJson.callType = isAboutSelf ? callTypes.child : callTypes.caller;
  }
  if (preEngagementData) {
    await populateContactSection(
      contact.rawJson.caseInformation,
      preEngagementData,
      new Set<string>(preEngagementKeys.CaseInformationTab),
      formDefinitionRootUrl,
      'CaseInformationTab',
      getValuesFromPreEngagementData,
    );

    if (!isValidSurvey || isAboutSelf) {
      await populateContactSection(
        contact.rawJson.childInformation,
        preEngagementData,
        new Set<string>(preEngagementKeys.ChildInformationTab),
        formDefinitionRootUrl,
        'ChildInformationTab',
        getValuesFromPreEngagementData,
      );
    } else {
      await populateContactSection(
        contact.rawJson.callerInformation,
        preEngagementData,
        new Set<string>(preEngagementKeys.CallerInformationTab),
        formDefinitionRootUrl,
        'CallerInformationTab',
        getValuesFromPreEngagementData,
      );
    }
  }

  if (isValidSurvey) {
    if (isAboutSelf) {
      await populateContactSection(
        contact.rawJson.childInformation,
        answers,
        new Set<string>([...MANDATORY_CHATBOT_FIELDS, ...surveyKeys.ChildInformationTab]),
        formDefinitionRootUrl,
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
        formDefinitionRootUrl,
        'CallerInformationTab',
        getValuesFromAnswers,
      );
    }
  }
  return contact;
};

export type PrepopulateForm = {
  populateHrmContactFormFromTask: typeof populateHrmContactFormFromTask;
};
