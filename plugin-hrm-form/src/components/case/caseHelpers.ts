import { HelplineDefinitions } from 'hrm-form-definitions';

import { TaskEntry } from '../../states/contacts/reducer';
import { CustomITask, isOfflineContactTask } from '../../types/types';

/**
 * Gets date from the entry form (for a contact that hasn't been saved).
 * @param task Twilio Task Sid
 * @param form Entry Form
 */
export const getDateFromNotSavedContact = (task: CustomITask, form: TaskEntry) => {
  if (isOfflineContactTask(task)) {
    const { date: dateString, time } = form.contactlessTask;
    return new Date(`${dateString}T${time}:00`);
  }

  return Date.now();
};

/**
 * Gets Helpline Data (Name, Case Manager, etc.)
 * @param helpline Helpline to filter
 * @param helplineInformation Helpline Information Collection
 */
export const getHelplineData = (helpline?: string, helplineInformation?: HelplineDefinitions) => {
  if (helpline && helplineInformation) return helplineInformation.helplines.find(x => x.value === helpline);
  return undefined;
};
