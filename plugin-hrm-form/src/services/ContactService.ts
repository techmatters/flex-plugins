/* eslint-disable sonarjs/prefer-immediate-return */
import { set } from 'lodash/fp';
import { TaskHelper } from '@twilio/flex-ui';
import type {
  CategoriesDefinition,
  CategoryEntry,
  DefinitionVersion,
  FormDefinition,
  FormItemDefinition,
} from 'hrm-form-definitions';

import { isNonSaveable } from 'hrm-form-definitions';
import { createNewTaskEntry, TaskEntry } from '../states/contacts/reducer';
import { isNonDataCallType } from '../states/ValidationRules';
import { getQueryParams } from './PaginationParams';
import { fillEndMillis, getConversationDuration } from '../utils/conversationDuration';
import fetchHrmApi from './fetchHrmApi';
import { getDateTime } from '../utils/helpers';
import { getConfig, getDefinitionVersions } from '../HrmFormPlugin';
import {
  ContactRawJson,
  ConversationMedia,
  InformationObject,
  isOfflineContactTask,
  isTwilioTask,
  SearchContact,
  SearchContactResult,
} from '../types/types';
import { saveContactToExternalBackend } from '../dualWrite';
import { getNumberFromTask } from '../utils';

/**
 * Un-nests the information (caller/child) as it comes from DB, to match the form structure
 * @param e the current form definition item
 * @param obj the object where we want to lookup for above item
 */
export const unNestInformation = (e: FormItemDefinition, obj: InformationObject) =>
  ['firstName', 'lastName'].includes(e.name) ? obj.name[e.name] : obj[e.name];

const nestName = (information: { firstName: string; lastName: string }): InformationObject => {
  const { firstName, lastName, ...rest } = information;
  return { ...rest, name: { firstName, lastName } };
};

export const unNestInformationObject = (
  def: FormDefinition,
  obj: InformationObject,
): TaskEntry['childInformation'] | TaskEntry['callerInformation'] =>
  def.reduce((acc, e) => ({ ...acc, [e.name]: unNestInformation(e, obj) }), {});

export async function searchContacts(searchParams, limit, offset): Promise<SearchContactResult> {
  const queryParams = getQueryParams({ limit, offset });

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  return fetchHrmApi(`/contacts/search${queryParams}`, options);
}

/**
 * Adds a category with the corresponding subcategories set to false to the provided object (obj)
 */
const createCategory = <T extends {}>(obj: T, [category, { subcategories }]: [string, CategoryEntry]) => ({
  ...obj,
  [category]: subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory]: false }), {}),
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

export const searchResultToContactForm = (def: FormDefinition, obj: InformationObject) => {
  const information = unNestInformationObject(def, obj);

  const deTransformed = def.reduce((acc, e) => ({ ...acc, [e.name]: deTransformValue(e)(information[e.name]) }), {});

  return deTransformed;
};

export function transformCategories(
  helpline,
  categories: TaskEntry['categories'],
  definition: DefinitionVersion | undefined = undefined,
): Record<string, Record<string, boolean>> {
  const def: DefinitionVersion = definition ?? getDefinitionVersions().currentDefinitionVersion;
  const { IssueCategorizationTab } = def.tabbedForms;
  const cleanCategories = createCategoriesObject(IssueCategorizationTab(helpline));
  const transformedCategories = categories.reduce((acc, path) => set(path, true, acc), {
    categories: cleanCategories, // use an object with categories property so we can reuse the entire path (they look like categories.Category.Subcategory)
  });

  return transformedCategories.categories;
}

export const transformContactFormValues = (
  formValues: Record<string, string | boolean>,
  formDefinition: FormDefinition,
): InformationObject => {
  // transform the form values before submit (e.g. "mixed" for 3-way checkbox becomes null)
  const transformedValue = transformValues(formDefinition)(formValues);
  return nestName(<{ firstName: string; lastName: string }>transformedValue);
};

