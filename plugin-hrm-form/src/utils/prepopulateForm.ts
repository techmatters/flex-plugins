import { ITask, Manager } from '@twilio/flex-ui';
import { capitalize } from 'lodash';

import { mapAge, mapGenericOption } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateForm as prepopulateFormAction } from '../states/contacts/actions';
import type { FormDefinition } from '../components/common/forms/types';
import { getDefinitionVersions } from '../HrmFormPlugin';
import callTypes from '../states/DomainConstants';

const getUnknownOption = (key: string, definition: FormDefinition) => {
  const inputDef = definition.find(e => e.name === key);

  if (inputDef && inputDef.type === 'select') {
    return inputDef.options.find(e => e.unknown || e.value === 'Unknown').value;
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

type PrePopulateAnswers = 'age' | 'gender' | 'ethnicity';
type MapperFunction = (options: string[]) => (value: string) => string;

const getAnswerOrUnknown = (
  answers: any,
  key: PrePopulateAnswers,
  definition: FormDefinition,
  mapperFunction: MapperFunction = mapGenericOption,
) => {
  if (!definition.find(e => e.name === key)) {
    console.error(`${key} does not exist in the current definition`);
    return undefined; // This prevents saving at redux a property that is not present on the definition with the 'Unknown' value
  }

  const unknown = getUnknownOption(key, definition);
  if (!answers[key] || answers[key].error) return unknown;
  if (answers[key].answer === unknown) return unknown;

  const options = getSelectOptions(key)(definition);
  return mapperFunction(options)(answers[key].answer);
};

export const prepopulateForm = (task: ITask) => {
  // If this task came from the pre-survey
  if (task.attributes.memory) {
    const { answers } = task.attributes.memory.twilio.collected_data.collect_survey;

    // If can't know if call is child or caller, do nothing here
    if (!answers.about_self || !['Yes', 'No'].includes(answers.about_self.answer)) return;

    const { CallerInformationTab, ChildInformationTab } = getDefinitionVersions().currentDefinitionVersion.tabbedForms;
    const isAboutSelf = answers.about_self.answer === 'Yes';
    const callType = isAboutSelf ? callTypes.child : callTypes.caller;
    const definitionForm = isAboutSelf ? ChildInformationTab : CallerInformationTab;

    const { firstName, language } = task.attributes;
    const age = getAnswerOrUnknown(answers, 'age', definitionForm, mapAge);
    const gender = getAnswerOrUnknown(answers, 'gender', definitionForm);
    const ethnicity = getAnswerOrUnknown(answers, 'ethnicity', definitionForm);

    const values = {
      firstName,
      gender,
      age,
      ethnicity,
      language: capitalize(language),
    };

    Manager.getInstance().store.dispatch(prepopulateFormAction(callType, values, task.taskSid));

    // Open tabbed form to first tab
    const subroute = isAboutSelf ? 'childInformation' : 'callerInformation';
    Manager.getInstance().store.dispatch(RoutingActions.changeRoute({ route: 'tabbed-forms', subroute }, task.taskSid));
  }
};
