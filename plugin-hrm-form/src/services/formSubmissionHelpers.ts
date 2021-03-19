/* eslint-disable import/no-unused-modules */
import { Actions, ITask, Manager } from '@twilio/flex-ui';

import { getConfig, reRenderAgentDesktop } from '../HrmFormPlugin';
import { TaskEntry as Contact } from '../states/contacts/reducer';
import { Case, CustomITask, isOfflineContactTask, offlineContactTaskSid } from '../types/types';
import { channelTypes } from '../states/DomainConstants';
import { buildInsightsData } from './InsightsService';
import { saveToHrm } from './ContactService';
import { assignOfflineContact } from './ServerlessService';
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
  await reRenderAgentDesktop();
};

export const completeTask = (task: CustomITask) =>
  isOfflineContactTask(task) ? removeOfflineContact() : completeContactTask(task);

export const submitContactForm = async (task: CustomITask, contactForm: Contact, caseForm: Case) => {
  const { workerSid, helpline } = getConfig();

  if (isOfflineContactTask(task)) {
    const targetSid = contactForm.contactlessTask.createdOnBehalfOf as string;
    const initialAttributes = { helpline, channelType: 'default', isContactlessTask: true, isInMyBehalf: true };
    const finalAttributes = buildInsightsData(initialAttributes, contactForm, caseForm);
    const inBehalfTask = await assignOfflineContact(targetSid, finalAttributes);
    return saveToHrm(task, contactForm, workerSid, helpline, inBehalfTask.sid);
  }

  return saveToHrm(task, contactForm, workerSid, helpline, task.taskSid);
};
