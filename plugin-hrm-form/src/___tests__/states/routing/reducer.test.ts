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

import { DefinitionVersion, DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse, mockPartialConfiguration } from '../../mockGetConfig';
import { getDefinitionVersions } from '../../../hrmConfig';
import { reduce, initialState, newTaskEntry } from '../../../states/routing/reducer';
import * as actions from '../../../states/routing/actions';
import * as GeneralActions from '../../../states/actions';
import { standaloneTaskSid } from '../../../types/types';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';
import {
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
} from '../../../states/contacts/types';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

const task = { taskSid: 'task1' };

const offlineContactTaskSid = 'offline-contact-task-workerSid';
mockPartialConfiguration({ workerSid: 'workerSid' });

let mockV1: DefinitionVersion;

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

beforeEach(() => {
  mockReset();
});

describe('test reducer (specific actions)', () => {
  let state = undefined;

  test('should return initial state', async () => {
    const expected = initialState;

    const result = reduce(state, {} as any);
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle CREATE_CONTACT_ACTION_FULFILLED', async () => {
    const expected = {
      tasks: {
        task1: { route: 'tabbed-forms', subroute: 'childInformation' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(state, {
      type: CREATE_CONTACT_ACTION_FULFILLED,
      payload: {
        contact: {
          ...VALID_EMPTY_CONTACT,
          taskId: task.taskSid,
        },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle CHANGE_ROUTE', async () => {
    const expected = {
      tasks: {
        task1: { route: 'tabbed-forms' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(state, actions.changeRoute({ route: 'tabbed-forms' }, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const expected = initialState;

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid, ''));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED and recreate the state as loaded', async () => {
    const expected = {
      tasks: {
        task1: { route: 'tabbed-forms', subroute: 'childInformation' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(state, {
      type: LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
      payload: {
        contact: { ...VALID_EMPTY_CONTACT, taskId: task.taskSid },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED and do nothing', async () => {
    const expected = {
      tasks: {
        task1: { route: 'new-case' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result1 = reduce(state, actions.changeRoute({ route: 'new-case' }, task.taskSid));

    state = result1;

    const result2 = reduce(state, {
      type: LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
      payload: {
        contact: { ...VALID_EMPTY_CONTACT, taskId: task.taskSid },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result2).toStrictEqual(expected);

    state = result2;
  });

  test('should handle LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED and change isAddingOfflineContact to true', async () => {
    const expected = {
      tasks: {
        task1: { route: 'new-case' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
        [offlineContactTaskSid]: { ...newTaskEntry, route: 'tabbed-forms', subroute: 'childInformation' },
      },
      isAddingOfflineContact: true,
    };

    const result = reduce(state, {
      type: LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
      payload: {
        contact: { ...VALID_EMPTY_CONTACT, taskId: offlineContactTaskSid },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const expected = {
      tasks: {
        task1: { route: 'new-case' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(state, GeneralActions.removeContactState(offlineContactTaskSid, ''));
    expect(result).toStrictEqual(expected);

    state = result;
  });
});
