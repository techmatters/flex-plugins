import { Manager } from '@twilio/flex-ui';

import { mapAge, mapGender } from './mappers';
import * as RoutingActions from '../states/routing/actions';
import { prepopulateFormCaller, prepopulateFormChild } from '../states/contacts/actions';

export const prepopulateForm = task => {
  // If this task came from the pre-survey
  if (task.attributes.memory) {
    const { answers } = task.attributes.memory.twilio.collected_data.collect_survey;

    // If can't know if call is child or caller, do nothing here
    if (!answers.about_self || !['Yes', 'No'].includes(answers.about_self.answer)) return;

    const gender = !answers.gender || answers.gender.error ? 'Unknown' : mapGender(answers.gender.answer);
    const age = !answers.age || answers.age.error ? 'Unknown' : mapAge(answers.age.answer);

    if (answers.about_self.answer === 'Yes') {
      Manager.getInstance().store.dispatch(prepopulateFormChild(gender, age, task.taskSid));
    } else if (answers.about_self.answer === 'No') {
      Manager.getInstance().store.dispatch(prepopulateFormCaller(gender, age, task.taskSid));
    } else return;

    // Open tabbed form to first tab
    const subroute = answers.about_self.answer === 'Yes' ? 'childInformation' : 'callerInformation';
    Manager.getInstance().store.dispatch(RoutingActions.changeRoute({ route: 'tabbed-forms', subroute }, task.taskSid));
  }
};
