/**
 * TODO(murilo): This file replicates some code from the hrm repo. We should implement
 * a better solution later on.
 */

import { SearchContact } from '../../types/types';
import { getNumberFromTask } from '../../utils';
import { transformForm } from '../../services/ContactService';
import { getConversationDuration } from '../../utils/conversationDuration';

/**
 * @param {string[]} accumulator
 * @param {[string, boolean]} currentValue
 */
const subcatsReducer = (accumulator, [subcat, bool]: [string, boolean]) =>
  bool ? [...accumulator, subcat] : accumulator;

/**
 * @param {{ [category: string]: string[] }} accumulator
 * @param {[string, { [subcategory: string]: boolean }]} currentValue
 */
const catsReducer = (accumulator, [cat, subcats]: [string, Record<string, boolean>]) => {
  const subcatsList = Object.entries(subcats).reduce(subcatsReducer, []);

  if (!subcatsList.length) return accumulator;

  return { ...accumulator, [cat]: subcatsList };
};

/**
 * @param {{ [category: string]: { [subcategory: string]: boolean } }} categories categories object
 * @returns {{ [category: string]: string[] }} returns an object containing each truthy subcategory under the category name
 */
export const retrieveCategories = (categories: Record<string, Record<string, boolean>>): Record<string, string[]> => {
  if (!categories) return {};

  return Object.entries(categories).reduce(catsReducer, {});
};

export const hrmServiceContactToSearchContact = (contact): SearchContact => {
  const dateTime = contact.timeOfContact;

  const name = `${contact.rawJson.childInformation.name.firstName} ${contact.rawJson.childInformation.name.lastName}`;
  const customerNumber = contact.number;
  const { callType, caseInformation } = contact.rawJson;
  const categories = retrieveCategories(caseInformation.categories);
  const notes = caseInformation.callSummary;
  const { conversationDuration, csamReports, createdBy, helpline, channel } = contact;

  return {
    contactId: contact.id,
    overview: {
      helpline,
      dateTime,
      name,
      customerNumber,
      callType,
      categories,
      counselor: contact.twilioWorkerId,
      notes,
      channel,
      conversationDuration,
      createdBy,
    },
    details: contact.rawJson,
    csamReports,
  };
};

export const searchContactToHrmServiceContact = (contact: SearchContact) => {
  const {
    conversationDuration,
    createdBy,
    helpline,
    channel,
    counselor,
    customerNumber,
    dateTime,
  } = contact.overview;
  return {
    id: contact.contactId,
    number: customerNumber,
    rawJson: contact.details,
    csamReports: contact.csamReports,
    timeOfContact: dateTime,
    twilioWorkerId: counselor,
    conversationDuration,
    createdBy,
    helpline,
    channel,
  };
};

export const taskFormToSearchContact = (task, form, date, counselor, temporaryId): SearchContact => {
  const details = transformForm(form);
  const dateTime = date;
  const name = `${details.childInformation.name.firstName} ${details.childInformation.name.lastName}`;
  const customerNumber = getNumberFromTask(task);
  const { callType, caseInformation } = details;
  const categories = retrieveCategories(caseInformation.categories);
  const notes = caseInformation.callSummary as string;
  const { channelType } = task;
  const conversationDuration = getConversationDuration(task, form.metadata);
  const { csamReports, helpline } = form;

  return {
    contactId: temporaryId,
    overview: {
      helpline,
      createdBy: counselor,
      dateTime,
      name,
      customerNumber,
      callType,
      categories,
      counselor,
      notes,
      channel: channelType,
      conversationDuration,
    },
    details,
    csamReports,
  };
};
