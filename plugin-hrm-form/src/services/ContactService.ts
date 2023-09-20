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
import { DefinitionVersion, FormDefinition, FormItemDefinition, isNonSaveable } from 'hrm-form-definitions';

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
  ContactMediaType,
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
import { generateUrl } from './fetchApi';

type ContactRawJsonForApi = Omit<ContactRawJson, 'categories' | 'caseInformation'> & {
  caseInformation: Record<string, string | boolean | Record<string, Record<string, boolean>>> & {
    categories: Record<string, Record<string, boolean>>;
  };
};

type HrmServiceContactForApi = Omit<HrmServiceContact, 'rawJson'> & {
  rawJson: ContactRawJsonForApi;
};

// Temporary compatibility fix to convert Record<strin, <Record<string, boolean>>> to Record<string, string[]> format categories
// TODO: Remove this function when API is updated
export const transformFromApiCategories = (
  apiCategories: Record<string, Record<string, boolean>>,
): Record<string, string[]> => {
  const transformedEntries = Object.entries(apiCategories).map(([category, subcategories]) => {
    return [
      category,
      Object.entries(subcategories)
        .filter(([, flag]) => flag)
        .map(([key]) => key),
    ];
  });
  return Object.fromEntries(transformedEntries);
};

export async function searchContacts(
  searchParams,
  limit,
  offset,
): Promise<{
  count: number;
  contacts: HrmServiceContact[];
}> {
  const queryParams = getQueryParams({ limit, offset });

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const rawResult = await fetchHrmApi(`/contacts/search${queryParams}`, options);

  return {
    ...rawResult,
    contacts: transformToHrmServiceContact(rawResult.contacts),
  };
}

/**
 * This function converts contacts returned by /searchContacts into pure HRM Contacts.
 * This function is meant to be temporary, while HRM is not updated yet.
 */
const transformToHrmServiceContact = (
  contacts: SearchAPIContact[] | HrmServiceContact[],
): Partial<HrmServiceContact>[] => {
  const isSearchAPIContact = contact => contact.contactId !== undefined;
  const shouldTransform = contacts.length > 0 && isSearchAPIContact(contacts[0]);

  if (!shouldTransform) {
    return contacts as HrmServiceContact[];
  }

  /**
   * Fields that cannot be mapped:
   * - accountSid
   * - createdAt
   * - queueName
   * - channelSid
   * - serviceSid
   */
  return contacts.map(contact => ({
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
      categories: contact.details.categories,
      caseInformation: {
        ...contact.details.caseInformation,
        categories: undefined, // Optional: remove categories from caseInformation
      },
    },
    timeOfContact: contact.overview.dateTime,
  }));
};

/**
 * Adds a category with the corresponding subcategories set to false to the provided object (obj)
 */
const createCategory = <T extends {}>(obj: T, [category, { subcategories }]: [string, CategoryEntry]) => ({
  ...obj,
  [category]: subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory.label]: false }), {}),
});

export const createCategoriesObject = (categoriesFormDefinition: CategoriesDefinition) =>
  Object.entries(categoriesFormDefinition).reduce(createCategory, {});

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

/**
 * Transforms the form to be saved as the backend expects it
 * VisibleForTesting
 */
export function transformForm(rawJson: Partial<ContactRawJson>, helpline: string): Partial<ContactRawJsonForApi> {
  const { categories: inputCategories, ...rawJsonWithoutCategories } = rawJson;
  const { currentDefinitionVersion } = getDefinitionVersions();
  // transform the form values before submit (e.g. "mixed" for 3-way checkbox becomes null)
  const apiForm = { ...rawJsonWithoutCategories } as ContactRawJsonForApi;
  const { definitionVersion } = getHrmConfig();

  if (rawJson.categories) {
    const categories = transformCategories(helpline, inputCategories, currentDefinitionVersion);
    apiForm.caseInformation = { ...(apiForm.caseInformation ?? { categories: {} }) };
    apiForm.caseInformation.categories = categories;
  }

  return {
    ...apiForm,

    definitionVersion,
  };
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

  if (!shouldGetExternalRecordingInfo(task)) return returnData;

  const externalRecordingInfo = await getExternalRecordingInfo(task);
  if (isFailureExternalRecordingInfo(externalRecordingInfo)) {
    throw new Error(`Error getting external recording info: ${externalRecordingInfo.error}`);
  }

  returnData.externalRecordingInfo = externalRecordingInfo;
  const { bucket, key } = externalRecordingInfo;
  returnData.conversationMedia.push({
    store: 'S3',
    type: 'recording',
    location: {
      bucket,
      key,
    },
  });

  return returnData;
};

