import * as types from '../../states/types';
import * as actions from '../../states/actions';

const task = { taskSid: 'task1' };

describe('test action creators', () => {
  test('initializeContactState', async () => {
    const expected: types.GeneralActionType = {
      type: types.INITIALIZE_CONTACT_STATE,
      taskId: task.taskSid,
    };

    expect(actions.initializeContactState(task.taskSid)).toStrictEqual(expected);
  });

  test('removeContactState', async () => {
    const expected: types.GeneralActionType = {
      type: types.REMOVE_CONTACT_STATE,
      taskId: task.taskSid,
    };

    expect(actions.removeContactState(task.taskSid)).toStrictEqual(expected);
  });
});
