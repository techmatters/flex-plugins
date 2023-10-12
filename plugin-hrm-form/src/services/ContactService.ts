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
import { CallTypes, DefinitionVersion } from 'hrm-form-definitions';

import { isNonDataCallType } from '../states/validationRules';
import { getQueryParams } from './PaginationParams';
import { fillEndMillis, getConversationDuration } from '../utils/conversationDuration';
import { fetchHrmApi } from './fetchHrmApi';
import { getDateTime } from '../utils/helpers';
import { getDefinitionVersions, getHrmConfig } from '../hrmConfig';
import {
  ContactRawJson,
  ConversationMedia,
  CSAMReportEntry,
  Contact,
  isOfflineContactTask,
  isTwilioTask,
} from '../types/types';
import { saveContactToExternalBackend } from '../dualWrite';
import { getNumberFromTask } from '../utils';
import { ContactMetadata } from '../states/contacts/types';
import {
  ExternalRecordingInfoSuccess,
  getExternalRecordingInfo,
  isFailureExternalRecordingInfo,
  shouldGetExternalRecordingInfo,
} from './getExternalRecordingInfo';
import { SearchParams } from '../states/search/types';
import { ChannelTypes } from '../states/DomainConstants';
import { ResourceReferral } from '../states/contacts/resourceReferral';
import { ContactDraftChanges } from '../states/contacts/existingContacts';
import { newContactState } from '../states/contacts/contactState';
import { ApiError, FetchOptions } from './fetchApi';

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

  const rawResult = await fetchHrmApi(`/contacts/search${queryParams}`, options);

  return {
    ...rawResult,
    contacts: transformSearchAPIContactToContact(rawResult.contacts),
  };
}

// Represents contacts in the format returned by the search contacts API.
// TODO: Remove this once this API is aligned with the standard contact format
type SearchAPIContact = {
  contactId: string;
  overview: {
    helpline: string;
    dateTime: string;
    name: string;
    customerNumber: string;
    callType: CallTypes | '';
    categories: {};
    counselor: string;
    notes: string;
    channel: ChannelTypes | 'default';
    conversationDuration: number;
    createdBy: string;
    taskId: string;
    updatedBy?: string;
    updatedAt?: string;
  };
  details: ContactRawJson;
  csamReports: CSAMReportEntry[];
  referrals?: ResourceReferral[];
};
/**
 * This function converts contacts returned by /searchContacts into pure HRM Contacts.
 * This function is meant to be temporary, while HRM is not updated yet.
 */
const transformSearchAPIContactToContact = (contacts: SearchAPIContact[] | Contact[]): Partial<Contact>[] => {
  const isSearchAPIContact = contact => contact.contactId !== undefined;
  const shouldTransform = contacts.length > 0 && isSearchAPIContact(contacts[0]);

  if (!shouldTransform) {
    return contacts as Contact[];
  }

  /**
   * Fields that cannot be mapped:
   * - accountSid
   * - createdAt
   * - queueName
   * - channelSid
   * - serviceSid
   */
  return contacts.map(contact => {
    const { categories, ...caseInformation } = contact.details?.caseInformation ?? {};
    return {
      id: contact.contactId,
      twilioWorkerId: contact.overview.counselor,
      number: contact.overview.customerNumber,
      conversationDuration: contact.overview.conversationDuration,
      csamReports: contact.csamReports,
      referrals: contact.referrals,
      conversationMedia: contact.conversationMedia,
      createdBy: contact.overview.createdBy,
      helpline: contact.overview.helpline,
      taskId: contact.overview.taskId,
      channel: contact.overview.channel,
      updatedBy: contact.overview.updatedBy,
      updatedAt: contact.overview.updatedAt,
      rawJson: {
        ...contact.details,
        categories: {
          ...contact.overview.categories,
          ...contact.details.categories,
        },
        caseInformation,
      },
      timeOfContact: contact.overview.dateTime,
    };
  });
};

// @VisibleForTesting
// TODO: Remove this once the API is aligned with the type we use in the front end
export function transformCategories(
  helpline,
  categories: ContactRawJson['categories'],
  definition: DefinitionVersion,
): Record<string, Record<string, boolean>> {
  const definitionCategories = definition.tabbedForms.IssueCategorizationTab(helpline);
  // Expand a full set of categories with all subcategories set to false
  const emptyCategoryList = Object.entries(definitionCategories).map(([category, { subcategories }]) => {
    const subcategoryChecklist = subcategories.map<[string, boolean]>(({ label }) => [
      label,
      (categories[category] ?? []).includes(label),
    ]);
    return [category, Object.fromEntries(subcategoryChecklist)];
  });
  const expandedCategories = Object.fromEntries(emptyCategoryList);

  // Merge the empty categories with the ones that have been set
  Object.entries(categories).forEach(([category, subcategories]) => {
    expandedCategories[category] = expandedCategories[category] ?? {};
    subcategories.forEach(subcategory => {
      expandedCategories[category][subcategory] = true;
    });
  });

  return expandedCategories;
}

type HandleTwilioTaskResponse = {
  channelSid?: string;
  serviceSid?: string;
  conversationMedia: ConversationMedia[];
  externalRecordingInfo?: ExternalRecordingInfoSuccess;
};

