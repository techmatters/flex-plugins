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
import { setCategoriesGridView, toggleCategoryExpanded, updateDraft } from './existingContacts';

export type IssueCategorizationStateApi = {
  retrieveState: (
    state: RootState,
  ) => {
    gridView: boolean;
    expanded: { [key: string]: boolean };
  };
  toggleCategoryExpandedActionDispatcher: (dispatch: Dispatch<any>) => (category: string) => void;
  setGridViewActionDispatcher: (dispatch: Dispatch<any>) => (useGridView: boolean) => void;
  updateFormActionDispatcher: (dispatch: Dispatch<any>) => (categories: string[]) => void;
};

export const forTask = (task: CustomITask): IssueCategorizationStateApi => ({
  retrieveState: state => state[namespace][contactFormsBase].tasks[task.taskSid].metadata.categories,
  toggleCategoryExpandedActionDispatcher: dispatch => category =>
    dispatch(actions.handleExpandCategory(category, task.taskSid)),
  setGridViewActionDispatcher: dispatch => useGridView =>
    dispatch(actions.setCategoriesGridView(useGridView, task.taskSid)),
  updateFormActionDispatcher: dispatch => categories =>
    dispatch(actions.updateForm(task.taskSid, 'categories', categories)),
});

export const forExistingContact = (contactId: string): IssueCategorizationStateApi => ({
  retrieveState: state => state[namespace][contactFormsBase].existingContacts[contactId].categories,
  toggleCategoryExpandedActionDispatcher: dispatch => category => dispatch(toggleCategoryExpanded(contactId, category)),
  setGridViewActionDispatcher: dispatch => useGridView => dispatch(setCategoriesGridView(contactId, useGridView)),
  updateFormActionDispatcher: dispatch => categories => {
    const draftCategories: Record<string, string[]> = {};
    categories.forEach(c => {
      const [, category, subCategory] = c.split('.');
      draftCategories[category] = [...(draftCategories[category] ?? []), subCategory];
    });
    dispatch(updateDraft(contactId, { overview: { categories: draftCategories } }));
  },
});
