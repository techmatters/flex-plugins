/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable import/no-unused-modules */
import { Actions, ITask, Manager } from '@twilio/flex-ui';

import { Case, CustomITask, Contact, isOfflineContactTask } from '../types/types';
import { channelTypes } from '../states/DomainConstants';
import { buildInsightsData } from './InsightsService';
import { saveContact } from './ContactService';
import { assignOfflineContactInit, assignOfflineContactResolve } from './ServerlessService';
import { getHrmConfig } from '../hrmConfig';
import { ContactMetadata } from '../states/contacts/types';
import findContactByTaskSid from '../states/contacts/findContactByTaskSid';
import { RootState } from '../states';
import * as GeneralActions from '../states/actions';
import getOfflineContactTaskSid from '../states/contacts/offlineContactTaskSid';
import asyncDispatch from '../states/asyncDispatch';
import { newClearContactAsyncAction, connectToCaseAsyncAction } from '../states/contacts/saveContact';

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

export const removeOfflineContact = async () => {
  const offlineContactTaskSid = getOfflineContactTaskSid();
  const manager = Manager.getInstance();
  const contactState = findContactByTaskSid(manager.store.getState() as RootState, offlineContactTaskSid);
  if (contactState?.savedContact && !contactState.savedContact.finalizedAt) {
    await asyncDispatch(manager.store.dispatch)(newClearContactAsyncAction(contactState.savedContact));
    await asyncDispatch(manager.store.dispatch)(connectToCaseAsyncAction(contactState.savedContact.id, undefined));
    manager.store.dispatch(GeneralActions.removeContactState(offlineContactTaskSid, contactState.savedContact.id));
  }
};

export const completeContactlessTask = async () => {
  await removeOfflineContact();
};

export const completeTask = (task: CustomITask) =>
  isOfflineContactTask(task) ? completeContactlessTask() : completeContactTask(task);

export const submitContactForm = async (
  task: CustomITask,
  contact: Contact,
  metadata: ContactMetadata,
  caseForm: Case,
) => {
  const { workerSid } = getHrmConfig();

  if (isOfflineContactTask(task)) {
    const targetWorkerSid = contact.rawJson.contactlessTask.createdOnBehalfOf as string;
    const inBehalfTask = await assignOfflineContactInit(targetWorkerSid, task.attributes);
    try {
      const { contact: savedContact } = await saveContact(task, contact, metadata, workerSid, inBehalfTask.sid);
      const finalAttributes = buildInsightsData(inBehalfTask, contact, caseForm, savedContact);
      await assignOfflineContactResolve({
        action: 'complete',
        taskSid: inBehalfTask.sid,
        finalTaskAttributes: finalAttributes,
      });
      return savedContact;
    } catch (err) {
      // If something went wrong remove the task for this offline contact
      assignOfflineContactResolve({
        action: 'remove',
        taskSid: inBehalfTask.sid,
      });
      // TODO: should we do this? Should we care about removing the savedContact if it succeded? This step could break our "idempotence on contacts"

      // Raise error to caller
      throw err;
    }
  }

  const { contact: savedContact, externalRecordingInfo } = await saveContact(
    task,
    contact,
    metadata,
    workerSid,
    task.taskSid,
  );

  const finalAttributes = buildInsightsData(task, contact, caseForm, savedContact, externalRecordingInfo);
  await task.setAttributes(finalAttributes);
  return savedContact;
};
