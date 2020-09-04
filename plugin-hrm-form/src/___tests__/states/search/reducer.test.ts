import fromentries from 'fromentries';

import * as t from '../../../states/search/types';
import { handleSearchFormChange } from '../../../states/search/actions';
import { SearchContactResult } from '../../../types/types';
import {
  INITIALIZE_CONTACT_STATE,
  RECREATE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  GeneralActionType,
} from '../../../states/types';
import { reduce, newTaskEntry } from '../../../states/search/reducer';

// @ts-ignore
Object.fromEntries = fromentries;

describe('search reducer', () => {
  const initialState = {
    tasks: {},
  };

  const task = { taskSid: 'WT123' };

  let state = null;
  test('INITIALIZE_CONTACT_STATE action (should create a new state)', () => {
    const action: GeneralActionType = {
      type: INITIALIZE_CONTACT_STATE,
      taskId: task.taskSid,
    };

    const result = reduce(initialState, action);

    const { tasks } = result;
    expect(tasks[task.taskSid]).not.toBeUndefined();
    expect(tasks[task.taskSid]).toStrictEqual(newTaskEntry);
  });

  test('RECREATE_CONTACT_STATE action (should recreate the state)', () => {
    const action: GeneralActionType = {
      type: RECREATE_CONTACT_STATE,
      taskId: task.taskSid,
    };

    const result = reduce(initialState, action);

    const { tasks } = result;
    expect(tasks[task.taskSid]).not.toBeUndefined();
    expect(tasks[task.taskSid]).toStrictEqual(newTaskEntry);
    state = result;
  });

  test('RECREATE_CONTACT_STATE action (should do nothing)', () => {
    const action: GeneralActionType = {
      type: RECREATE_CONTACT_STATE,
      taskId: task.taskSid,
    };
    const result1 = reduce(state, handleSearchFormChange(task.taskSid)('firstName', 'one value'));

    const result2 = reduce(result1, action);

    const { tasks } = result2;
    expect(tasks[task.taskSid]).not.toBeUndefined();
    expect(tasks[task.taskSid]).not.toStrictEqual(newTaskEntry);
    expect(tasks[task.taskSid].form.firstName).toBe('one value');

    // state = result2; we don't want to assing this as a new state
  });

  test('REMOVE_CONTACT_STATE action', () => {
    const action: GeneralActionType = { type: REMOVE_CONTACT_STATE, taskId: task.taskSid };
    const result = reduce(state, action);

    const { tasks } = result;
    // Test if childInformation was generated from blank and then copied the values in the search result
    expect(tasks[task.taskSid]).toBeUndefined();
  });

  test('HANDLE_SEARCH_FORM_CHANGE action', () => {
    const action: t.SearchActionType = {
      type: t.HANDLE_SEARCH_FORM_CHANGE,
      taskId: task.taskSid,
      name: 'firstName',
      value: 'Somevalue',
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].form.firstName).toEqual('Somevalue');
    state = result;
  });

  test('CHANGE_SEARCH_PAGE action', () => {
    const action: t.SearchActionType = {
      type: t.CHANGE_SEARCH_PAGE,
      taskId: task.taskSid,
      page: t.SearchPages.results,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].currentPage).toEqual(t.SearchPages.results);
    state = result;
  });

  test('VIEW_CONTACT_DETAILS action', () => {
    const contact: unknown = { contactId: 'fake contact', overview: {}, details: {}, counselor: '', tags: [] };
    const action: t.SearchActionType = {
      type: t.VIEW_CONTACT_DETAILS,
      contact: contact as SearchContactResult, // type casting to avoid writing an entire SearchContactResult
      taskId: task.taskSid,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].currentPage).toEqual(t.SearchPages.details);
    expect(tasks[task.taskSid].currentContact).toEqual(contact);
    state = result;
  });

  test('SEARCH_CONTACTS_REQUEST action', () => {
    expect(state.tasks[task.taskSid].isRequesting).toBeFalsy();
    const action: t.SearchActionType = {
      type: t.SEARCH_CONTACTS_REQUEST,
      taskId: task.taskSid,
    };

    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].isRequesting).toBeTruthy();
  });

  test('SEARCH_CONTACTS_SUCCESS action', () => {
    const searchResult = [
      { contactId: 'fake contact result 1', overview: {}, details: {}, counselor: '' },
      { contactId: 'fake contact result 2', overview: {}, details: {}, counselor: '' },
    ] as t.DetailedSearchResult; // type casting to avoid writing an entire DetailedSearchResult
    const action: t.SearchActionType = {
      type: t.SEARCH_CONTACTS_SUCCESS,
      searchResult,
      taskId: task.taskSid,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].searchResult).toStrictEqual(searchResult);
    state = result;
  });

  test('SEARCH_CONTACTS_FAILURE action', () => {
    const action: t.SearchActionType = { type: t.SEARCH_CONTACTS_FAILURE, error: 'Some error', taskId: task.taskSid };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].error).toBe('Some error');
    state = result;
  });

  test('HANDLE_EXPAND_DETAILS_SECTION action', () => {
    expect(state.tasks[task.taskSid].detailsExpanded[t.ContactDetailsSections.ISSUE_CATEGORIZATION]).toBeFalsy();
    const action: t.SearchActionType = {
      type: t.HANDLE_EXPAND_DETAILS_SECTION,
      section: t.ContactDetailsSections.ISSUE_CATEGORIZATION,
      taskId: task.taskSid,
    };
    const result1 = reduce(state, action);

    expect(result1.tasks[task.taskSid].detailsExpanded[t.ContactDetailsSections.ISSUE_CATEGORIZATION]).toBeTruthy();

    const result2 = reduce(result1, action);

    expect(result2.tasks[task.taskSid].detailsExpanded[t.ContactDetailsSections.ISSUE_CATEGORIZATION]).toBeFalsy();
  });
});
