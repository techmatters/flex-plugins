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

import fromentries from 'fromentries';

import * as t from '../../../states/search/types';
import { handleSearchFormChange } from '../../../states/search/actions';
import { SearchCaseResult } from '../../../types/types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../../../states/types';
import { newTaskEntry, reduce } from '../../../states/search/reducer';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';
import {
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
} from '../../../states/contacts/types';

jest.mock('../../../components/CSAMReport/CSAMReportFormDefinition');

// @ts-ignore
Object.fromEntries = fromentries;

describe('search reducer', () => {
  const task = { taskSid: 'WT123' };
  const context = '23456';

  const initialState = {
    tasks: {
      [task.taskSid]: {
        [context]: newTaskEntry,
      },
    },
  };

  let state = null;
  test('CREATE_CONTACT_STATE_FULFILLED action (should create a new state)', () => {
    const action: any = {
      type: CREATE_CONTACT_ACTION_FULFILLED,
      payload: {
        metadata: VALID_EMPTY_METADATA,
        reference: 'x',
        contact: {
          ...VALID_EMPTY_CONTACT,
          taskId: task.taskSid,
        },
      },
    };

    const result = reduce(initialState, action);

    const { tasks } = result;
    expect(tasks[task.taskSid]).not.toBeUndefined();
    expect(tasks[task.taskSid][context]).toStrictEqual(newTaskEntry);
  });

  test('LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED action (should recreate the state)', () => {
    const action: any = {
      type: LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
      payload: {
        reference: 'x',
        contact: {
          ...VALID_EMPTY_CONTACT,
          taskId: task.taskSid,
        },
      },
    };

    const result = reduce(initialState, action);

    const { tasks } = result;
    expect(tasks[task.taskSid]).not.toBeUndefined();
    expect(tasks[task.taskSid][context]).toStrictEqual(newTaskEntry);
    state = result;
  });

  test('LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED action (should do nothing)', () => {
    const action: any = {
      type: LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
      payload: {
        reference: 'x',
        contact: {
          ...VALID_EMPTY_CONTACT,
          taskId: task.taskSid,
        },
      },
    };
    const result1 = reduce(
      { tasks: { [task.taskSid]: { [context]: newTaskEntry } } },
      handleSearchFormChange(task.taskSid, context)('firstName', 'one value'),
    );

    const result2 = reduce(result1, action);

    const { tasks } = result2;
    expect(tasks[task.taskSid]).not.toStrictEqual(newTaskEntry);
    expect(tasks[task.taskSid][context].form.firstName).toBe('one value');

    // state = result2; we don't want to assing this as a new state
  });

  test('REMOVE_CONTACT_STATE action', () => {
    const action: RemoveContactStateAction = { type: REMOVE_CONTACT_STATE, taskId: task.taskSid, contactId: '' };
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
      context,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid][context].form.firstName).toEqual('Somevalue');
    state = result;
  });

  test('SEARCH_CONTACTS_REQUEST action', () => {
    expect(state.tasks[task.taskSid][context].isRequesting).toBeFalsy();
    const action: t.SearchActionType = {
      type: t.SEARCH_CONTACTS_REQUEST,
      taskId: task.taskSid,
      context,
    };

    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid][context].isRequesting).toBeTruthy();
  });

  test('SEARCH_CONTACTS_SUCCESS action', () => {
    const searchResult = {
      count: 2,
      contacts: [
        { ...VALID_EMPTY_CONTACT, id: 'fake contact result 1' },
        { ...VALID_EMPTY_CONTACT, id: 'fake contact result 2' },
      ],
    } as t.DetailedSearchContactsResult; // type casting to avoid writing an entire DetailedSearchContactsResult
    const action: t.SearchActionType = {
      type: t.SEARCH_CONTACTS_SUCCESS,
      searchResult,
      taskId: task.taskSid,
      context,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid][context].searchContactsResult).toStrictEqual({
      count: 2,
      ids: ['fake contact result 1', 'fake contact result 2'],
    });
    state = result;
  });

  test('SEARCH_CONTACTS_FAILURE action', () => {
    const action: t.SearchActionType = {
      type: t.SEARCH_CONTACTS_FAILURE,
      error: 'Some error',
      taskId: task.taskSid,
      context,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid][context].error).toBe('Some error');
    state = result;
  });

  test('SEARCH_CASES_REQUEST action', () => {
    expect(state.tasks[task.taskSid][context].isRequestingCases).toBeFalsy();
    const action: t.SearchActionType = {
      type: t.SEARCH_CASES_REQUEST,
      taskId: task.taskSid,
      context,
    };

    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid][context].isRequestingCases).toBeTruthy();
  });

  test('SEARCH_CASES_SUCCESS action', () => {
    const searchResult = ({
      count: 2,
      cases: [
        {
          id: 'case-1',
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'Maria', lastName: 'Silva' } } }],
          },
        },
        {
          id: 'case-2',
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'John', lastName: 'Doe' } } }],
          },
        },
      ],
    } as unknown) as SearchCaseResult;
    const action: t.SearchActionType = {
      type: t.SEARCH_CASES_SUCCESS,
      searchResult,
      taskId: task.taskSid,
      context,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid][context].searchCasesResult).toStrictEqual({
      count: 2,
      ids: ['case-1', 'case-2'],
    });
    state = result;
  });

  test('SEARCH_CASES_FAILURE action', () => {
    const action: t.SearchActionType = {
      type: t.SEARCH_CASES_FAILURE,
      error: 'Some error',
      taskId: task.taskSid,
      context,
    };
    const result = reduce(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid][context].casesError).toBe('Some error');
    state = result;
  });
});
