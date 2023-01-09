import { ITask, Manager } from '@twilio/flex-ui';
import { capitalize } from 'lodash';
import { callTypes, FormDefinition, FormItemDefinition } from 'hrm-form-definitions';

import { mapAge, mapGenericOption } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateForm as prepopulateFormAction } from '../states/contacts/actions';
import { getDefinitionVersions } from '../HrmFormPlugin';

const getUnknownOption = (key: string, definition: FormDefinition) => {
  const inputDef = definition.find(e => e.name === key);

  if (inputDef && inputDef.type === 'select') {
    const unknownOption = inputDef.unknownOption || inputDef.options.find(e => e.value === 'Unknown');
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
    const isUnknownAnswer = answers[key].error || answers[key].answer === unknown;

    if (isUnknownAnswer) return unknown;

    const options = getSelectOptions(key)(definition);
    const result = mapperFunction(options)(answers[key].answer);

    return result === 'Unknown' ? unknown : result;
  }

  return answers[key].answer;
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
      if (field.type === 'mixed-checkbox') {
        if (preEngagementData[field.name]?.toLowerCase() === 'yes') {
          values[field.name] = true;
        } else if (preEngagementData[field.name]?.toLowerCase() === 'no') {
          values[field.name] = false;
        }
        return;
      }
      values[field.name] = preEngagementData[field.name] || '';
    }
  });
  return values;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const prepopulateForm = (task: ITask) => {
  const { memory, preEngagementData } = task.attributes;
  if (memory === null && preEngagementData === null) return;

  const { currentDefinitionVersion } = getDefinitionVersions();
  const { tabbedForms, prepopulateKeys } = currentDefinitionVersion;
  const { ChildInformationTab, CallerInformationTab, CaseInformationTab } = tabbedForms;
  const { preEngagement, survey } = prepopulateKeys;

  // PreEngagementData Values
  const childInfoValues = getValuesFromPreEngagementData(
    preEngagementData,
    ChildInformationTab,
    preEngagement.ChildInformationTab,
  );

  // When a helpline has preEnagagement form and no survey
  if (preEngagementData && memory === null) {
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

  const { answers } = memory.twilio.collected_data.collect_survey;

  const isAboutSelf = answers.about_self.answer === 'Yes';
  const callType = isAboutSelf || !answers.about_self ? callTypes.child : callTypes.caller;
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