/**
 * Transforms the form to be saved as the backend expects it
 * VisibleForTesting
 */
export function transformForm(form: TaskEntry, conversationMedia: ConversationMedia[] = []): ContactRawJson {
  const { callType, contactlessTask } = form;
  const {
    CallerInformationTab,
    CaseInformationTab,
    ChildInformationTab,
  } = getDefinitionVersions().currentDefinitionVersion.tabbedForms;
  // transform the form values before submit (e.g. "mixed" for 3-way checkbox becomes null)
  const transformedValues = {
    callerInformation: transformValues(CallerInformationTab)(form.callerInformation),
    caseInformation: transformValues(CaseInformationTab)(form.caseInformation),
    childInformation: transformValues(ChildInformationTab)(form.childInformation),
  };

  // @ts-ignore
  const callerInformation = nestName(transformedValues.callerInformation);
  // @ts-ignore
  const childInformation = nestName(transformedValues.childInformation);

  const categories = transformCategories(form.helpline, form.categories);
  const { definitionVersion } = getConfig();

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

/**
 * Function that saves the form to Contacts table.
 * If you don't intend to complete the twilio task, set shouldFillEndMillis=false
 */
const saveContactToHrm = async (
  task,
  form,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
) => {
  // if we got this far, we assume the form is valid and ready to submit
  const metadata = shouldFillEndMillis ? fillEndMillis(form.metadata) : form.metadata;
  const conversationDuration = getConversationDuration(task, metadata);
  const { callType } = form;
  const number = getNumberFromTask(task);

  let rawForm = form;
  rawForm.reservationSid = task.sid;
  const { currentDefinitionVersion } = getDefinitionVersions();

  if (isNonDataCallType(callType)) {
    rawForm = {
      ...createNewTaskEntry(currentDefinitionVersion)(false),
      callType: form.callType,
      metadata: form.metadata,
      ...(isOfflineContactTask(task) && { contactlessTask: form.contactlessTask }),
    };
  }

  // If isOfflineContactTask, send the target Sid as twilioWorkerId value and store workerSid (issuer) in rawForm
  const twilioWorkerId = isOfflineContactTask(task) ? form.contactlessTask.createdOnBehalfOf : workerSid;

  // This might change if isNonDataCallType, that's why we use rawForm
  const timeOfContact = getDateTime(rawForm.contactlessTask);

  const { helpline, csamReports } = form;

  let channelSid;
  let serviceSid;
  const conversationMedia: ConversationMedia[] = [];

  if (isTwilioTask(task)) {
    if (TaskHelper.isChatBasedTask(task)) {
      ({ channelSid } = task.attributes);
      serviceSid = getConfig().chatServiceSid;
    }

    if (TaskHelper.isChatBasedTask(task) || TaskHelper.isCallTask(task)) {
      conversationMedia.push({
        store: 'twilio',
        reservationSid: task.sid,
      });
    }
  }
  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */
  const formToSend = transformForm(rawForm, conversationMedia);

  const body = {
    form: formToSend,
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
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
  };

  const responseJson = await fetchHrmApi(`/contacts`, options);

  return { responseJson, requestPayload: body };
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
  form,
  workerSid: string,
  uniqueIdentifier: string,
  shouldFillEndMillis = true,
) => {
  const response = await saveContactToHrm(task, form, workerSid, uniqueIdentifier, shouldFillEndMillis);

  // TODO: add catch clause to handle saving to Sync Doc
  try {
    await saveContactToExternalBackend(task, response.requestPayload);
  } catch (err) {
    console.error(
      `Saving task with sid ${task.taskSid} failed, presumably the attempt to add it to the pending store also failed so this data is likely lost`,
      err,
    );
  }
  return response.responseJson;
};

export async function connectToCase(contactId, caseId) {
  const body = { caseId };

  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  const responseJson = await fetchHrmApi(`/contacts/${contactId}/connectToCase`, options);

  return responseJson;
}
