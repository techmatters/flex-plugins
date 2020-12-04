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
      taskId: task.taskSid,
    };

    expect(actions.initializeContactState(voidDefinitions)(task.taskSid)).toStrictEqual(expected);
  });

  test('recreateContactState', async () => {
    const expected: types.GeneralActionType = {
      type: types.RECREATE_CONTACT_STATE,
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
