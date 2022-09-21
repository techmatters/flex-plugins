import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { reduce } from '../../../states/case/reducer';
import * as actions from '../../../states/case/actions';
import * as GeneralActions from '../../../states/actions';
import { Case } from '../../../types/types';
import { REMOVE_CONTACT_STATE } from '../../../states/types';
import { TemporaryCaseInfo, UPDATE_CASE_CONTACT } from '../../../states/case/types';
import { CaseItemAction } from '../../../states/routing/types';
import { connectedCaseBase, namespace, RootState } from '../../../states';

const task = { taskSid: 'task1' };

describe('test reducer', () => {
  let state = undefined;
  let mockV1;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
  });

  test('should return initial state', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'TEST_TASK_ID',
    });
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should ignore INITIALIZE_CONTACT_STATE', async () => {
    const result = reduce(state, GeneralActions.initializeContactState(mockV1.tabbedForms)(task.taskSid));
    expect(result).toStrictEqual(state);
  });

  test('should handle SET_CONNECTED_CASE', async () => {
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
      childName: '',
    };

    const expected: RootState[typeof namespace][typeof connectedCaseBase] = {
      tasks: {
        task1: { connectedCase, temporaryCaseInfo: null, prevStatus: 'open', caseWorkingCopy: { sections: {} } },
      },
    };

    const result = reduce(state, actions.setConnectedCase(connectedCase, task.taskSid));
    state = result;
    expect(result).toStrictEqual(expected);
  });

  test('should handle REMOVE_CONNECTED_CASE', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, actions.removeConnectedCase(task.taskSid));
    expect(result).toStrictEqual(expected);

    // state = result; no assignment here as we don't want to lose the only task in the state, it will be reused in following tests
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid));
    expect(result).toStrictEqual(expected);

    // state = result; no assignment here as we don't want to lose the only task in the state, it will be reused in following tests
  });

  test('should handle UPDATE_CASE_INFO', async () => {
    const info = { summary: 'Some summary', notes: ['Some note'] };

    const { connectedCase, temporaryCaseInfo, prevStatus } = state.tasks.task1;
    const expected = {
      tasks: {
        task1: {
          connectedCase: { ...connectedCase, info },
          temporaryCaseInfo,
          caseWorkingCopy: { sections: {} },
          prevStatus,
        },
      },
    };

    const result = reduce(state, actions.updateCaseInfo(info, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle UPDATE_TEMP_INFO', async () => {
    const randomTemp: TemporaryCaseInfo = {
      screen: 'caseSummary',
      action: CaseItemAction.Edit,
      info: {
        form: {},
        id: '',
        createdAt: new Date().toISOString(),
        twilioWorkerId: 'TEST_WORKER_ID',
      },
    };

    const { connectedCase, prevStatus } = state.tasks.task1;
    const expected = {
      tasks: { task1: { connectedCase, temporaryCaseInfo: randomTemp, prevStatus, caseWorkingCopy: { sections: {} } } },
    };

    const result = reduce(state, actions.updateTempInfo(randomTemp, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle MARK_CASE_AS_UPDATED', async () => {
    const expected = { tasks: { task1: { ...state.tasks.task1 } } };

    const result = reduce(state, actions.markCaseAsUpdated(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });
  describe('UPDATE_CASE_CONTACT', () => {
    const connectedCase: Case = {
      id: 1,
      helpline: '',
      status: 'open',
      twilioWorkerId: 'WK123',
      info: null,
      createdAt: '2020-07-31T20:39:37.408Z',
      updatedAt: '2020-07-31T20:39:37.408Z',
      categories: {},
      childName: '',
      connectedContacts: [
        {
          id: 'AN ID',
          a: 1,
        },
        {
          id: 'ANOTHER ID',
          b: 2,
        },
      ],
    };
    test('should update a connectedContact for the connectedCase if one with an ID matching the ID for the action contact exists', async () => {
      const expectedConnectedCase: Case = {
        ...connectedCase,
        connectedContacts: [
          {
            id: 'AN ID',
            b: 100,
          },
          {
            id: 'ANOTHER ID',
            b: 2,
          },
        ],
      };
      const expected = {
        tasks: { task1: { ...state.tasks.task1, connectedCase: expectedConnectedCase, caseHasBeenEdited: false } },
      };

      const result = reduce(
        { tasks: { task1: { ...state.tasks.task1, connectedCase, caseHasBeenEdited: false } } },
        {
          type: UPDATE_CASE_CONTACT,
          taskId: task.taskSid,
          contact: {
            id: 'AN ID',
            b: 100,
          },
        },
      );
      expect(result).toStrictEqual(expected);

      state = result;
    });
    test('should do nothing if no connectedContact with an ID matching the one in the action', async () => {
      const startingState = { tasks: { task1: { ...state.tasks.task1, connectedCase, caseHasBeenEdited: false } } };

      const result = reduce(startingState, {
        type: UPDATE_CASE_CONTACT,
        taskId: task.taskSid,
        contact: {
          id: 'NOT AN ID',
          b: 100,
        },
      });
      expect(result).toStrictEqual(startingState);
    });
    test('should do nothing if action contact has no id', async () => {
      const startingState = { tasks: { task1: { ...state.tasks.task1, connectedCase, caseHasBeenEdited: false } } };

      const result = reduce(startingState, {
        type: UPDATE_CASE_CONTACT,
        taskId: task.taskSid,
        contact: {
          b: 100,
        },
      });
      expect(result).toStrictEqual(startingState);
    });

    test('should throw if action contact is missing', async () => {
      const startingState = { tasks: { task1: { ...state.tasks.task1, connectedCase, caseHasBeenEdited: false } } };

      expect(() =>
        reduce(startingState, {
          type: UPDATE_CASE_CONTACT,
          taskId: task.taskSid,
          contact: undefined,
        }),
      ).toThrow();
    });
    test('should add empty connected contacts array if connected case has no connected contacts array', async () => {
      const startingState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            connectedCase: { ...connectedCase, connectedContacts: null },
          },
        },
      };

      const expected = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            connectedCase: { ...connectedCase, connectedContacts: [] },
          },
        },
      };

      const result = reduce(startingState, {
        type: UPDATE_CASE_CONTACT,
        taskId: task.taskSid,
        contact: {
          id: 'AN ID',
          b: 100,
        },
      });

      expect(result).toStrictEqual(expected);
    });
    test('should throw if target taskId has no connected case', async () => {
      const startingState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            connectedCase: undefined,
          },
        },
      };
      expect(() =>
        reduce(startingState, {
          type: UPDATE_CASE_CONTACT,
          taskId: task.taskSid,
          contact: {
            id: 'AN ID',
            b: 101,
          },
        }),
      ).toThrow();
    });
  });
});
