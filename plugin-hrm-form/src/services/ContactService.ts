import { set } from 'lodash/fp';
import type { ITask } from '@twilio/flex-ui';

import secret from '../private/secret';
import { createNewTaskEntry, TaskEntry } from '../states/contacts/reducer';
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
import type {
  CategoriesDefinition,
  CategoryEntry,
  FormDefinition,
  FormItemDefinition,
} from '../components/common/forms/types';
import type { InformationObject, ContactRawJson } from '../types/types';

// The tabbed form definitions, used to create new form state.
const definitions = {
  callerFormDefinition: callerFormDefinition as FormDefinition,
  caseInfoFormDefinition: caseInfoFormDefinition as FormDefinition,
  categoriesFormDefinition: categoriesFormDefinition as CategoriesDefinition,
  childFormDefinition: childFormDefinition as FormDefinition,
};

/**
 * Un-nests the information (caller/child) as it comes from DB, to match the form structure
 */
export const unNestInformation = (e: FormItemDefinition, obj: InformationObject) =>
  ['firstName', 'lastName'].includes(e.name) ? obj.name[e.name] : obj[e.name];

const nestName = (information: { firstName: string; lastName: string }) => {
  const { firstName, lastName, ...rest } = information;
  return { ...rest, name: { firstName, lastName } };
};

export async function searchContacts(searchParams, limit, offset) {
  const queryParams = getLimitAndOffsetParams(limit, offset);

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const responseJson = await fetchHrmApi(`/contacts/search${queryParams}`, options);

  return responseJson;
}

export function getNumberFromTask(task: ITask) {
  if (task.channelType === channelTypes.facebook) {
    return task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    return task.defaultFrom.replace('whatsapp:', '');
  }

  return task.defaultFrom;
}

/**
 * Adds a category with the corresponding subcategories set to false to the provided object (obj)
 */
const createCategory = <T extends {}>(obj: T, [category, { subcategories }]: [string, CategoryEntry]) => ({
  ...obj,
  [category]: subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory]: false }), {}),
});

export const createCategoriesObject = () => Object.entries(categoriesFormDefinition).reduce(createCategory, {});

const transformValue = (e: FormItemDefinition) => (value: string | boolean | null) => {
  if (e.type === 'mixed-checkbox' && value === 'mixed') return null;

  return value;
};

const transformValues = (def: FormDefinition) => (
  values: TaskEntry['callerInformation'] | TaskEntry['caseInformation'] | TaskEntry['childInformation'],
) => def.reduce((acc, e) => ({ ...acc, [e.name]: transformValue(e)(values[e.name]) }), {});

export const deTransformValue = (e: FormItemDefinition) => (value: string | boolean | null) => {
  // de-transform mixed checkbox null DB value to be "mixed"
  if (e.type === 'mixed-checkbox' && value === null) return 'mixed';

  return value;
};

/**
 * Transforms the form to be saved as the backend expects it
 * VisibleForTesting
 */
export function transformForm(form: TaskEntry): ContactRawJson {
  const { callType, metadata, caseInformation, contactlessTask } = form;

  // transform the form values before submit (e.g. "mixed" for 3-way checkbox becomes null)
  const transformedValues: TaskEntry = {
    ...form,
    callerInformation: transformValues(definitions.callerFormDefinition)(form.callerInformation),
    caseInformation: transformValues(definitions.caseInfoFormDefinition)(form.caseInformation),
    childInformation: transformValues(definitions.childFormDefinition)(form.childInformation),
  };

  // @ts-ignore
  const callerInformation = nestName(transformedValues.callerInformation);
  // @ts-ignore
  const childInformation = nestName(transformedValues.childInformation);

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
    // @ts-ignore
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
    // @ts-ignore
    const error = response.error();
    throw error;
  }

  return response.json();
}
