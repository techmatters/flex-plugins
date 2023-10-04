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

import { ITask, Manager } from '@twilio/flex-ui';
import { capitalize } from 'lodash';
import { callTypes, FormDefinition, FormItemDefinition } from 'hrm-form-definitions';

import { LexMemory, AutopilotMemory } from '../types/types';
import { mapAge, mapGenericOption } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateForm as prepopulateFormAction } from '../states/contacts/actions';
import { getDefinitionVersions } from '../hrmConfig';
import { RootState } from '../states';
import findContactByTaskSid from '../states/contacts/findContactByTaskSid';

const getUnknownOption = (key: string, definition: FormDefinition) => {
  const inputDef = definition.find(e => e.name === key);

  if (inputDef && inputDef.type === 'select') {
    const unknownOption = inputDef.unknownOption
      ? inputDef.options.find(e => e.value === inputDef.unknownOption)
      : inputDef.options.find(e => e.value === 'Unknown');
    if (unknownOption && unknownOption.value) return unknownOption.value;

    console.error(`getUnknownOption couldn't determine a valid unknown option for key ${key}.`);
  }

  return 'Unknown';
};

/**
 * Given a key and a form definition, grabs the input with name that equals the key and return the options values, or empty array.
 */
const getSelectOptions = (key: string) => (definition: FormDefinition) => {
  const inputDef = definition.find(e => e.name === key);

  if (inputDef.type === 'select') return inputDef.options.map(e => e.value) || [];

  console.error(`getSelectOptions called with key ${key} but is a non-select input type.`);
  return [];
};

type MapperFunction = (options: string[]) => (value: string) => string;

const getAnswerOrUnknown = (
  answers: any,
  key: string,
  definition: FormDefinition,
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
  task: ITask,
  answers: any,
  tabFormDefinition: FormDefinition,
  prepopulateKeys: string[],
) => {
  // Get values from task attributes
  const { firstName, language } = task.attributes;

  // Get required values from bot's memory
  const age = getAnswerOrUnknown(answers, 'age', tabFormDefinition, mapAge);
  const gender = getAnswerOrUnknown(answers, 'gender', tabFormDefinition);

  // This field is not required yet it's bundled here as if it were. Leaving it from now but should we move it to prepopulateKeys where it's used?
  const ethnicity = getAnswerOrUnknown(answers, 'ethnicity', tabFormDefinition);

  // Get the customizable values from the bot's memory if there's any value (defined in PrepopulateKeys.json)
  const customizableValues = prepopulateKeys.reduce((accum, key) => {
    const value = getAnswerOrUnknown(answers, key, tabFormDefinition);
    return value ? { ...accum, [key]: value } : accum;
  }, {});

  return {
    ...(firstName && { firstName }),
    ...(gender && { gender }),
    ...(age && { age }),
    ...(ethnicity && { ethnicity }),
    ...(language && { language: capitalize(language) }),
    ...customizableValues,
  };
};

