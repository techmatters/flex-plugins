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
import {
  DefinitionVersion,
  FormDefinition,
  FormItemDefinition,
  isNonSaveable,
} from 'hrm-form-definitions';

import { createContactWithMetadata } from '../states/contacts/reducer';
import { isNonDataCallType } from '../states/validationRules';
import { getQueryParams } from './PaginationParams';
import { fillEndMillis, getConversationDuration } from '../utils/conversationDuration';
import fetchHrmApi from './fetchHrmApi';
import { getDateTime } from '../utils/helpers';
import { getDefinitionVersions, getHrmConfig } from '../hrmConfig';
import {
  ContactRawJson,
  ConversationMedia,
  HrmServiceContact,
  isOfflineContactTask,
  isTwilioTask,
  SearchAPIContact,
} from '../types/types';
import { saveContactToExternalBackend } from '../dualWrite';
import { getNumberFromTask } from '../utils';
import { ContactMetadata } from '../states/contacts/types';
import {
  ExternalRecordingInfoSuccess,
  ExternalRecordingUnneeded,
  getExternalRecordingInfo,
  isFailureExternalRecordingInfo,
  isSuccessfulExternalRecordingInfo,
} from './getExternalRecordingInfo';

type HrmServiceContactForApi = Omit<HrmServiceContact, 'rawJson'> & {
  rawJson: Omit<ContactRawJson, 'categories' | 'caseInformation'> & {
    caseInformation: Record<string, string | boolean | Record<string, Record<string, boolean>>> & {
      categories: Record<string, Record<string, boolean>>;
    };
  };
};

export async function searchContacts(
  searchParams,
  limit,
  offset,
): Promise<{
  count: number;
  contacts: SearchAPIContact[];
}> {
  const queryParams = getQueryParams({ limit, offset });

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const rawResult = await fetchHrmApi(`/contacts/search${queryParams}`, options);
  return {
    ...rawResult,
    contacts: rawResult.contacts.map(c => {
      const { firstName, lastName } = c.details.childInformation ?? {};
      return {
        ...c,
        overview: {
          ...c.overview,
          name: `${firstName ?? ''} ${lastName ?? ''}`,
        },
      };
    }),
  };
}

const transformValue = (e: FormItemDefinition) => (value: string | boolean | null) => {
  if (e.type === 'mixed-checkbox' && value === 'mixed') return null;

  return value;
};

// TODO: find a place where this is shared, as it's used also in case forms
export const transformValues = (def: FormDefinition) => (values: { [key: string]: string | boolean }) =>
  def.reduce((acc, e) => (isNonSaveable(e) ? acc : { ...acc, [e.name]: transformValue(e)(values[e.name]) }), {});

const deTransformValue = (e: FormItemDefinition) => (value: string | boolean | null) => {
  // de-transform mixed checkbox null DB value to be "mixed"
  if (e.type === 'mixed-checkbox' && value === null) return 'mixed';

  return value;
};

export const searchResultToContactForm = (def: FormDefinition, information: Record<string, string | boolean>) => {
  return def.reduce(
    (acc, e) => ({
      ...acc,
      [e.name]: deTransformValue(e)(information[e.name]),
    }),
    {},
  );
};

export function transformCategories(
  helpline,
  categories: ContactRawJson['categories'],
  definition: DefinitionVersion,
): Record<string, Record<string, boolean>> {
  const { IssueCategorizationTab } = definition.tabbedForms;
  const transformedCategoryList = Object.entries(categories).map(([category, subcategories]) => {
    const subcategoryChecklist = IssueCategorizationTab(helpline)[category].subcategories.map<[string, boolean]>(
      ({ label }) => [label, subcategories.includes(label)],
    );
    return [category, Object.fromEntries(subcategoryChecklist)];
  });

  return Object.fromEntries(transformedCategoryList);
}

/**
 * Transforms the form to be saved as the backend expects it
 * VisibleForTesting
 */
export function transformForm(contact: HrmServiceContact): HrmServiceContactForApi {
  const { rawJson, helpline } = contact;
  const { callType, contactlessTask, conversationMedia, categories: inputCategories } = rawJson;
  const { currentDefinitionVersion } = getDefinitionVersions();
  const { CallerInformationTab, CaseInformationTab, ChildInformationTab } = currentDefinitionVersion.tabbedForms;
  // transform the form values before submit (e.g. "mixed" for 3-way checkbox becomes null)

  const categories = transformCategories(helpline, inputCategories, currentDefinitionVersion);
  const { definitionVersion } = getHrmConfig();

  return {
    ...contact,
    rawJson: {
      ...contact.rawJson,
      callerInformation: transformValues(CallerInformationTab)(rawJson.callerInformation),
      caseInformation: { ...transformValues(CaseInformationTab)(rawJson.caseInformation), categories },
      childInformation: transformValues(ChildInformationTab)(rawJson.childInformation),

      definitionVersion,
      callType,
      contactlessTask,
      conversationMedia,
    },
  };
}

