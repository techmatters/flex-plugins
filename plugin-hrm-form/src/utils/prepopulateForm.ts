import { ITask, Manager } from '@twilio/flex-ui';
import { capitalize } from 'lodash';

import { mapAge, mapGenericOption } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateFormCaller, prepopulateFormChild } from '../states/contacts/actions';
import type { FormDefinition } from '../components/common/forms/types';
import { getDefinitionVersions } from '../HrmFormPlugin';

/**
 * Get the available options from a select type
 *
 * @param definition FormDefinition to use. e.g.: ChildInformationTab or CallerInformationTab
 * @param name property name. e.g.: age, gender, ethnicity
 * @returns the available options
 */
const getSelectOptions = (definition: FormDefinition, name: string) => {
  const inputDef = definition.find(e => e.name === name);

  if (!inputDef) {
    console.error(`${name} does not exist in the current definition`);
    return [];
  } else if (inputDef.type !== 'select') {
    console.error('getSelectOptions called with non select input type.');
    return [];
  }

  return inputDef.options.map(e => e.value) || [];
};

type MapFn = (options: string[]) => (value: string) => string;

/**
 * Get the value to be prepopulated from the available options.
 *
 * @param answers the chatbot answers
 * @param definition FormDefinition to use. e.g.: ChildInformationTab or CallerInformationTab
 * @param name property name. e.g.: age, gender, ethnicity
 * @param map mapper function. By default, using mapGenericOption
 * @returns the value to be prepopulated
 */
const getSelectValue = (answers: any, definition: FormDefinition, name: string, map: MapFn = mapGenericOption) => {
  const options = getSelectOptions(definition, name);

  if (options.length === 0) {
    return null;
  }

  const fallbackOption = options.includes('Unknown') ? 'Unknown' : options[options.length - 1];
  return !answers[name] || answers[name].error ? fallbackOption : map(options)(answers[name].answer);
};

/**
 * Get the age value to be prepopulated.
 *
 * @param answers the chatbot answers
 * @param definition FormDefinition to use. e.g.: ChildInformationTab or CallerInformationTab
 * @returns the age value to be prepopulated
 */
const getAgeValue = (answers: any, definition: FormDefinition) => {
  const mapAgeFn = (options: string[]) => mapAge;
  return getSelectValue(answers, definition, 'age', mapAgeFn);
};

export const prepopulateForm = (task: ITask) => {
  // If this task came from the pre-survey
  if (task.attributes.memory) {
    const { answers } = task.attributes.memory.twilio.collected_data.collect_survey;
    const { firstName, language } = task.attributes;

    // If can't know if call is child or caller, do nothing here
    if (!answers.about_self || !['Yes', 'No'].includes(answers.about_self.answer)) return;

    const { CallerInformationTab, ChildInformationTab } = getDefinitionVersions().currentDefinitionVersion.tabbedForms;

    const isAboutSelf = answers.about_self.answer === 'Yes';
    const definitionForm = isAboutSelf ? ChildInformationTab : CallerInformationTab;
    const prepopulateFormAction = isAboutSelf ? prepopulateFormChild : prepopulateFormCaller;

    const age = getAgeValue(answers, definitionForm);
    const gender = getSelectValue(answers, definitionForm, 'gender');
    const ethnicity = getSelectValue(answers, definitionForm, 'ethnicity');

    Manager.getInstance().store.dispatch(
      prepopulateFormAction(firstName, gender, age, ethnicity, capitalize(language), task.taskSid),
    );

    // Open tabbed form to first tab
    const subroute = isAboutSelf ? 'childInformation' : 'callerInformation';
    Manager.getInstance().store.dispatch(RoutingActions.changeRoute({ route: 'tabbed-forms', subroute }, task.taskSid));
  }
};