export const getValuesFromPreEngagementData = (
  preEngagementData: Record<string, string>,
  tabFormDefinition: FormDefinition,
  prepopulateKeys: string[],
) => {
  // Get values from task attributes
  const values = {};
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

type PreSurveyAnswers = LexMemory;
type AutopilotAnswers = AutopilotMemory['twilio']['collected_data']['collect_survey']['answers'];

const transformAnswers = (answers: AutopilotAnswers): PreSurveyAnswers => {
  /**
   * Map naming mismatches between autopilot and lex
   * TODO: rename Lex 'slots' so we don't need to use this map
   */
  const keyRenames = {
    // eslint-disable-next-line camelcase
    about_self: 'aboutSelf',
  };

  const renameKey = key => (Object.keys(keyRenames).includes(key) ? keyRenames[key] : key);
  return Object.keys(answers).reduce(
    (acc, currentKey) => ({ ...acc, [renameKey(currentKey)]: answers[currentKey].answer }),
    {},
  );
};

const getAnswers = (memory: LexMemory | AutopilotMemory): PreSurveyAnswers => {
  // This can be removed after every helpline is using Lex
  if (typeof memory.twilio === 'object') {
    const autopilotAnswers = (memory as AutopilotMemory).twilio.collected_data.collect_survey.answers;
    return transformAnswers(autopilotAnswers);
  }
  return memory as LexMemory;
};

// TODO: Rework this function to build up the prepopulated contact in memory then save it to HRM, rather than saving an empty contact then prepopulating the draft state
// eslint-disable-next-line sonarjs/cognitive-complexity
export const prepopulateForm = async (task: ITask) => {
  const { currentDefinitionVersion } = getDefinitionVersions();
  if (!currentDefinitionVersion) {
    console.warn('Attempting to prepopulate a form but no definition has been loaded, abandoning attempt.');
    return;
  }

  const createdContact = findContactByTaskSid(Manager.getInstance().store.getState() as RootState, task.taskSid)
    .savedContact;

  const { memory, preEngagementData } = task.attributes;

  if (!memory && !preEngagementData) return;

  const { tabbedForms, prepopulateKeys } = currentDefinitionVersion;
  const { ChildInformationTab, CallerInformationTab, CaseInformationTab } = tabbedForms;
  const { preEngagement, survey } = prepopulateKeys;

  // When a helpline has preEnagagement form and no survey
  if (preEngagementData && !memory) {
    // PreEngagementData Values
    const childInfoValues = getValuesFromPreEngagementData(
      preEngagementData,
      ChildInformationTab,
      preEngagement.ChildInformationTab,
    );
    Manager.getInstance().store.dispatch(prepopulateFormAction(callTypes.child, childInfoValues, createdContact.id));
    // Open tabbed form to first tab
    Manager.getInstance().store.dispatch(
      RoutingActions.changeRoute(
        { route: 'tabbed-forms', subroute: 'childInformation', autoFocus: true },
        task.taskSid,
      ),
    );
    return;
  }

  const answers = getAnswers(memory);

  const isValidSurvey = Boolean(answers.aboutSelf); // determines if the memory has valid values or if it was aborted
  const isAboutSelf = answers.aboutSelf === 'Yes';
  // eslint-disable-next-line no-nested-ternary
  const callType = isValidSurvey ? (isAboutSelf ? callTypes.child : callTypes.caller) : null;
  const tabFormDefinition = isAboutSelf ? ChildInformationTab : CallerInformationTab;
  const prepopulateSurveyKeys = isAboutSelf ? survey.ChildInformationTab : survey.CallerInformationTab;
  const subroute = isAboutSelf ? 'childInformation' : 'callerInformation';

  const surveyValues = getValuesFromAnswers(task, answers, tabFormDefinition, prepopulateSurveyKeys);

  // When a helpline has survey and no preEnagagement form
  if (memory && !preEngagementData) {
    if (callType) {
      Manager.getInstance().store.dispatch(prepopulateFormAction(callType, surveyValues, createdContact.id));

      // Open tabbed form to first tab
      Manager.getInstance().store.dispatch(
        RoutingActions.changeRoute({ route: 'tabbed-forms', subroute, autoFocus: true }, task.taskSid),
      );
    }

    return;
  }

  // When a helpline has survey and preEnagagement form to populate
  if (memory && preEngagementData) {
    if (preEngagement.CaseInformationTab.length > 0) {
      const caseInfoValues = getValuesFromPreEngagementData(
        preEngagementData,
        CaseInformationTab,
        preEngagement.CaseInformationTab,
      );

      Manager.getInstance().store.dispatch(prepopulateFormAction(callType, caseInfoValues, createdContact.id, true));
    }

    if (callType) {
      const prepopulatePreengagementKeys = isAboutSelf
        ? preEngagement.ChildInformationTab
        : preEngagement.CallerInformationTab;
      const preEngagementValues = getValuesFromPreEngagementData(
        preEngagementData,
        tabFormDefinition,
        prepopulatePreengagementKeys,
      );
      const values = { ...surveyValues, ...preEngagementValues };
      Manager.getInstance().store.dispatch(prepopulateFormAction(callType, values, createdContact.id));

      // Open tabbed form to first tab
      Manager.getInstance().store.dispatch(
        RoutingActions.changeRoute({ route: 'tabbed-forms', subroute, autoFocus: true }, task.taskSid),
      );
    }
  }
};
