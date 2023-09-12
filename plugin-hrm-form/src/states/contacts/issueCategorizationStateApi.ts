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

import { Dispatch } from 'react';

import { CustomITask } from '../../types/types';
import { contactFormsBase, namespace, RootState } from '..';
import * as actions from './actions';
import { setCategoriesGridView, toggleCategoryExpanded } from './existingContacts';
import { toggleSubcategoryForTask, toggleSubcategory } from './categories';

type IssueCategoriesState = {
  gridView: boolean;
  expanded: { [key: string]: boolean };
  selectedCategories: Record<string, string[]>;
};

export type IssueCategorizationStateApi = {
  retrieveState: (state: RootState) => IssueCategoriesState;
  toggleCategoryExpandedActionDispatcher: (dispatch: Dispatch<any>) => (category: string) => void;
  setGridViewActionDispatcher: (dispatch: Dispatch<any>) => (useGridView: boolean) => void;
  toggleSubcategoryActionDispatcher: (dispatch: Dispatch<any>) => (category: string, subcategory: string) => void;
};

export const forTask = (task: CustomITask): IssueCategorizationStateApi => ({
  retrieveState: state => ({
    ...state[namespace][contactFormsBase].tasks[task.taskSid].metadata.categories,
    selectedCategories: state[namespace][contactFormsBase].tasks[task.taskSid].contact.rawJson.categories,
  }),
  toggleCategoryExpandedActionDispatcher: dispatch => category =>
    dispatch(actions.handleExpandCategory(category, task.taskSid)),
  setGridViewActionDispatcher: dispatch => useGridView =>
    dispatch(actions.setCategoriesGridView(useGridView, task.taskSid)),
  toggleSubcategoryActionDispatcher: dispatch => (category, subcategory) =>
    dispatch(toggleSubcategoryForTask(task.taskSid, category, subcategory)),
});

export const forExistingContact = (contactId: string): IssueCategorizationStateApi => ({
  retrieveState: state => ({
    ...state[namespace][contactFormsBase].existingContacts[contactId].categories,
    selectedCategories: state[namespace][contactFormsBase].existingContacts[contactId].draftContact.overview.categories,
  }),
  toggleCategoryExpandedActionDispatcher: dispatch => category => dispatch(toggleCategoryExpanded(contactId, category)),
  setGridViewActionDispatcher: dispatch => useGridView => dispatch(setCategoriesGridView(contactId, useGridView)),
  toggleSubcategoryActionDispatcher: dispatch => (category, subcategory) =>
    dispatch(toggleSubcategory(contactId, category, subcategory)),
});
