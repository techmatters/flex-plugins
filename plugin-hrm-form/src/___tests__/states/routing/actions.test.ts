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
import { CaseItemAction, ChangeRouteMode } from '../../../states/routing/types';
import * as actions from '../../../states/routing/actions';

const task = { taskSid: 'task1' };

describe('test action creators', () => {
  test('changeRoute (case home route)', async () => {
    expect(actions.changeRoute({ route: 'case', subroute: 'home' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'case', subroute: 'home' },
      taskId: task.taskSid,
      mode: ChangeRouteMode.Push,
    });

    expect(
      actions.changeRoute({ route: 'case', subroute: 'note', action: CaseItemAction.Add }, task.taskSid),
    ).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'case', subroute: 'note', action: CaseItemAction.Add },

      mode: ChangeRouteMode.Push,
      taskId: task.taskSid,
    });
  });

  test('changeRoute (select-call-type route)', async () => {
    expect(actions.changeRoute({ route: 'select-call-type' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'select-call-type' },
      taskId: task.taskSid,
      mode: ChangeRouteMode.Push,
    });
  });

  test('changeRoute (tabbed-forms route)', async () => {
    expect(actions.changeRoute({ route: 'tabbed-forms' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'tabbed-forms' },
      taskId: task.taskSid,
      mode: ChangeRouteMode.Push,
    });
  });

  test('changeRoute (csam-report route)', async () => {
    expect(
      actions.changeRoute(
        { route: 'csam-report', subroute: 'form', previousRoute: { route: 'case', subroute: 'home' } },
        task.taskSid,
      ),
    ).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'csam-report', subroute: 'form', previousRoute: { route: 'case', subroute: 'home' } },
      taskId: task.taskSid,
      mode: ChangeRouteMode.Push,
    });
  });
  test('changeRoute (replace flag set)', async () => {
    expect(
      actions.changeRoute({ route: 'case', subroute: 'home' }, task.taskSid, ChangeRouteMode.Replace),
    ).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'case', subroute: 'home' },
      taskId: task.taskSid,
      mode: ChangeRouteMode.Replace,
    });
  });
});
