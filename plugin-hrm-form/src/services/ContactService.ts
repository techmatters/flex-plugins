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

/* eslint-disable sonarjs/prefer-immediate-return */
import { set } from 'lodash/fp';
import { TaskHelper } from '@twilio/flex-ui';
import {
  CategoriesDefinition,
  CategoryEntry,
  DefinitionVersion,
  FormDefinition,
  FormItemDefinition,
  isNonSaveable,
} from 'hrm-form-definitions';

import { createNewTaskEntry } from '../states/contacts/reducer';
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
import { TaskEntry } from '../states/contacts/types';
import {
  ExternalRecordingInfoSuccess,
  ExternalRecordingUnneeded,
  getExternalRecordingInfo,
} from './getExternalRecordingInfo';

type NestedInformation = { name?: { firstName: string; lastName: string } };
type LegacyInformationObject = NestedInformation & {
  [key: string]: string | boolean | NestedInformation[keyof NestedInformation]; // having NestedInformation[keyof NestedInformation] makes type looser here because of this https://github.com/microsoft/TypeScript/issues/17867. Possible/future solution https://github.com/microsoft/TypeScript/pull/29317
};

type LegacyContactRawJson = Omit<ContactRawJson, 'callerInformation' | 'childInformation'> & {
  childInformation: LegacyInformationObject;
  callerInformation: LegacyInformationObject;
};

const unNestLegacyInformationObject = (legacy: LegacyInformationObject): Record<string, string | boolean> => {
  const { name, ...rest } = legacy;
  return typeof name === 'object' ? { ...rest, ...name } : (legacy as Record<string, string | boolean>);
};

export const unNestLegacyRawJson = (legacy: LegacyContactRawJson): ContactRawJson => {
  type PartiallyTransformed = Omit<ContactRawJson, 'callerInformation'> & {
    callerInformation: LegacyInformationObject;
  };
  const withFixedChildInformation: PartiallyTransformed = legacy.childInformation
    ? {
        ...legacy,
        childInformation: unNestLegacyInformationObject(legacy.childInformation),
      }
    : (legacy as PartiallyTransformed);
  return withFixedChildInformation.callerInformation
    ? {
        ...withFixedChildInformation,
        callerInformation: unNestLegacyInformationObject(withFixedChildInformation.callerInformation),
      }
    : (withFixedChildInformation as ContactRawJson);
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
      const details = unNestLegacyRawJson(c.details);
      const { firstName, lastName } = details.childInformation ?? {};
      return {
        ...c,
        details,
        overview: {
          ...c.overview,
          name: `${firstName ?? ''} ${lastName ?? ''}`,
        },
      };
    }),
  };
}

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
  categories: TaskEntry['categories'],
  definition: DefinitionVersion,
): Record<string, Record<string, boolean>> {
  const { IssueCategorizationTab } = definition.tabbedForms;
  const cleanCategories = createCategoriesObject(IssueCategorizationTab(helpline));
  const transformedCategories = categories.reduce((acc, path) => set(path, true, acc), {
    categories: cleanCategories, // use an object with categories property so we can reuse the entire path (they look like categories.Category.Subcategory)
  });

  return transformedCategories.categories;
}

/**
 * Transforms the form to be saved as the backend expects it
 * VisibleForTesting
 */
export function transformForm(form: TaskEntry, conversationMedia: ConversationMedia[] = []): ContactRawJson {
  const { callType, contactlessTask } = form;
  const { currentDefinitionVersion } = getDefinitionVersions();
  const { CallerInformationTab, CaseInformationTab, ChildInformationTab } = currentDefinitionVersion.tabbedForms;
  // transform the form values before submit (e.g. "mixed" for 3-way checkbox becomes null)
  const transformedValues = {
    callerInformation: transformValues(CallerInformationTab)(form.callerInformation),
    caseInformation: transformValues(CaseInformationTab)(form.caseInformation),
    childInformation: transformValues(ChildInformationTab)(form.childInformation),
  };

  const { callerInformation } = transformedValues;
  const { childInformation } = transformedValues;

  const categories = transformCategories(form.helpline, form.categories, currentDefinitionVersion);
  const { definitionVersion } = getHrmConfig();

  return {
    definitionVersion,
    callType,
    callerInformation,
    childInformation,
    caseInformation: {
      ...transformedValues.caseInformation,
      categories,
    },
    contactlessTask,
    conversationMedia,
  };
}