export const handleTwilioTask = async (task): Promise<HandleTwilioTaskResponse> => {
  const returnData: HandleTwilioTaskResponse = {
    conversationMedia: [],
  };

  if (!isTwilioTask(task)) {
    return returnData;
  }

  if (TaskHelper.isChatBasedTask(task)) {
    returnData.channelSid = task.attributes.channelSid;
    returnData.serviceSid = getHrmConfig().chatServiceSid;

    // Store a pending transcript
    returnData.conversationMedia.push({
      storeType: 'S3',
      storeTypeSpecificData: {
        type: 'transcript',
        location: undefined,
      },
    });
  }

  if (TaskHelper.isChatBasedTask(task) || TaskHelper.isCallTask(task)) {
    // Store reservation sid to use Twilio insights overlay (recordings/transcript)
    returnData.conversationMedia.push({
      storeType: 'twilio',
      storeTypeSpecificData: {
        reservationSid: task.sid,
      },
    });
  }

  if (!shouldGetExternalRecordingInfo(task)) return returnData;

  const externalRecordingInfo = await getExternalRecordingInfo(task);
  if (isFailureExternalRecordingInfo(externalRecordingInfo)) {
    throw new Error(`Error getting external recording info: ${externalRecordingInfo.error}`);
  }

  returnData.externalRecordingInfo = externalRecordingInfo;
  const { bucket, key } = externalRecordingInfo;
  returnData.conversationMedia.push({
    storeType: 'S3',
    storeTypeSpecificData: {
      type: 'recording',
      location: {
        bucket,
        key,
      },
    },
  });

  return returnData;
};

type SaveContactToHrmResponse = {
  response: Contact;
  externalRecordingInfo?: ExternalRecordingInfoSuccess;
};

export const createContact = async (contact: Contact, twilioWorkerId: string, taskSid: string): Promise<Contact> => {
  const { definitionVersion } = getHrmConfig();
  const contactForApi = {
    ...contact,
    rawJson: {
      definitionVersion,
      ...contact.rawJson,
    },
    twilioWorkerId,
    taskId: taskSid,
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(contactForApi),
  };

  return fetchHrmApi(`/contacts?finalize=false`, options);
};

export const updateContactInHrm = (
  contactId: string,
  body: ContactDraftChanges,
  finalize: boolean = false,
): Promise<Contact> => {
  const options = {
    method: 'PATCH',
    body: JSON.stringify(body),
  };

  return fetchHrmApi(`/contacts/${contactId}?finalize=${finalize}`, options);
};

/**
 * Function that saves the form to Contacts table.
 * If you don't intend to complete the twilio task, set shouldFillEndMillis=false
 */
const saveContactToHrm = async (
  task,
  contact: Contact,
  metadata: ContactMetadata,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
): Promise<SaveContactToHrmResponse> => {
  // if we got this far, we assume the form is valid and ready to submit
  const metadataForDuration = shouldFillEndMillis ? fillEndMillis(metadata) : metadata;
  const conversationDuration = getConversationDuration(task, metadataForDuration);
  const { callType } = contact.rawJson;
  const number = getNumberFromTask(task);

  let form = contact.rawJson;
  const { currentDefinitionVersion } = getDefinitionVersions();

  if (!currentDefinitionVersion) {
    throw new Error('Cannot save the form if the current form definitions are not loaded');
  }

  if (isNonDataCallType(callType)) {
    const newContactWithMetaData = newContactState(currentDefinitionVersion)(false);
    form = {
      ...newContactWithMetaData.savedContact.rawJson,
      callType,
      ...(isOfflineContactTask(task) && {
        contactlessTask: contact.rawJson.contactlessTask,
      }),
    };
  }

  // If isOfflineContactTask, send the target Sid as twilioWorkerId value and store workerSid (issuer) in rawForm
  const twilioWorkerId = isOfflineContactTask(task) ? form.contactlessTask.createdOnBehalfOf : workerSid;

  // This might change if isNonDataCallType, that's why we use rawForm
  const timeOfContact = new Date(getDateTime(form.contactlessTask)).toISOString();

  const { conversationMedia, channelSid, serviceSid, externalRecordingInfo } = await handleTwilioTask(task);

  await saveConversationMedia(contact.id, conversationMedia);

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
    channel: task.channelType,
    number,
    conversationDuration,
    timeOfContact,
    taskId: uniqueIdentifier,
    channelSid,
    serviceSid,
  };

  const response = await updateContactInHrm(contact.id, contactToSave, true);

  return {
    response,
    externalRecordingInfo,
  };
};

export const updateContactsFormInHrm = async (contactId: string, body: Partial<ContactRawJson>): Promise<Contact> => {
  const { definitionVersion } = getHrmConfig();
  return updateContactInHrm(contactId, { rawJson: { definitionVersion, ...body } });
};

export const saveContact = async (
  task,
  contact: Contact,
  metadata: ContactMetadata,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
) => {
  const payloads = await saveContactToHrm(task, contact, metadata, workerSid, uniqueIdentifier, shouldFillEndMillis);

  // TODO: add catch clause to handle saving to Sync Doc
  try {
    await saveContactToExternalBackend(task, payloads.response);
  } catch (err) {
    console.error(
      `Saving task with sid ${task.taskSid} failed, presumably the attempt to add it to the pending store also failed so this data is likely lost`,
      err,
    );
  }
  return {
    contact: payloads.response,
    externalRecordingInfo: payloads.externalRecordingInfo,
  };
};

export async function connectToCase(contactId: string, caseId: number) {
  const body = { caseId };

  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  return fetchHrmApi(`/contacts/${contactId}/connectToCase`, options);
}

async function saveConversationMedia(contactId, conversationMedia: ConversationMedia[]) {
  const options = {
    method: 'POST',
    body: JSON.stringify(conversationMedia),
  };

  return fetchHrmApi(`/contacts/${contactId}/conversationMedia`, options);
}

export const getContactByTaskSid = async (taskSid: string): Promise<Contact> => {
  const options: FetchOptions = {
    method: 'GET',
    returnNullFor404: true,
  };
  try {
    return fetchHrmApi(`/contacts/byTaskSid/${taskSid}`, options);
  } catch (err) {
    if (err instanceof ApiError && err.response.status >= 404) {
      return null;
    }
    throw err;
  }
};
