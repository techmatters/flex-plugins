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
import { contactFormsBase, namespace } from '../../../states';
import * as taskActions from '../../../states/contacts/actions';
import * as existingContactActions from '../../../states/contacts/existingContacts';

const mockCats = [
  'categories.category1.subcategory1',
  'categories.category1.subcategory2',
  'categories.category2.subcategory1',
];
describe('forTask', () => {
  const api = forTask(<CustomITask>{ taskSid: 'mock task' });
  test('retrieveState - Returns contact from the tasks area of the state', () => {
    const mockCategories = { gridView: true, expanded: {} };
    const retrieved = api.retrieveState(<any>{
      [namespace]: { [contactFormsBase]: { tasks: { 'mock task': { metadata: { categories: mockCategories } } } } },
    });
    expect(retrieved).toStrictEqual(mockCategories);
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
  test('updateFormActionDispatcher - dispatches an update form action with the task ID', () => {
    const mockDispatcher = jest.fn();

    api.updateFormActionDispatcher(mockDispatcher)(mockCats);
    expect(mockDispatcher).toHaveBeenCalledWith(taskActions.updateForm('mock task', 'categories', mockCats));
  });
});

describe('forExistingCategory', () => {
  const MOCK_CONTACT_ID = 'mock contact';
  const api = forExistingContact(MOCK_CONTACT_ID);
  test('retrieveState - Returns contact from the existing contacts area of the state', () => {
    const mockCategories = { gridView: true, expanded: {} };
    const retrieved = api.retrieveState(<any>{
      [namespace]: { [contactFormsBase]: { existingContacts: { [MOCK_CONTACT_ID]: { categories: mockCategories } } } },
    });
    expect(retrieved).toStrictEqual(mockCategories);
  });
  test('toggleCategoryExpandedActionDispatcher - dispatches an existing contact expand action with the category & task ID', () => {
    const mockDispatcher = jest.fn();
    api.toggleCategoryExpandedActionDispatcher(mockDispatcher)('a category');
    expect(mockDispatcher).toHaveBeenCalledWith(
      existingContactActions.toggleCategoryExpanded(MOCK_CONTACT_ID, 'a category'),
    );
  });
  test('setGridViewActionDispatcher - dispatches an task setGridView action with the category & task ID', () => {
    const mockDispatcher = jest.fn();
    api.setGridViewActionDispatcher(mockDispatcher)(true);
    expect(mockDispatcher).toHaveBeenCalledWith(existingContactActions.setCategoriesGridView(MOCK_CONTACT_ID, true));
  });
  test('updateFormActionDispatcher - dispatches an updated categories draft', () => {
    const mockDispatcher = jest.fn();
    api.updateFormActionDispatcher(mockDispatcher)([
      'categories.category1.subcategory1',
      'categories.category1.subcategory2',
      'categories.category2.subcategory1',
    ]);
    expect(mockDispatcher).toHaveBeenCalledWith(
      existingContactActions.updateDraft(MOCK_CONTACT_ID, {
        rawJson: {
          categories: {
            category1: ['subcategory1', 'subcategory2'],
            category2: ['subcategory1'],
          },
        },
      }),
    );
  });
});
