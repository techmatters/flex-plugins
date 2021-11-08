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
    return inputDef.unknownOption || inputDef.options.find(e => e.value === 'Unknown').value;
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
  // This prevents setting redux state with the 'Unknown' value for a property that is not asked by the pre-survey
  if (!answers[key]) return null;

  // This prevents setting redux state with the 'Unknown' value for a property that is not present on the definition
  if (!definition.find(e => e.name === key)) {
    console.error(`${key} does not exist in the current definition`);
    return null;
  }

  const unknown = getUnknownOption(key, definition);
  const isUnknownAnswer = answers[key].error || answers[key].answer === unknown;

  if (isUnknownAnswer) return unknown;

  const options = getSelectOptions(key)(definition);
  const result = mapperFunction(options)(answers[key].answer);

  return result === 'Unknown' ? unknown : result;
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
      ...(firstName && { firstName }),
      ...(gender && { gender }),
      ...(age && { age }),
      ...(ethnicity && { ethnicity }),
      ...(language && { language: capitalize(language) }),
    };

    Manager.getInstance().store.dispatch(prepopulateFormAction(callType, values, task.taskSid));

    // Open tabbed form to first tab
    const subroute = isAboutSelf ? 'childInformation' : 'callerInformation';
    Manager.getInstance().store.dispatch(RoutingActions.changeRoute({ route: 'tabbed-forms', subroute }, task.taskSid));
  }
};
