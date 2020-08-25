import * as types from '../../../states/routing/types';
import * as actions from '../../../states/routing/actions';

const task = { taskSid: 'task1' };

describe('test action creators', () => {
  test('changeRoute (new-case route)', async () => {
    expect(actions.changeRoute({ route: 'new-case' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'new-case' },
      taskId: task.taskSid,
    });

    expect(actions.changeRoute({ route: 'new-case', subroute: 'add-note' }, task.taskSid)).toStrictEqual({
      type: types.CHANGE_ROUTE,
      routing: { route: 'new-case', subroute: 'add-note' },
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
});
