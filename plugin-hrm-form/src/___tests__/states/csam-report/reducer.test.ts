/* eslint-disable sonarjs/no-identical-functions */
import { reduce, initialState, newTaskEntry } from '../../../states/csam-report/reducer';
import * as actions from '../../../states/csam-report/actions';
import * as GeneralActions from '../../../states/actions';

const task = { taskSid: 'task-sid' };
const voidDefinitions = {
  callerFormDefinition: [],
  caseInfoFormDefinition: [],
  categoriesFormDefinition: {},
  childFormDefinition: [],
};

describe('test reducer', () => {
  test('should return initial state', async () => {
    const state = undefined;

    const expected = initialState;

    const result = reduce(state, {});
    expect(result).toStrictEqual(expected);
  });

  test('should handle INITIALIZE_CONTACT_STATE', async () => {
    const state = initialState;

    const expected = {
      tasks: {
        [task.taskSid]: newTaskEntry,
      },
    };

    const result = reduce(state, GeneralActions.initializeContactState(voidDefinitions)(task.taskSid));
    expect(result).toStrictEqual(expected);
  });

  test('should handle RECREATE_CONTACT_STATE', async () => {
    const state = initialState;

    const expected = {
      tasks: {
        [task.taskSid]: newTaskEntry,
      },
    };

    const result1 = reduce(state, GeneralActions.recreateContactState(voidDefinitions)(task.taskSid));
    expect(result1).toStrictEqual(expected);

    // Test idempotence
    const result2 = reduce(state, GeneralActions.recreateContactState(voidDefinitions)(task.taskSid));
    expect(result2).toStrictEqual(result1);
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const state = reduce(initialState, GeneralActions.initializeContactState(voidDefinitions)(task.taskSid));

    expect(state).toStrictEqual({
      tasks: {
        [task.taskSid]: newTaskEntry,
      },
    });

    const expected = initialState;

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid));
    expect(result).toStrictEqual(expected);
  });

  test('should handle UPDATE_FORM', async () => {
    const state = reduce(initialState, GeneralActions.initializeContactState(voidDefinitions)(task.taskSid));

    const expected = {
      ...state,
      tasks: {
        ...state.tasks,
        [task.taskSid]: { ...newTaskEntry, form: { ...newTaskEntry.form, webAddress: 'some-url' } },
      },
    };

    const result = reduce(
      state,
      actions.updateFormAction({ ...newTaskEntry.form, webAddress: 'some-url' }, task.taskSid),
    );

    expect(result).toStrictEqual(expected);
  });

  test('should handle UPDATE_STATUS', async () => {
    const state = reduce(initialState, GeneralActions.initializeContactState(voidDefinitions)(task.taskSid));

    const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
    const expected = {
      ...state,
      tasks: {
        ...state.tasks,
        [task.taskSid]: { ...newTaskEntry, reportStatus },
      },
    };

    const result = reduce(state, actions.updateStatusAction(reportStatus, task.taskSid));

    expect(result).toStrictEqual(expected);
  });

  test('should handle CLEAR_CSAM_REPORT', async () => {
    const state = reduce(initialState, GeneralActions.initializeContactState(voidDefinitions)(task.taskSid));

    expect(state).toStrictEqual({
      tasks: {
        [task.taskSid]: newTaskEntry,
      },
    });

    const expected = {
      ...state,
      tasks: {
        ...state.tasks,
        [task.taskSid]: newTaskEntry,
      },
    };

    const result = reduce(state, actions.clearCSAMReportAction(task.taskSid));

    expect(result).toStrictEqual(expected);
  });
});
