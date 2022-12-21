/* eslint-disable import/no-unused-modules */
import { Actions, ITask, Manager } from '@twilio/flex-ui';

import { getConfig } from '../HrmFormPlugin';
import { TaskEntry as Contact } from '../states/contacts/reducer';
import { Case, CustomITask, isOfflineContactTask, offlineContactTaskSid } from '../types/types';
import { channelTypes } from '../states/DomainConstants';
import { buildInsightsData } from './InsightsService';
import { saveContact } from './ContactService';
import { assignOfflineContact, assignOfflineContactResolve } from './ServerlessService';
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
  isOfflineContactTask(task) ? completeContactlessTask(task) : completeContactTask(task);

export const submitContactForm = async (task: CustomITask, contactForm: Contact, caseForm: Case) => {
  const { workerSid } = getConfig();

  if (isOfflineContactTask(task)) {
    const targetWorkerSid = contactForm.contactlessTask.createdOnBehalfOf as string;
    const inBehalfTask = await assignOfflineContact(targetWorkerSid, task.attributes);
    try {
      const savedContact = await saveContact(task, contactForm, workerSid, inBehalfTask.sid);
      const finalAttributes = buildInsightsData(inBehalfTask, contactForm, caseForm, savedContact);
      await assignOfflineContactResolve({
        action: 'complete',
        taskSid: inBehalfTask.sid,
        finalTaskAttributes: finalAttributes,
      });
      return savedContact;
    } catch (err) {
      // If something went wrong remove the task for this offline contact
      await assignOfflineContactResolve({ action: 'remove', taskSid: inBehalfTask.sid });
      // TODO: should we do this? Should we care about removing the savedContact if it succeded? This step could break our "idempotence on contacts"

      // Raise error to caller
      throw err;
    }
  }

  const savedContact = await saveContact(task, contactForm, workerSid, task.taskSid);
  const finalAttributes = buildInsightsData(task, contactForm, caseForm, savedContact);
  await task.setAttributes(finalAttributes);
  return savedContact;
};
