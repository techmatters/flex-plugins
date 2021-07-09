/* eslint-disable import/no-unused-modules */
import { Actions, ITask, Manager } from '@twilio/flex-ui';

import { getConfig } from '../HrmFormPlugin';
import { TaskEntry as Contact } from '../states/contacts/reducer';
import { Case, CustomITask, isOfflineContactTask, offlineContactTaskSid } from '../types/types';
import { channelTypes } from '../states/DomainConstants';
import { buildInsightsData } from './InsightsService';
import { saveToHrm } from './ContactService';
import { assignOfflineContact, getWorkerAttributes } from './ServerlessService';
import { removeContactState } from '../states/actions';

/**
 * Function used to manually complete a task (making sure it transitions to wrapping state first).
 */
export const completeContactTask = async (task: ITask) => {
  const { sid } = task;

  if (task.status !== 'wrapping') {
    if (task.channelType === channelTypes.voice) {
      await Actions.invokeAction('HangupCall', { sid, task });
    } else {
      await Actions.invokeAction('WrapupTask', { sid, task });
    }
  }

  await Actions.invokeAction('CompleteTask', { sid, task });
};

export const removeOfflineContact = () => {
  Manager.getInstance().store.dispatch(removeContactState(offlineContactTaskSid));
};

export const completeContactlessTask = async (task: CustomITask) => {
  removeOfflineContact();
};

export const completeTask = (task: CustomITask) =>
  isOfflineContactTask(task) ? removeOfflineContact() : completeContactTask(task);

/**
 * Helper used to be the source of truth for the helpline value being passed to HRM and Insights
 */
export const getHelplineToSave = async (task: CustomITask, contactForm: Contact): Promise<string> => {
  if (isOfflineContactTask(task)) {
    if (contactForm.contactlessTask.helpline) return contactForm.contactlessTask.helpline as string;

    const targetWorkerSid = contactForm.contactlessTask.createdOnBehalfOf as string;
    const targetWorkerAttributes = await getWorkerAttributes(targetWorkerSid);
    return targetWorkerAttributes.helpline;
  }

  const { helpline: thisWorkerHelpline } = getConfig();
  return thisWorkerHelpline || task.attributes.helpline || '';
};

export const submitContactForm = async (task: CustomITask, contactForm: Contact, caseForm: Case) => {
  const { workerSid } = getConfig();

  const helplineToSave = await getHelplineToSave(task, contactForm);
  const submissionContext = { helplineToSave };

  if (isOfflineContactTask(task)) {
    const targetWorkerSid = contactForm.contactlessTask.createdOnBehalfOf as string;
    const finalAttributes = buildInsightsData(task, contactForm, caseForm, submissionContext);
    const inBehalfTask = await assignOfflineContact(targetWorkerSid, finalAttributes);
    return saveToHrm(task, contactForm, submissionContext, workerSid, inBehalfTask.sid);
  }

  const finalAttributes = buildInsightsData(task, contactForm, caseForm, submissionContext);
  await task.setAttributes(finalAttributes);
  return saveToHrm(task, contactForm, submissionContext, workerSid, task.taskSid);
};
