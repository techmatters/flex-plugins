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
