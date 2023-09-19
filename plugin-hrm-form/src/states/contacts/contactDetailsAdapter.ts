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

import { HrmServiceContact } from '../../types/types';
import { getNumberFromTask } from '../../utils';
import { transformForm } from '../../services/ContactService';
import { getConversationDuration } from '../../utils/conversationDuration';

/**
 * TODO(murilo): This file replicates some code from the hrm repo. We should implement
 * a better solution later on.
 */

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

export const taskFormToHrmServiceContact = (
  task,
  form,
  date,
  twilioWorkerId,
  temporaryId,
): Partial<HrmServiceContact> => {
  const rawJson = transformForm(form);
  const timeOfContact = date;
  const number = getNumberFromTask(task);
  const { caseInformation, categories } = rawJson;
  const notes = caseInformation.callSummary as string;
  const { channelType, taskSid } = task;
  const conversationDuration = getConversationDuration(task, form.metadata);
  const { csamReports, helpline, referrals } = form;

  return {
    id: temporaryId,
    twilioWorkerId,
    number,
    conversationDuration,
    csamReports,
    referrals,
    createdBy: twilioWorkerId,
    timeOfContact,
    helpline,
    taskId: taskSid,
    channel: channelType,
    rawJson: {
      ...rawJson,
      caseInformation: {
        ...caseInformation,
        notes,
      },
      categories,
    },
  };
};
