import { ITask, Manager } from '@twilio/flex-ui';
import { capitalize } from 'lodash';

import { mapAge, mapGender } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateFormCaller, prepopulateFormChild } from '../states/contacts/actions';
import type { FormDefinition } from '../components/common/forms/types';
import { getDefinitionVersions } from '../HrmFormPlugin';

/**
 * Given a key and a form definition, grabs the input with name that equals the key and return the options values, or empty array.
 */
const getSelectOptions = (key: string) => (definition: FormDefinition) => {
  const inputDef = definition.find(e => e.name === key);

  if (inputDef.type === 'select') return inputDef.options.map(e => e.value) || [];

  console.error(`getSelectOptions called with key ${key} but is a non-select input type.`);
  return [];
};

const getAgeOptions = getSelectOptions('age');

/**
 * Given a form definition, grabs the "gender" named input and return the options values, or empty array.
 */
const getGenderOptions = getSelectOptions('gender');

// eslint-disable-next-line sonarjs/cognitive-complexity
export const prepopulateForm = (task: ITask) => {
  const { CallerInformationTab, ChildInformationTab } = getDefinitionVersions().currentDefinitionVersion.tabbedForms;

  // If this task came from the pre-survey
  if (task.attributes.memory) {
    const { answers } = task.attributes.memory.twilio.collected_data.collect_survey;
    const { firstName, language } = task.attributes;

    // If can't know if call is child or caller, do nothing here
    if (!answers.about_self || !['Yes', 'No'].includes(answers.about_self.answer)) return;

    if (answers.about_self.answer === 'Yes') {
      const ageOptions = getAgeOptions(ChildInformationTab);
      const age = !answers.age || answers.age.error ? 'Unknown' : mapAge(ageOptions)(answers.age.answer);

      const genderOptions = getGenderOptions(ChildInformationTab);
      const gender =
        !answers.gender || answers.gender.error ? 'Unknown' : mapGender(genderOptions)(answers.gender.answer);

      Manager.getInstance().store.dispatch(
        prepopulateFormChild(firstName, gender, age, capitalize(language), task.taskSid),
      );
    } else if (answers.about_self.answer === 'No') {
      const ageOptions = getAgeOptions(CallerInformationTab);
      const age = !answers.age || answers.age.error ? 'Unknown' : mapAge(ageOptions)(answers.age.answer);

      const genderOptions = getGenderOptions(CallerInformationTab);
      const gender =
        !answers.gender || answers.gender.error ? 'Unknown' : mapGender(genderOptions)(answers.gender.answer);

      Manager.getInstance().store.dispatch(
        prepopulateFormCaller(firstName, gender, age, capitalize(language), task.taskSid),
      );
    } else return;

    // Open tabbed form to first tab
    const subroute = answers.about_self.answer === 'Yes' ? 'childInformation' : 'callerInformation';
    Manager.getInstance().store.dispatch(RoutingActions.changeRoute({ route: 'tabbed-forms', subroute }, task.taskSid));
  }
};
