import { set } from 'lodash/fp';

import secret from '../private/secret';
import { createNewTaskEntry } from '../states/contacts/reducer';
import { isNonDataCallType } from '../states/ValidationRules';
import { channelTypes } from '../states/DomainConstants';
import { getConversationDuration, fillEndMillis } from '../utils/conversationDuration';
import { getLimitAndOffsetParams } from './PaginationParams';
import fetchHrmApi from './fetchHrmApi';
import { getDateTime } from '../utils/helpers';
import callerFormDefinition from '../formDefinitions/tabbedForms/CallerInformationTab.json';
import caseInfoFormDefinition from '../formDefinitions/tabbedForms/CaseInformationTab.json';
import childFormDefinition from '../formDefinitions/tabbedForms/ChildInformationTab.json';
import categoriesFormDefinition from '../formDefinitions/tabbedForms/IssueCategorizationTab.json';

/**
 * Un-nests the information (caller/child) as it comes from DB, to match the form structure
 * @param {import('../components/common/forms/types').FormItemDefinition} e
 * @param {import('../types/types').ContactRawJson['callerInformation'] | import('../types/types').ContactRawJson['childInformation']} obj
 * @returns {import('../states/contacts/reducer').TaskEntry['callerInformation'] | import('../states/contacts/reducer').TaskEntry['childInformation']}
 */
export const unNestInformation = (e, obj) =>
  ['firstName', 'lastName'].includes(e.name) ? obj.name[e.name] : obj[e.name];

/**
 * @param {{ firstName: string, lastName: string }} information
 */
const nestName = information => {
  const { firstName, lastName, ...rest } = information;
  return { ...rest, name: { firstName, lastName } };
};

/**
 * Un-nests the information (caller/child) as it comes from DB, to match the form structure
 * @param {import('../components/common/forms/types').FormItemDefinition} e
 * @param {import('../types/types').ContactRawJson['callerInformation'] | import('../types/types').ContactRawJson['childInformation']} obj
 * @returns {import('../states/contacts/reducer').TaskEntry['callerInformation'] | import('../states/contacts/reducer').TaskEntry['childInformation']}
 */
export const unNestInformation = (e, obj) =>
  ['firstName', 'lastName'].includes(e.name) ? obj.name[e.name] : obj[e.name];

export async function searchContacts(searchParams, limit, offset) {
  const queryParams = getLimitAndOffsetParams(limit, offset);

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const responseJson = await fetchHrmApi(`/contacts/search${queryParams}`, options);

  return responseJson;
}

export function getNumberFromTask(task) {
  let number;

  if (task.channelType === channelTypes.facebook) {
    number = task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    number = task.defaultFrom.replace('whatsapp:', '');
  } else {
    number = task.defaultFrom;
  }

  return number;
}

// const createCategoriesObject = <T extends {}>(obj: T, [category, { subcategories }]: [string, CategoryEntry]) => ({
const createCategory = (obj, [category, { subcategories }]) => ({
  ...obj,
  [category]: subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory]: false }), {}),
});

export const createCategoriesObject = () => Object.entries(categoriesFormDefinition).reduce(createCategory, {});

/**
 * Transforms the form to be saved as the backend expects it
 * VisibleForTesting
 * @param {import('../states/contacts/reducer').TaskEntry} form
 */
export function transformForm(form) {
  const { callType, metadata, caseInformation, contactlessTask } = form;

  const callerInformation = nestName(form.callerInformation);
  const childInformation = nestName(form.childInformation);

  const categoriesObject = createCategoriesObject();
  const categories = form.categories.reduce((acc, path) => set(path, true, acc), categoriesObject);

  const transformed = {
    definitionVersion: 'v1', // TODO: put this in config (like feature flags)
    callType,
    callerInformation,
    childInformation,
    metadata,
    caseInformation: {
      ...caseInformation,
      categories,
    },
    contactlessTask,
  };

  return transformed;
}

// The tabbed form definitions, used to create new form state.
const definitions = {
  callerFormDefinition,
  caseInfoFormDefinition,
  categoriesFormDefinition,
  childFormDefinition,
};

/**
 * Function that saves the form to Contacts table.
 * If you don't intend to complete the twilio task, set shouldFillEndMillis=false
 *
 * @param  task
 * @param form
 * @param hrmBaseUrl
 * @param workerSid
 * @param helpline
 * @param shouldFillEndMillis
 */
export async function saveToHrm(task, form, hrmBaseUrl, workerSid, helpline, shouldFillEndMillis = true) {
  // if we got this far, we assume the form is valid and ready to submit
  const metadata = shouldFillEndMillis ? fillEndMillis(form.metadata) : form.metadata;
  const conversationDuration = getConversationDuration(task, metadata);
  const { callType } = form;
  const number = getNumberFromTask(task);

  let rawForm = form;

  if (isNonDataCallType(callType)) {
    rawForm = {
      ...createNewTaskEntry(definitions)(false),
      callType: form.callType,
      metadata: form.metadata,
    };
  }

  // This might change if isNonDataCallType, that's why we use rawForm
  const timeOfContact = getDateTime(rawForm.contactlessTask);

  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */
  const formToSend = transformForm(rawForm);

  const body = {
    form: formToSend,
    twilioWorkerId: workerSid,
    queueName: task.queueName,
    channel: task.channelType,
    number,
    helpline,
    conversationDuration,
    timeOfContact,
  };

  const response = await fetch(`${hrmBaseUrl}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = response.error();
    throw error;
  }

  return response.json();
}

export async function connectToCase(hrmBaseUrl, contactId, caseId) {
  const body = { caseId };
  const response = await fetch(`${hrmBaseUrl}/contacts/${contactId}/connectToCase`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = response.error();
    throw error;
  }

  return response.json();
}
