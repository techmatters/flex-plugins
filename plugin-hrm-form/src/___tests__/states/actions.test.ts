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

import * as types from '../../states/types';
import * as actions from '../../states/actions';

const task = { taskSid: 'task1' };

const voidDefinitions = {
  callerFormDefinition: [],
  caseInfoFormDefinition: [],
  categoriesFormDefinition: {},
  childFormDefinition: [],
};

describe('test action creators', () => {
  test('initializeContactState', async () => {
    const expected: types.GeneralActionType = {
      type: types.INITIALIZE_CONTACT_STATE,
      definitions: voidDefinitions,
      taskId: task.taskSid,
    };

    expect(actions.initializeContactState(voidDefinitions)(task.taskSid)).toStrictEqual(expected);
  });

  test('recreateContactState', async () => {
    const expected: types.GeneralActionType = {
      type: types.RECREATE_CONTACT_STATE,
      definitions: voidDefinitions,
      taskId: task.taskSid,
    };

    expect(actions.recreateContactState(voidDefinitions)(task.taskSid)).toStrictEqual(expected);
  });

  test('removeContactState', async () => {
    const expected: types.GeneralActionType = {
      type: types.REMOVE_CONTACT_STATE,
      taskId: task.taskSid,
    };

    expect(actions.removeContactState(task.taskSid)).toStrictEqual(expected);
  });
});
