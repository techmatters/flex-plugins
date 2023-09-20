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

import { forExistingContact, forTask } from '../../../states/contacts/issueCategorizationStateApi';
import { CustomITask } from '../../../types/types';
import { contactFormsBase, namespace, RootState } from '../../../states';
import * as taskActions from '../../../states/contacts/actions';
import { toggleSubcategoryForTask, toggleSubcategory } from '../../../states/contacts/categories';
import * as existingContactActions from '../../../states/contacts/existingContacts';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { RecursivePartial } from '../../RecursivePartial';

describe('forTask', () => {
  const api = forTask(<CustomITask>{ taskSid: 'mock task' });
  test('retrieveState - Returns contact from the tasks area of the state', () => {
    const mockCategories = { gridView: true, expanded: {} };
    const selectedCategories = { category1: ['subcategory1'] };
    const retrieved = api.retrieveState(<any>{
      [namespace]: {
        [contactFormsBase]: {
          tasks: {
            'mock task': {
              metadata: { categories: mockCategories },
              contact: {
                ...VALID_EMPTY_CONTACT,
                rawJson: { ...VALID_EMPTY_CONTACT.rawJson, categories: selectedCategories },
              },
            },
          },
        },
      },
    });
    expect(retrieved).toStrictEqual({ ...mockCategories, selectedCategories });
  });
  test('toggleCategoryExpandedActionDispatcher - dispatches an task expand action with the category & task ID', () => {
    const mockDispatcher = jest.fn();
    api.toggleCategoryExpandedActionDispatcher(mockDispatcher)('a category');
    expect(mockDispatcher).toHaveBeenCalledWith(taskActions.handleExpandCategory('a category', 'mock task'));
  });
  test('setGridViewActionDispatcher - dispatches an task setGridView action with the category & task ID', () => {
    const mockDispatcher = jest.fn();
    api.setGridViewActionDispatcher(mockDispatcher)(true);
    expect(mockDispatcher).toHaveBeenCalledWith(taskActions.setCategoriesGridView(true, 'mock task'));
  });
  test('toggleSubcategoryActionDispatcher - dispatches a toggle category action with the task ID', () => {
    const mockDispatcher = jest.fn();

    api.toggleSubcategoryActionDispatcher(mockDispatcher)('category1', 'subcategory2');
    expect(mockDispatcher).toHaveBeenCalledWith(toggleSubcategoryForTask('mock task', 'category1', 'subcategory2'));
  });
});

describe('forExistingCategory', () => {
  const MOCK_CONTACT_ID = 'mock contact';
  const api = forExistingContact(MOCK_CONTACT_ID);
  test('retrieveState - Returns contact from the existing contacts area of the state', () => {
    const mockCategories = { gridView: true, expanded: {} };
    const mockState: RecursivePartial<RootState> = {
      [namespace]: {
        [contactFormsBase]: {
          existingContacts: {
            [MOCK_CONTACT_ID]: {
              categories: mockCategories,
              draftContact: { rawJson: { categories: { category1: ['subcategory1'] } } },
            },
          },
        },
      },
    };
    const retrieved = api.retrieveState(mockState as any);
    expect(retrieved).toStrictEqual({ ...mockCategories, selectedCategories: { category1: ['subcategory1'] } });
  });
  test('toggleCategoryExpandedActionDispatcher - dispatches an existing contact expand action with the category & task ID', () => {
    const mockDispatcher = jest.fn();
    api.toggleCategoryExpandedActionDispatcher(mockDispatcher)('a category');
    expect(mockDispatcher).toHaveBeenCalledWith(
      existingContactActions.toggleCategoryExpanded(MOCK_CONTACT_ID, 'a category'),
    );
  });
  test('setGridViewActionDispatcher - dispatches an task setGridView action with the category & contact ID', () => {
    const mockDispatcher = jest.fn();
    api.setGridViewActionDispatcher(mockDispatcher)(true);
    expect(mockDispatcher).toHaveBeenCalledWith(existingContactActions.setCategoriesGridView(MOCK_CONTACT_ID, true));
  });

  test('toggleSubcategoryActionDispatcher - dispatches a toggle category action with the contact ID', () => {
    const mockDispatcher = jest.fn();

    api.toggleSubcategoryActionDispatcher(mockDispatcher)('category1', 'subcategory2');
    expect(mockDispatcher).toHaveBeenCalledWith(toggleSubcategory(MOCK_CONTACT_ID, 'category1', 'subcategory2'));
  });
});
