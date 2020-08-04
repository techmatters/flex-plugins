import { reduce } from '../../../states/routing/reducer';
import * as types from '../../../states/routing/types';
import * as actions from '../../../states/routing/actions';

const task = { taskSid: 'task1' };

describe('test reducer', () => {
  let state = undefined;

  test('should return initial state', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, {});
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle CHANGE_ROUTE', async () => {
    const expected = {
      tasks: {
        task1: { routing: { route: 'new-case' } },
      },
    };

    const result = reduce(state, actions.changeRoute({ route: 'new-case' }, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });
});
