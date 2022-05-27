import { forExistingContact, forTask } from '../../../states/contacts/issueCategorizationStateApi';
import { CustomITask } from '../../../types/types';
import { contactFormsBase, namespace } from '../../../states';
import * as taskActions from '../../../states/contacts/actions';
import * as existingContactActions from '../../../states/contacts/existingContacts';

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
    const mockCats = { any: 'thing' };
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
  test('updateFormActionDispatcher - dispatches nothing', () => {
    const mockDispatcher = jest.fn();
    api.updateFormActionDispatcher(mockDispatcher)({ going: 'nowhere' });
    expect(mockDispatcher).not.toHaveBeenCalled();
  });
});
