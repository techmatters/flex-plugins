import { reduce, initialState } from '../../../states/routing/reducer';
import * as actions from '../../../states/routing/actions';
import * as GeneralActions from '../../../states/actions';
import { standaloneTaskSid } from '../../../components/StandaloneSearch';

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
    };

    const result1 = reduce(state, actions.changeRoute({ route: 'new-case' }, task.taskSid));

    state = result1;

    const result2 = reduce(state, GeneralActions.recreateContactState(voidDefinitions)(task.taskSid));
    expect(result2).toStrictEqual(expected);

    state = result2;
  });
});
