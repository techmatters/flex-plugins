/* eslint-disable sonarjs/prefer-immediate-return */
import { set } from 'lodash/fp';
import { TaskHelper } from '@twilio/flex-ui';
import type { CategoriesDefinition, CategoryEntry, FormDefinition, FormItemDefinition } from 'hrm-form-definitions';

import { createNewTaskEntry, TaskEntry } from '../states/contacts/reducer';
import { isNonDataCallType } from '../states/ValidationRules';
import { fillEndMillis, getConversationDuration } from '../utils/conversationDuration';
import { getLimitAndOffsetParams } from './PaginationParams';
import fetchHrmApi from './fetchHrmApi';
import { getDateTime } from '../utils/helpers';
import { getConfig, getDefinitionVersions } from '../HrmFormPlugin';
import {
  ContactRawJson,
  InformationObject,
  isOfflineContactTask,
  isTwilioTask,
  SearchContactResult,
} from '../types/types';
import { saveContactToExternalBackend } from '../dualWrite';
import { getNumberFromTask } from '../utils/task';

/**
 * Un-nests the information (caller/child) as it comes from DB, to match the form structure
 * @param e the current form definition item
 * @param obj the object where we want to lookup for above item
 */
export const unNestInformation = (e: FormItemDefinition, obj: InformationObject) =>
  ['firstName', 'lastName'].includes(e.name) ? obj.name[e.name] : obj[e.name];

const nestName = (information: { firstName: string; lastName: string }) => {
  const { firstName, lastName, ...rest } = information;
  return { ...rest, name: { firstName, lastName } };
};

const unNestInformationObject = (
  def: FormDefinition,
  obj: InformationObject,
): TaskEntry['childInformation'] | TaskEntry['callerInformation'] =>
  def.reduce((acc, e) => ({ ...acc, [e.name]: unNestInformation(e, obj) }), {});

export async function searchContacts(searchParams, limit, offset): Promise<SearchContactResult> {
  const queryParams = getLimitAndOffsetParams(limit, offset);

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const responseJson = await fetchHrmApi(`/contacts/search${queryParams}`, options);

  return responseJson;
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
  def.reduce((acc, e) => ({ ...acc, [e.name]: transformValue(e)(values[e.name]) }), {});

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

export function transformCategories(helpline, categories: TaskEntry['categories']) {
  const { IssueCategorizationTab } = getDefinitionVersions().currentDefinitionVersion.tabbedForms;
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
export function transformForm(form: TaskEntry): ContactRawJson {
  const { callType, metadata, contactlessTask } = form;
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

  const transformed = {
    definitionVersion,
    callType,
    callerInformation,
    childInformation,
    caseInformation: {
      ...transformedValues.caseInformation,
      categories,
    },
    contactlessTask,
  };

  return transformed;
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
  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */
  const formToSend = transformForm(rawForm);

  let channelSid;
  let serviceSid;

  if (isTwilioTask(task) && TaskHelper.isChatBasedTask(task)) {
    ({ channelSid } = task.attributes);
    serviceSid = getConfig().chatServiceSid;
  }

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
  } finally {
    return response.responseJson;
  }
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
