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

import { TaskHelper } from '@twilio/flex-ui';

import { isChatChannel, isVoiceChannel } from '../states/DomainConstants';
import { isNonDataCallType } from '../states/validationRules';
import { getQueryParams } from './PaginationParams';
import { fetchHrmApi } from './fetchHrmApi';
import { getDefinitionVersions, getHrmConfig } from '../hrmConfig';
import {
  Contact,
  ConversationMedia,
  CustomITask,
  isInMyBehalfITask,
  isOfflineContactTask,
  isTwilioTask,
} from '../types/types';
import { saveContactToExternalBackend } from '../dualWrite';
import { getNumberFromTask } from '../utils/task';
import {
  ExternalRecordingInfoSuccess,
  getExternalRecordingInfo,
  isFailureExternalRecordingInfo,
  shouldGetExternalRecordingInfo,
} from './getExternalRecordingInfo';
import { GeneralizedSearchParams, SearchParams } from '../states/search/types';
import { ContactDraftChanges } from '../states/contacts/existingContacts';
import { newContact } from '../states/contacts/contactState';
import { ApiError, FetchOptions } from './fetchApi';
import { TaskSID, WorkerSID } from '../types/twilio';
import { recordEvent } from '../fullStory';

export const convertApiContactToFlexContact = (contact: Contact): Contact =>
  contact
    ? {
        ...contact,
        id: contact.id.toString(),
        ...(contact.caseId ? { caseId: contact.caseId.toString() } : {}),
      }
    : contact;

export async function searchContacts(
  searchParams: SearchParams,
  limit,
  offset,
): Promise<{
  count: number;
  contacts: Contact[];
}> {
  const queryParams = getQueryParams({ limit, offset });
  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };
  const response = await fetchHrmApi(`/contacts/search${queryParams}`, options);
  return {
    ...response,
    contacts: response.contacts.map(convertApiContactToFlexContact),
  };
}

export async function generalizedSearch({
  searchParameters,
  limit,
  offset,
}: {
  searchParameters: GeneralizedSearchParams;
  limit: number;
  offset: number;
}): Promise<{
  count: number;
  contacts: Contact[];
}> {
  const queryParams = getQueryParams({ limit, offset });
  const options = {
    method: 'POST',
    body: JSON.stringify({ searchParameters }),
  };

  const response = await fetchHrmApi(`/contacts/generalizedSearch${queryParams}`, options);
  return {
    ...response,
    contacts: response.contacts.map(convertApiContactToFlexContact),
  };
}

type HandleTwilioTaskResponse = {
  conversationMedia: ConversationMedia[];
  externalRecordingInfo?: ExternalRecordingInfoSuccess;
};

export const handleTwilioTask = async (
  task,
  contact?: Contact,
  reservationSid?: string | undefined,
): Promise<HandleTwilioTaskResponse> => {
  const returnData: HandleTwilioTaskResponse = {
    conversationMedia: [],
  };

  if (!isTwilioTask(task)) {
    return returnData;
  }

  const finalReservationSid = reservationSid ?? task.sid;
  const isChatTask = TaskHelper.isChatBasedTask(task) || (contact && isChatChannel(contact.channel));
  const isVoiceTask = TaskHelper.isCallTask(task) || (contact && isVoiceChannel(contact.channel));
  const isCallOrChatTask = isChatTask || isVoiceTask;

  try {
    if (isChatTask) {
      returnData.conversationMedia.push({
        storeType: 'S3',
        storeTypeSpecificData: {
          type: 'transcript',
          location: undefined,
        },
      });
    }

    // Store reservation sid to use Twilio insights overlay (recordings/transcript)
    if (isCallOrChatTask) {
      returnData.conversationMedia.push({
        storeType: 'twilio',
        storeTypeSpecificData: {
          reservationSid: finalReservationSid,
        },
      });
    }

    if (!shouldGetExternalRecordingInfo(task)) return returnData;

    const externalRecordingInfo = await getExternalRecordingInfo(task);
    if (isFailureExternalRecordingInfo(externalRecordingInfo)) {
      const error = `Failed to get external recording info: ${externalRecordingInfo.error}`;
      console.error(error, 'Task:', task);
      recordEvent('Backend Error: Get External Recording Info', {
        taskSid: task.taskSid,
        reservationSid: finalReservationSid,
        recordingError: externalRecordingInfo.error,
        isCallTask: isVoiceTask,
        isChatBasedTask: isChatTask,
        attributes: JSON.stringify(task.attributes),
      });
      return returnData;
    }

    returnData.externalRecordingInfo = externalRecordingInfo;
    const { bucket, key } = externalRecordingInfo;
    returnData.conversationMedia.push({
      storeType: 'S3',
      storeTypeSpecificData: {
        type: 'recording',
        location: { bucket, key },
      },
    });
  } catch (err) {
    console.error(
      'Error processing contact media during finalization:',
      err,
      'Task:',
      task,
      'Return data captured so far:',
      returnData,
    );
  }

  return returnData;
};