type HandleTwilioTaskResponse = {
  channelSid?: string;
  serviceSid?: string;
  conversationMedia: ConversationMedia[];
  externalRecordingInfo?: ExternalRecordingInfoSuccess | ExternalRecordingUnneeded;
};

const handleTwilioTask = async (task): Promise<HandleTwilioTaskResponse> => {
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
      store: 'S3',
      type: 'transcript',
      location: undefined,
    });
  }

  if (TaskHelper.isChatBasedTask(task) || TaskHelper.isCallTask(task)) {
    // Store reservation sid to use Twilio insights overlay (recordings/transcript)
    returnData.conversationMedia.push({
      store: 'twilio',
      reservationSid: task.sid,
    });
  }

  const externalRecordingInfo = await getExternalRecordingInfo(task);
  if (isFailureExternalRecordingInfo(externalRecordingInfo)) {
    throw new Error(`Error getting external recording info: ${externalRecordingInfo.error}`);
  }

  returnData.externalRecordingInfo = externalRecordingInfo;

  if (isSuccessfulExternalRecordingInfo(externalRecordingInfo)) {
    const { bucket, key } = externalRecordingInfo;
    returnData.conversationMedia.push({
      store: 'S3',
      type: 'recording',
      location: {
        bucket,
        key,
      },
    });
  }

  return returnData;
};

type NewHrmServiceContact = Omit<HrmServiceContactForApi, 'id' | 'updatedAt' | 'updatedBy' | 'createdBy'>;

type SaveContactToHrmResponse = {
  response: HrmServiceContact;
  request: NewHrmServiceContact;
  externalRecordingInfo?: ExternalRecordingInfoSuccess | ExternalRecordingUnneeded;
};
/**
 * Function that saves the form to Contacts table.
 * If you don't intend to complete the twilio task, set shouldFillEndMillis=false
 */
const saveContactToHrm = async (
  task,
  contact: HrmServiceContact,
  metadata: ContactMetadata,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
): Promise<SaveContactToHrmResponse> => {
  // if we got this far, we assume the form is valid and ready to submit
  const form = contact.rawJson;
  const metadataForDuration = shouldFillEndMillis ? fillEndMillis(metadata) : metadata;
  const conversationDuration = getConversationDuration(task, metadataForDuration);
  const { callType } = form;
  const number = getNumberFromTask(task);

  let rawForm = form;
  const reservationSid = task.sid;
  const { currentDefinitionVersion } = getDefinitionVersions();

  if (!currentDefinitionVersion) {
    throw new Error('Cannot save the form if the current form definitions are not loaded');
  }

  if (isNonDataCallType(callType)) {
    const newContactWithMetaData = createContactWithMetadata(currentDefinitionVersion)(false);
    rawForm = {
      ...newContactWithMetaData.contact.rawJson,
      callType: form.callType,
      ...(isOfflineContactTask(task) && {
        contactlessTask: form.contactlessTask,
      }),
      conversationMedia: form.conversationMedia,
    };
  }

  // If isOfflineContactTask, send the target Sid as twilioWorkerId value and store workerSid (issuer) in rawForm
  const twilioWorkerId = isOfflineContactTask(task) ? form.contactlessTask.createdOnBehalfOf : workerSid;

  // This might change if isNonDataCallType, that's why we use rawForm
  const timeOfContact = new Date(getDateTime(rawForm.contactlessTask)).toISOString();

  const { helpline, csamReports, referrals } = contact;
  const { conversationMedia, channelSid, serviceSid, externalRecordingInfo } = await handleTwilioTask(task);

  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */

  const contactToSave: HrmServiceContact = {
    ...contact,
    twilioWorkerId,
    queueName: task.queueName,
    channel: task.channelType,
    number,
    helpline,
    conversationDuration,
    timeOfContact,
    taskId: uniqueIdentifier,
    channelSid,
    serviceSid,
    csamReports,
    referrals,
  };
  const requestBody = transformForm(contactToSave);

  const options = {
    method: 'POST',
    body: JSON.stringify(requestBody),
  };

  const responseJson: HrmServiceContact = await fetchHrmApi(`/contacts`, options);

  return { response: responseJson, request: requestBody, externalRecordingInfo };
};

export const updateContactInHrm = async (
  contactId: string,
  body: {
    rawJson: Partial<Omit<ContactRawJson, 'caseInformation'>> & Partial<ContactRawJson['caseInformation']>;
  },
) => {
  const options = {
    method: 'PATCH',
    body: JSON.stringify(body),
  };

  return fetchHrmApi(`/contacts/${contactId}`, options);
};

export const saveContact = async (
  task,
  contact: HrmServiceContact,
  metadata: ContactMetadata,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
) => {
  const payloads = await saveContactToHrm(task, contact, metadata, workerSid, uniqueIdentifier, shouldFillEndMillis);

  // TODO: add catch clause to handle saving to Sync Doc
  try {
    await saveContactToExternalBackend(task, payloads.request);
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

export async function connectToCase(contactId, caseId) {
  const body = { caseId };

  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  return fetchHrmApi(`/contacts/${contactId}/connectToCase`, options);
}
