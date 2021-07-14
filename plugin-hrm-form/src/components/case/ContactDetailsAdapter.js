/**
 * TODO(murilo): This file replicates some code from the hrm repo. We should implement
 * a better solution later on.
 */

import { transformForm, getNumberFromTask } from '../../services/ContactService';
import { getConversationDuration } from '../../utils/conversationDuration';

/**
 * @param {string[]} accumulator
 * @param {[string, boolean]} currentValue
 */
const subcatsReducer = (accumulator, [subcat, bool]) => (bool ? [...accumulator, subcat] : accumulator);

/**
 * @param {{ [category: string]: string[] }} accumulator
 * @param {[string, { [subcategory: string]: boolean }]} currentValue
 */
const catsReducer = (accumulator, [cat, subcats]) => {
  const subcatsList = Object.entries(subcats).reduce(subcatsReducer, []);

  if (!subcatsList.length) return accumulator;

  return { ...accumulator, [cat]: subcatsList };
};

/**
 * @param {{ [category: string]: { [subcategory: string]: boolean } }} categories categories object
 * @returns {{ [category: string]: string[] }} returns an object containing each truthy subcategory under the category name
 */
export const retrieveCategories = categories => {
  if (!categories) return {};

  return Object.entries(categories).reduce(catsReducer, {});
};

export const adaptContactToDetailsScreen = (contact, counselorName) => {
  const dateTime = contact.timeOfContact;
  const name = `${contact.rawJson.childInformation.name.firstName} ${contact.rawJson.childInformation.name.lastName}`;
  const customerNumber = contact.number;
  const { callType, caseInformation } = contact.rawJson;
  const categories = retrieveCategories(caseInformation.categories);
  const notes = caseInformation.callSummary;
  const channelType = contact.channel;
  const { conversationDuration } = contact;
  const counselor = counselorName;

  return {
    overview: {
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
    counselor,
    details: contact.rawJson,
  };
};

export const adaptFormToContactDetails = (task, helpline, form, date, counselor) => {
  const details = transformForm(helpline, form);
  const dateTime = date;
  const name = `${details.childInformation.name.firstName} ${details.childInformation.name.lastName}`;
  const customerNumber = getNumberFromTask(task);
  const { callType, caseInformation } = details;
  const categories = retrieveCategories(caseInformation.categories);
  const notes = caseInformation.callSummary;
  const { channelType } = task;
  const conversationDuration = getConversationDuration(task, form.metadata);

  return {
    overview: {
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
    counselor,
    details,
  };
};
