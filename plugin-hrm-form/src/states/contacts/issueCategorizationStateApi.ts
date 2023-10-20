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

import { RootState } from '..';
import { setCategoriesGridView, toggleCategoryExpanded } from './existingContacts';
import { toggleSubcategory } from './categories';
import { getUnsavedContact } from './getUnsavedContact';
import { contactFormsBase, namespace } from '../storeNamespaces';

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

export const forExistingContact = (contactId: string): IssueCategorizationStateApi => ({
  retrieveState: state => {
    const { savedContact, draftContact } = state[namespace][contactFormsBase].existingContacts[contactId];
    return {
      ...state[namespace][contactFormsBase].existingContacts[contactId].metadata.categories,
      selectedCategories: getUnsavedContact(savedContact, draftContact).rawJson.categories,
    };
  },
  toggleCategoryExpandedActionDispatcher: dispatch => category => dispatch(toggleCategoryExpanded(contactId, category)),
  setGridViewActionDispatcher: dispatch => useGridView => dispatch(setCategoriesGridView(contactId, useGridView)),
  toggleSubcategoryActionDispatcher: dispatch => (category, subcategory) =>
    dispatch(toggleSubcategory(contactId, category, subcategory)),
});
