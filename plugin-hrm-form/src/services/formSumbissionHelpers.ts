/* eslint-disable import/no-unused-modules */
import { Actions, ITask } from '@twilio/flex-ui';

import { getConfig } from '../HrmFormPlugin';
import { TaskEntry as Contact } from '../states/contacts/reducer';
import { Case, CustomITask, isOfflineContactTask } from '../types/types';
import { channelTypes } from '../states/DomainConstants';
import { buildInsightsData } from './InsightsService';
import { saveToHrm } from './ContactService';
import { assignOfflineContact } from './ServerlessService';

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

export const completeContactlessTask = async (task: CustomITask) => {
  // const { attributes } = task;
  /*
   * Don't record insights for this task,
   * but null out the Task ID so the Insights record is clean.
   */
  // const newAttributes = {
  //   ...attributes,
  //   skipInsights: true,
  //   conversations: {
  //     /* eslint-disable-next-line camelcase */
  //     conversation_attribute_5: null,
  //   },
  // };
  // await task.setAttributes(newAttributes);
  // await Actions.invokeAction('CompleteTask', { task });
};

export const completeTask = (task: CustomITask) =>
  isOfflineContactTask(task) ? completeContactlessTask(task) : completeContactTask(task);

export const submitContactForm = async (task: CustomITask, contactForm: Contact, caseForm: Case) => {
  const { workerSid, helpline } = getConfig();

  if (isOfflineContactTask(task)) {
    const targetSid = contactForm.contactlessTask.createdOnBehalfOf as string;
    const initialAttributes = { helpline, channelType: 'default', isContactlessTask: true, isInMyBehalf: true };
    const finalAttributes = buildInsightsData(initialAttributes, contactForm, caseForm, {});
    await assignOfflineContact(targetSid, finalAttributes);
    return {}; // do not save yet
  }

  const contact = await saveToHrm(task, contactForm, workerSid, helpline);
  return contact;
};
