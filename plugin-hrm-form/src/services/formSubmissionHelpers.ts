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
import { Actions, Manager } from '@twilio/flex-ui';
import { Dispatch } from 'react';

import {
  Case,
  Contact,
  CustomITask,
  isOfflineContact,
  isOfflineContactTask,
  isTwilioTask,
  RouterTask,
} from '../types/types';
import { channelTypes } from '../states/DomainConstants';
import { buildInsightsData } from './InsightsService';
import { finalizeContact, saveContact } from './ContactService';
import { assignOfflineContactInit, assignOfflineContactResolve } from './ServerlessService';
import { getHrmConfig } from '../hrmConfig';
import { ContactMetadata } from '../states/contacts/types';
import * as GeneralActions from '../states/actions';
import asyncDispatch from '../states/asyncDispatch';
import { newClearContactAsyncAction, removeFromCaseAsyncAction } from '../states/contacts/saveContact';
import { getOfflineContactTaskSid } from '../states/contacts/offlineContactTask';
import '../types';
import { getExternalRecordingInfo } from './getExternalRecordingInfo';

/**
 * Function used to manually complete a task (making sure it transitions to wrapping state first).
 */
export const completeContactTask = async (task: RouterTask) => {
  if (!isTwilioTask(task)) return;
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

export const removeOfflineContact = async (dispatch: Dispatch<any>, contact: Contact) => {
  if (isOfflineContact(contact) && !contact.finalizedAt) {
    const asyncDispatcher = asyncDispatch(dispatch);
    await asyncDispatcher(newClearContactAsyncAction(contact));
    await asyncDispatcher(removeFromCaseAsyncAction(contact.id));
    dispatch(GeneralActions.removeContactState(getOfflineContactTaskSid(), contact.id));
  }
};

export const completeTask = (task: RouterTask, contact: Contact) =>
  isOfflineContactTask(task)
    ? Manager.getInstance().store.dispatch(GeneralActions.removeContactState(getOfflineContactTaskSid(), contact.id))
    : completeContactTask(task);

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
      const savedContact = await saveContact(task, contact, metadata, workerSid, inBehalfTask.sid);
      const finalAttributes = buildInsightsData(inBehalfTask, contact, caseForm, savedContact);
      await assignOfflineContactResolve({
        action: 'complete',
        taskSid: inBehalfTask.sid,
        finalTaskAttributes: finalAttributes,
      });
      await finalizeContact(task, savedContact);
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

  const savedContact = await saveContact(task, contact, metadata, workerSid, task.taskSid);
  const recordingsIfAvailable = await getExternalRecordingInfo(task);
  const finalAttributes = buildInsightsData(task, contact, caseForm, savedContact, recordingsIfAvailable);
  await task.setAttributes(finalAttributes);
  return savedContact;
};
