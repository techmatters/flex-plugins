import { reduce } from '../../../states/routing/reducer';
import * as types from '../../../states/routing/types';
import * as actions from '../../../states/routing/actions';
import * as GeneralActions from '../../../states/actions';

const task = { taskSid: 'task1' };

describe('test reducer (specific actions)', () => {
  let state = undefined;

  test('should return initial state', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, {});
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle INITIALIZE_CONTACT_STATE', async () => {
    const expected = {
      tasks: {
        task1: { route: 'select-call-type' },
      },
    };

    const result = reduce(state, GeneralActions.initializeContactState(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle CHANGE_ROUTE', async () => {
    const expected = {
      tasks: {
        task1: { route: 'tabbed-forms' },
      },
    };

    const result = reduce(state, actions.changeRoute({ route: 'tabbed-forms' }, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle RECREATE_CONTACT_STATE and recreate it', async () => {
    const expected = {
      tasks: {
        task1: { route: 'select-call-type' },
      },
    };

    const result = reduce(state, GeneralActions.recreateContactState(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle RECREATE_CONTACT_STATE and do nothing', async () => {
    const expected = {
      tasks: {
        task1: { route: 'new-case' },
      },
    };

    const result1 = reduce(state, actions.changeRoute({ route: 'new-case' }, task.taskSid));

    state = result1;

    const result2 = reduce(state, GeneralActions.recreateContactState(task.taskSid));
    expect(result2).toStrictEqual(expected);

    state = result2;
  });
});
