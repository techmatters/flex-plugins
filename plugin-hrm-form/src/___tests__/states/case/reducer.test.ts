import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { reduce } from '../../../states/case/reducer';
import * as actions from '../../../states/case/actions';
import * as GeneralActions from '../../../states/actions';
import { Case } from '../../../types/types';
import { REMOVE_CONTACT_STATE } from '../../../states/types';
import { CaseState } from '../../../states/case/types';
import { connectedCaseBase, namespace, RootState } from '../../../states';

const task = { taskSid: 'task1' };

describe('test reducer', () => {
  let state: CaseState = undefined;
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
        task1: { connectedCase, caseWorkingCopy: { sections: {} } },
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
});
