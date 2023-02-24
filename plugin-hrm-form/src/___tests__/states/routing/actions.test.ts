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

import * as types from '../../../states/routing/types';
import * as actions from '../../../states/routing/actions';
import { AppRoutesWithCase } from '../../../states/routing/types';

const task = { taskSid: 'task1' };

describe('test action creators', () => {
  test('changeRoute (new-case route)', async () => {
    expect(actions.changeRoute({ route: 'new-case' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'new-case' },
      taskId: task.taskSid,
    });

    expect(
      actions.changeRoute({ route: 'new-case', subroute: 'note' } as AppRoutesWithCase, task.taskSid),
    ).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'new-case', subroute: 'note' },
      taskId: task.taskSid,
    });
  });

  test('changeRoute (select-call-type route)', async () => {
    expect(actions.changeRoute({ route: 'select-call-type' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'select-call-type' },
      taskId: task.taskSid,
    });
  });

  test('changeRoute (tabbed-forms route)', async () => {
    expect(actions.changeRoute({ route: 'tabbed-forms' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'tabbed-forms' },
      taskId: task.taskSid,
    });
  });

  test('changeRoute (csam-report route)', async () => {
    expect(
      actions.changeRoute(
        { route: 'csam-report', subroute: 'form', previousRoute: { route: 'new-case' } },
        task.taskSid,
      ),
    ).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'csam-report', subroute: 'form', previousRoute: { route: 'new-case' } },
      taskId: task.taskSid,
    });
  });
});
