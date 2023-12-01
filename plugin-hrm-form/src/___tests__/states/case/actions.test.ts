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

import { Case } from '../../../types/types';
import { CaseActionType, SET_CONNECTED_CASE } from '../../../states/case/types';
import * as actions from '../../../states/case/actions';

const task = { taskSid: 'task1' };

describe('test action creators', () => {
  test('setConnectedCase', async () => {
    const connectedCase: Case = {
      accountSid: 'ACxxx',
      id: 1,
      helpline: '',
      status: 'open',
      twilioWorkerId: 'WK123',
      info: null,
      createdAt: '2020-07-31T20:39:37.408Z',
      updatedAt: '2020-07-31T20:39:37.408Z',
      connectedContacts: null,
      categories: {},
    };

    const expectedAction: CaseActionType = {
      type: SET_CONNECTED_CASE,
      connectedCase,
      taskId: task.taskSid,
    };

    expect(actions.setConnectedCase(connectedCase, task.taskSid)).toStrictEqual(expectedAction);
  });
});
