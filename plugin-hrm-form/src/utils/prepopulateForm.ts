import { ITask, Manager } from '@twilio/flex-ui';

import { mapAge, mapGender } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateFormCaller, prepopulateFormChild } from '../states/contacts/actions';
import ChildInformationTab from '../formDefinitions/tabbedForms/ChildInformationTab.json';
import CallerInformationTab from '../formDefinitions/tabbedForms/CallerInformationTab.json';
import type { FormDefinition } from '../components/common/forms/types';

/**
 * Given a form definition, grabs the "gender" named input and return the options values, or empty array.
 */
const getGenderOptions = (definition: FormDefinition) => {
  const genderInputDef = definition.find(e => e.name === 'gender');

  if (genderInputDef.type === 'select') return genderInputDef.options.map(e => e.value) || [];

  console.error('getGenderOptions called with non select input type.');
  return [];
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const prepopulateForm = (task: ITask) => {
  // If this task came from the pre-survey
  if (task.attributes.memory) {
    const { answers } = task.attributes.memory.twilio.collected_data.collect_survey;

    // If can't know if call is child or caller, do nothing here
    if (!answers.about_self || !['Yes', 'No'].includes(answers.about_self.answer)) return;

    const age = !answers.age || answers.age.error ? 'Unknown' : mapAge(answers.age.answer);

    if (answers.about_self.answer === 'Yes') {
      // future work: const ChildInformationTab = Manager.getInstance().store.getState() ... to grab the form definition when it's part of the global state (instead of bundled with the code)
      const genderOptions = getGenderOptions(ChildInformationTab as FormDefinition);
      const gender =
        !answers.gender || answers.gender.error ? 'Unknown' : mapGender(genderOptions)(answers.gender.answer);

      Manager.getInstance().store.dispatch(prepopulateFormChild(gender, age, task.taskSid));
    } else if (answers.about_self.answer === 'No') {
      // future work: const CallerInformationTab = Manager.getInstance().store.getState() ... to grab the form definition when it's part of the global state (instead of bundled with the code)
      const genderOptions = getGenderOptions(CallerInformationTab as FormDefinition);
      const gender =
        !answers.gender || answers.gender.error ? 'Unknown' : mapGender(genderOptions)(answers.gender.answer);

      Manager.getInstance().store.dispatch(prepopulateFormCaller(gender, age, task.taskSid));
    } else return;

    // Open tabbed form to first tab
    const subroute = answers.about_self.answer === 'Yes' ? 'childInformation' : 'callerInformation';
    Manager.getInstance().store.dispatch(RoutingActions.changeRoute({ route: 'tabbed-forms', subroute }, task.taskSid));
  }
};
