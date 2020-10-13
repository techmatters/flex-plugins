import { Manager } from '@twilio/flex-ui';

import { mapAge, mapGender } from './mappers';
import { Actions } from '../states/ContactState';
import * as RoutingActions from '../states/routing/actions';

export const prepopulateForm = task => {
  // If this task came from the pre-survey
  if (task.attributes.memory) {
    const { answers } = task.attributes.memory.twilio.collected_data.collect_survey;

    const gender = !answers.gender || answers.gender.error ? 'Unknown' : mapGender(answers.gender.answer);
    const age = !answers.age || answers.age.error ? 'Unknown' : mapAge(answers.age.answer);

    if (answers.about_self.answer === 'Yes') {
      Manager.getInstance().store.dispatch(Actions.prepopulateFormChild(gender, age, task.taskSid));
    } else {
      Manager.getInstance().store.dispatch(Actions.prepopulateFormCaller(gender, age, task.taskSid));
    }

    // Open tabbed form to first tab
    Manager.getInstance().store.dispatch(RoutingActions.changeRoute({ route: 'tabbed-forms' }, task.taskSid));
    Manager.getInstance().store.dispatch(Actions.changeTab(1, task.taskSid));
  }
};
