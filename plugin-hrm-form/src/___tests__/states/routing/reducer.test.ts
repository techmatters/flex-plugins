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

import { reduce, initialState, newTaskEntry } from '../../../states/routing/reducer';
import * as actions from '../../../states/routing/actions';
import * as GeneralActions from '../../../states/actions';
import { offlineContactTaskSid, standaloneTaskSid } from '../../../types/types';

const task = { taskSid: 'task1' };
const voidDefinitions = {
  callerFormDefinition: [],
  caseInfoFormDefinition: [],
  categoriesFormDefinition: {},
  childFormDefinition: [],
};

describe('test reducer (specific actions)', () => {
  let state = undefined;

  test('should return initial state', async () => {
    const expected = initialState;

    const result = reduce(state, {});
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle INITIALIZE_CONTACT_STATE', async () => {
    const expected = {
      tasks: {
        task1: { route: 'select-call-type' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(state, GeneralActions.initializeContactState(voidDefinitions)(task.taskSid));
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

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle RECREATE_CONTACT_STATE and recreate it', async () => {
    const expected = {
      tasks: {
        task1: { route: 'select-call-type' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(state, GeneralActions.recreateContactState(voidDefinitions)(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle RECREATE_CONTACT_STATE and do nothing', async () => {
    const expected = {
      tasks: {
        task1: { route: 'new-case' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result1 = reduce(state, actions.changeRoute({ route: 'new-case' }, task.taskSid));

    state = result1;

    const result2 = reduce(state, GeneralActions.recreateContactState(voidDefinitions)(task.taskSid));
    expect(result2).toStrictEqual(expected);

    state = result2;
  });

  test('should handle RECREATE_CONTACT_STATE and change isAddingOfflineContact to true', async () => {
    const expected = {
      tasks: {
        task1: { route: 'new-case' },
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
        [offlineContactTaskSid]: newTaskEntry,
      },
      isAddingOfflineContact: true,
    };

    const result = reduce(state, GeneralActions.recreateContactState(voidDefinitions)(offlineContactTaskSid));
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

    const result = reduce(state, GeneralActions.removeContactState(offlineContactTaskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });
});