type NewHrmServiceContact = Omit<
  HrmServiceContactForApi,
  'id' | 'accountSid' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'createdBy'
>;

/**
 * Currently we're sending conversationMedia as part of rawJson.
 * But HrmServiceContact has conversationMedia as a top level attribute.
 * This function transforms a HrmServiceContact to the format the backend expects.
 *
 * This adapter is temporary, since we plan on passing conversationMedia as
 * a top level attribute, but it will have a slightly different format.
 */
const adaptConversationMedia = (contact: NewHrmServiceContact) => {
  const { conversationMedia = [], ...rest } = contact;

  return {
    ...rest,
    rawJson: {
      ...rest.rawJson,
      conversationMedia,
    },
  };
};

type SaveContactToHrmResponse = {
  response: HrmServiceContact;
  request: NewHrmServiceContact;
  externalRecordingInfo?: ExternalRecordingInfoSuccess;
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
  const metadataForDuration = shouldFillEndMillis ? fillEndMillis(metadata) : metadata;
  const conversationDuration = getConversationDuration(task, metadataForDuration);
  const { callType } = contact.rawJson;
  const number = getNumberFromTask(task);

  let rawForm = contact.rawJson;
  // const reservationSid = task.sid;
  const { currentDefinitionVersion } = getDefinitionVersions();

  if (!currentDefinitionVersion) {
    throw new Error('Cannot save the form if the current form definitions are not loaded');
  }

  if (isNonDataCallType(callType)) {
    const newContactWithMetaData = createContactWithMetadata(currentDefinitionVersion)(false);
    rawForm = {
      ...newContactWithMetaData.contact.rawJson,
      callType,
      ...(isOfflineContactTask(task) && {
        contactlessTask: contact.rawJson.contactlessTask,
      }),
      conversationMedia: contact.conversationMedia,
    };
  }

  // If isOfflineContactTask, send the target Sid as twilioWorkerId value and store workerSid (issuer) in rawForm
  const twilioWorkerId = isOfflineContactTask(task) ? rawForm.contactlessTask.createdOnBehalfOf : workerSid;

  // This might change if isNonDataCallType, that's why we use rawForm
  const timeOfContact = new Date(getDateTime(rawForm.contactlessTask)).toISOString();

  const { helpline, csamReports, referrals } = contact;
  const { conversationMedia, channelSid, serviceSid, externalRecordingInfo } = await handleTwilioTask(task);

  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */

  const contactToSave: HrmServiceContactForApi = {
    ...contact,
    rawJson: transformForm(rawForm, helpline) as ContactRawJsonForApi,
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
    conversationMedia,
  };

  const body = adaptConversationMedia(contactToSave);

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
  };

  const responseJson: HrmServiceContact = await fetchHrmApi(`/contacts`, options);

  return { response: responseJson, request: contactToSave, externalRecordingInfo };
};

export const updateContactsFormInHrm = async (
  contactId: string,
  body: Partial<ContactRawJson>,
  helpline: string,
): Promise<HrmServiceContact> => {
  const options = {
    method: 'PATCH',
    body: JSON.stringify({ rawJson: transformForm(body, helpline) }),
  };

  const response = await fetchHrmApi(`/contacts/${contactId}`, options);
  const { categories, ...caseInformationWithoutCategories } = response.rawJson.caseInformation;
  return {
    ...response,
    rawJson: {
      ...response.rawJson,
      caseInformation: caseInformationWithoutCategories,
      categories: transformFromApiCategories(categories),
    },
  };
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

export const generateExternalMediaPath = (
  contactId: string,
  mediaType: ContactMediaType,
  bucket: string,
  key: string,
) =>
  `/files/urls?method=getObject&objectType=contact&objectId=${contactId}&fileType=${mediaType}&bucket=${bucket}&key=${key}`;
