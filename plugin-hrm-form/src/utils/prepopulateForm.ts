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

import { mapAge, mapGenericOption } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateForm as prepopulateFormAction } from '../states/contacts/actions';
import { getDefinitionVersions } from '../hrmConfig';
import { FeatureFlags } from 'types/types';

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

const transformAnswers = answers => {
  /**
   * Map naming mismatches between autopilot and lex
   * TODO: rename Lex 'slots' so we don't need to use this map
   */
  const keyRenames = {
    // eslint-disable-next-line camelcase
    about_self: 'CallerType',
  };

  const renameKey = key => (Object.keys(keyRenames).includes(key) ? keyRenames[key] : key);
  return Object.keys(answers).reduce(
    (acc, currentKey) => ({ ...acc, [renameKey(currentKey)]: answers[currentKey].answer }),
    {},
  );
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const prepopulateForm = (task: ITask, featureFlags: FeatureFlags) => {
  const { memory, preEngagementData } = task.attributes;

  if (!memory && !preEngagementData) return;

  const { currentDefinitionVersion } = getDefinitionVersions();
  if (!currentDefinitionVersion) {
    console.warn('Attempting to prepopulate a form but no definition has been loaded, abandoning attempt.');
    return;
  }
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
    Manager.getInstance().store.dispatch(prepopulateFormAction(callTypes.child, childInfoValues, task.taskSid));
    // Open tabbed form to first tab
    Manager.getInstance().store.dispatch(
      RoutingActions.changeRoute(
        { route: 'tabbed-forms', subroute: 'childInformation', autoFocus: true },
        task.taskSid,
      ),
    );
    return;
  }

  const answers = featureFlags.enable_lex_prepopulate
    ? memory.slots
    : transformAnswers(memory.twilio.collected_data.collect_survey.answers);

  const isAboutSelf = answers.CallerType === 'Yes';
  const callType = isAboutSelf || !answers.CallerType ? callTypes.child : callTypes.caller;
  const tabFormDefinition = isAboutSelf ? ChildInformationTab : CallerInformationTab;
  const prepopulateSurveyKeys = isAboutSelf ? survey.ChildInformationTab : survey.CallerInformationTab;
  const subroute = isAboutSelf ? 'childInformation' : 'callerInformation';

  const surveyValues = getValuesFromAnswers(task, answers, tabFormDefinition, prepopulateSurveyKeys);

  // When a helpline has survey and no preEnagagement form
  if (memory && !preEngagementData) {
    Manager.getInstance().store.dispatch(prepopulateFormAction(callType, surveyValues, task.taskSid));

    // Open tabbed form to first tab
    Manager.getInstance().store.dispatch(
      RoutingActions.changeRoute({ route: 'tabbed-forms', subroute, autoFocus: true }, task.taskSid),
    );
    return;
  }

  // When a helpline has survey and preEnagagement form to populate
  if (memory && preEngagementData) {
    const prepopulatePreengagementKeys = isAboutSelf
      ? preEngagement.ChildInformationTab
      : preEngagement.CallerInformationTab;
    const preEngagementValues = getValuesFromPreEngagementData(
      preEngagementData,
      tabFormDefinition,
      prepopulatePreengagementKeys,
    );
    const values = { ...surveyValues, ...preEngagementValues };
    Manager.getInstance().store.dispatch(prepopulateFormAction(callType, values, task.taskSid));

    if (preEngagement.CaseInformationTab.length > 0) {
      const caseInfoValues = getValuesFromPreEngagementData(
        preEngagementData,
        CaseInformationTab,
        preEngagement.CaseInformationTab,
      );

      Manager.getInstance().store.dispatch(prepopulateFormAction(callType, caseInfoValues, task.taskSid, true));
    }
    // Open tabbed form to first tab
    Manager.getInstance().store.dispatch(
      RoutingActions.changeRoute({ route: 'tabbed-forms', subroute, autoFocus: true }, task.taskSid),
    );
  }
};