export const createContact = async (
  contact: Contact,
  twilioWorkerId: WorkerSID,
  task: CustomITask,
): Promise<Contact> => {
  const taskSid =
    isOfflineContactTask(task) || isInMyBehalfITask(task)
      ? task.taskSid
      : task.attributes?.transferMeta?.originalTask ?? task.taskSid;

  const number = getNumberFromTask(task);

  const { definitionVersion } = getHrmConfig();
  const contactForApi: Contact = {
    ...contact,
    number,
    definitionVersion,
    channel: ((task.attributes as any)?.customChannelType || task.channelType) as Contact['channel'],
    rawJson: {
      definitionVersion,
      ...contact.rawJson,
    },
    twilioWorkerId,
    taskId: taskSid,
    ...(contact.caseId ? { caseId: contact.caseId.toString() } : {}),
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(contactForApi),
  };

  return convertApiContactToFlexContact(await fetchHrmApi(`/contacts?finalize=false`, options));
};

export const updateContactInHrm = async (
  contactId: string,
  body: ContactDraftChanges,
  finalize: boolean = false,
): Promise<Contact> => {
  const options = {
    method: 'PATCH',
    body: JSON.stringify(body),
  };

  return convertApiContactToFlexContact(await fetchHrmApi(`/contacts/${contactId}?finalize=${finalize}`, options));
};

/**
 * Function that saves the form to Contacts table.
 * If you don't intend to complete the twilio task, set shouldFillEndMillis=false
 */
const saveContactToHrm = async (
  task,
  contact: Contact,
  workerSid: WorkerSID,
  uniqueIdentifier: TaskSID,
): Promise<Contact> => {
  // if we got this far, we assume the form is valid and ready to submit
  const { callType } = contact.rawJson;

  const number = getNumberFromTask(task);

  let form = contact.rawJson;
  const { currentDefinitionVersion } = getDefinitionVersions();

  if (!currentDefinitionVersion) {
    throw new Error('Cannot save the form if the current form definitions are not loaded');
  }

  if (isNonDataCallType(callType)) {
    const blankContact = newContact(currentDefinitionVersion, task);
    form = {
      ...blankContact.rawJson,
      callType,
      ...(isOfflineContactTask(task) && {
        contactlessTask: contact.rawJson.contactlessTask,
      }),
    };
  }

  // If isOfflineContactTask, send the target Sid as twilioWorkerId value and store workerSid (issuer) in rawForm
  const twilioWorkerId =
    isOfflineContactTask(task) && form.contactlessTask.createdOnBehalfOf
      ? form.contactlessTask.createdOnBehalfOf
      : workerSid;
  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */

  const contactToSave: Contact = {
    ...contact,
    rawJson: form,
    twilioWorkerId,
    queueName: task.queueName,
    number,
    taskId: uniqueIdentifier,
  };

  return updateContactInHrm(contact.id, contactToSave, false);
};

export const finalizeContact = async (
  task,
  contact: Contact,
  reservationSid?: string | undefined,
): Promise<Contact> => {
  try {
    const twilioTaskResult = await handleTwilioTask(task, contact, reservationSid);
    await saveConversationMedia(contact.id, twilioTaskResult.conversationMedia);
    return await updateContactInHrm(contact.id, {}, true);
  } catch (error) {
    console.error('Error finalizing contact:', error);
    throw new Error('Failed to finalize contact');
  }
};

export const saveContact = async (task, contact: Contact, workerSid: WorkerSID, uniqueIdentifier: TaskSID) => {
  const savedContact = await saveContactToHrm(task, contact, workerSid, uniqueIdentifier);
  // TODO: add catch clause to handle saving to Sync Doc
  try {
    // Add the old category format back, but leave out all the explicit false values
    const legacyCategories = {};
    Object.entries(contact.rawJson.categories).forEach(([key, value]) => {
      legacyCategories[key] = Object.fromEntries(value.map(category => [category, true]));
    });
    await saveContactToExternalBackend(task, {
      ...savedContact,
      rawJson: {
        ...savedContact.rawJson,
        caseInformation: {
          ...savedContact.rawJson.caseInformation,
          categories: legacyCategories,
        },
      },
    });
  } catch (err) {
    console.error(
      `Saving task with sid ${task.taskSid} failed, presumably the attempt to add it to the pending store also failed so this data is likely lost`,
      err,
    );
  }

  return savedContact;
};

export async function connectToCase(contactId: string, caseId: string) {
  const body = { caseId };

  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  return convertApiContactToFlexContact(await fetchHrmApi(`/contacts/${contactId}/connectToCase`, options));
}

export async function removeFromCase(contactId: string) {
  const options = {
    method: 'DELETE',
  };

  return convertApiContactToFlexContact(await fetchHrmApi(`/contacts/${contactId}/connectToCase`, options));
}

async function saveConversationMedia(contactId: string, conversationMedia: ConversationMedia[]) {
  const options = {
    method: 'POST',
    body: JSON.stringify(conversationMedia),
  };

  return fetchHrmApi(`/contacts/${contactId}/conversationMedia`, options);
}

export const getContactByTaskSid = async (taskSid: string): Promise<Contact | undefined> => {
  const options: FetchOptions = {
    method: 'GET',
    returnNullFor404: true,
  };
  try {
    return convertApiContactToFlexContact(await fetchHrmApi(`/contacts/byTaskSid/${taskSid}`, options));
  } catch (err) {
    if (err instanceof ApiError && err.response.status >= 404) {
      return null;
    }
    throw err;
  }
};

export const getContactById = async (contactId: string): Promise<Contact | undefined> => {
  const options: FetchOptions = {
    method: 'GET',
    returnNullFor404: true,
  };
  try {
    return convertApiContactToFlexContact(await fetchHrmApi(`/contacts/${contactId}`, options));
  } catch (err) {
    if (err instanceof ApiError && err.response.status >= 404) {
      return null;
    }
    throw err;
  }
};
