import { getConfig } from '../HrmFormPlugin';
import { CustomITask, isOfflineContactTask, ContactRawJson } from '../types/types';
import { getWorkerAttributes } from './ServerlessService';

/**
 * Helper used to be the source of truth for the helpline value being passed to HRM and Insights
 * TODO: receive only contactForm.contactlessTask.helpline and contactForm.contactlessTask.createdOnBehalfOf
 */
export const getHelplineToSave = async (task: CustomITask, contactlessTask: ContactRawJson['contactlessTask']) => {
  if (isOfflineContactTask(task)) {
    if (contactlessTask.helpline) return contactlessTask.helpline;

    const targetWorkerSid = contactlessTask.createdOnBehalfOf as string;
    const targetWorkerAttributes = await getWorkerAttributes(targetWorkerSid);
    return targetWorkerAttributes.helpline;
  }

  const { helpline: thisWorkerHelpline } = getConfig();
  return thisWorkerHelpline || task.attributes.helpline || '';
};