const handleTwilioTask = async task => {
  let channelSid: string;
  let serviceSid: string;
  const conversationMedia: ConversationMedia[] = [];

  if (!isTwilioTask(task)) {
    return {
      conversationMedia,
      channelSid,
      serviceSid,
      externalRecordingInfo: undefined,
    };
  }

  if (TaskHelper.isChatBasedTask(task)) {
    ({ channelSid } = task.attributes);
    serviceSid = getHrmConfig().chatServiceSid;

    // Store a pending transcript
    conversationMedia.push({
      store: 'S3',
      type: 'TRANSCRIPT',
      location: undefined,
    });
  }

  if (TaskHelper.isChatBasedTask(task) || TaskHelper.isCallTask(task)) {
    // Store reservation sid to use Twilio insights overlay (recordings/transcript)
    conversationMedia.push({
      store: 'twilio',
      reservationSid: task.sid,
    });
  }

  const externalRecordingInfo = await getExternalRecordingInfo(task);
  if (externalRecordingInfo.status === 'failure') {
    throw new Error(`Error getting external recording info: ${externalRecordingInfo.error}`);
  }

  if (externalRecordingInfo.status === 'success') {
    const { bucket, key, recordingSid } = externalRecordingInfo;
    conversationMedia.push({
      store: 'S3',
      type: 'RECORDING',
      location: {
        bucket,
        key,
      },
    });
  }

  return { conversationMedia, channelSid, serviceSid, externalRecordingInfo };
};

type NewHrmServiceContact = Omit<HrmServiceContact, 'id' | 'updatedAt' | 'updatedBy' | 'createdBy'>;

type HandleTwilioTaskResponse = {
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
  form: TaskEntry,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
): Promise<HandleTwilioTaskResponse> => {
  // if we got this far, we assume the form is valid and ready to submit
  const metadata = shouldFillEndMillis ? fillEndMillis(form.metadata) : form.metadata;
  const conversationDuration = getConversationDuration(task, metadata);
  const { callType } = form;
  const number = getNumberFromTask(task);

  let rawForm = form;
  rawForm.reservationSid = task.sid;
  const { currentDefinitionVersion } = getDefinitionVersions();

  if (!currentDefinitionVersion) {
    throw new Error('Cannot save the form if the current form definitions are not loaded');
  }

  if (isNonDataCallType(callType)) {
    rawForm = {
      ...createNewTaskEntry(currentDefinitionVersion)(false),
      callType: form.callType,
      metadata: form.metadata,
      ...(isOfflineContactTask(task) && {
        contactlessTask: form.contactlessTask,
      }),
    };
  }

  // If isOfflineContactTask, send the target Sid as twilioWorkerId value and store workerSid (issuer) in rawForm
  const twilioWorkerId = isOfflineContactTask(task) ? form.contactlessTask.createdOnBehalfOf : workerSid;

  // This might change if isNonDataCallType, that's why we use rawForm
  const timeOfContact = new Date(getDateTime(rawForm.contactlessTask)).toISOString();

  const { helpline, csamReports, referrals } = form;

  const { conversationMedia, channelSid, serviceSid, externalRecordingInfo } = await handleTwilioTask(task);

  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */
  const formToSend = transformForm(rawForm, conversationMedia);

  const body: NewHrmServiceContact = {
    rawJson: formToSend,
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

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
  };

  const responseJson: HrmServiceContact = await fetchHrmApi(`/contacts`, options);

  return { response: responseJson, request: body, externalRecordingInfo };
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
  form: TaskEntry,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
) => {
  const payloads = await saveContactToHrm(task, form, workerSid, uniqueIdentifier, shouldFillEndMillis);

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
