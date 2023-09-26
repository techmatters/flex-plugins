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

import { ContactsState } from './types';

// TODO: Move other categories related actions into here once we have got rid of the new / existing contact split
const TOGGLE_SUBCATEGORY = 'TOGGLE_SUBCATEGORY';

type ToggleSubcategoryAction = {
  type: typeof TOGGLE_SUBCATEGORY;
  contactId: string;
  category: string;
  subcategory: string;
};

export const toggleSubcategory = (contactId: string, category: string, subcategory: string) => ({
  type: TOGGLE_SUBCATEGORY,
  contactId,
  category,
  subcategory,
});

const TOGGLE_TASK_SUBCATEGORY = 'TOGGLE_TASK_SUBCATEGORY';

type ToggleTaskSubcategoryAction = {
  type: typeof TOGGLE_TASK_SUBCATEGORY;
  category: string;
  subcategory: string;
  taskId: string;
};

export const toggleSubcategoryForTask = (taskId: string, category: string, subcategory: string) => ({
  type: TOGGLE_TASK_SUBCATEGORY,
  taskId,
  category,
  subcategory,
});

export type ContactCategoryAction = ToggleSubcategoryAction | ToggleTaskSubcategoryAction;

const toggleSubcategoryState = (currentSubcategories: string[], selectedSubcategory: string) => {
  const subcategoriesWithoutSelection = currentSubcategories.filter(subcategory => subcategory !== selectedSubcategory);
  // If filtering the subcategory from the current selections left the list unchanged, it mustn't have been selected, so add it.
  return subcategoriesWithoutSelection.length === currentSubcategories.length
    ? [...currentSubcategories, selectedSubcategory]
    : subcategoriesWithoutSelection;
};

export function toggleSubCategoriesReducer(state: ContactsState, action: ContactCategoryAction): ContactsState {
  switch (action.type) {
    case TOGGLE_SUBCATEGORY: {
      const currentSubcategories =
        state.existingContacts[action.contactId].draftContact.rawJson.categories[action.category] ?? [];
      const updatedSubcategories = toggleSubcategoryState(currentSubcategories, action.subcategory);
      return {
        ...state,
        existingContacts: {
          ...state.existingContacts,

          [action.contactId]: {
            ...state.existingContacts[action.contactId],
            draftContact: {
              ...state.existingContacts[action.contactId].draftContact,
              rawJson: {
                ...state.existingContacts[action.contactId].draftContact.rawJson,
                categories: {
                  ...state.existingContacts[action.contactId].draftContact.rawJson.categories,
                  [action.category]: updatedSubcategories,
                },
              },
            },
          },
        },
      };
    }
    case TOGGLE_TASK_SUBCATEGORY: {
      const currentTaskSubcategories = state.tasks[action.taskId].contact.rawJson.categories[action.category] ?? [];
      const updatedTaskSubcategories = toggleSubcategoryState(currentTaskSubcategories, action.subcategory);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            contact: {
              ...state.tasks[action.taskId].contact,
              rawJson: {
                ...state.tasks[action.taskId].contact.rawJson,
                categories: {
                  ...state.tasks[action.taskId].contact.rawJson.categories,
                  [action.category]: updatedTaskSubcategories,
                },
              },
            },
          },
        },
      };
    }
    default:
      return state;
  }
}
