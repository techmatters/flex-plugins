import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { reduce } from '../../../states/case/reducer';
import * as actions from '../../../states/case/actions';
import * as GeneralActions from '../../../states/actions';
import { Case } from '../../../types/types';

const task = { taskSid: 'task1' };
const voidDefinitions = {
  callerFormDefinition: [],
  caseInfoFormDefinition: [],
  categoriesFormDefinition: {},
  childFormDefinition: [],
};

describe('test reducer', () => {
  let state = undefined;
  let mockV1;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
  });

  test('should return initial state', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, {});
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should ignore INITIALIZE_CONTACT_STATE', async () => {
    const result = reduce(state, GeneralActions.initializeContactState(mockV1.tabbedForms)(task.taskSid));
    expect(result).toStrictEqual(state);
  });

  test('should handle SET_CONNECTED_CASE', async () => {
    const connectedCase: Case = {
      id: 1,
      helpline: '',
      status: 'open',
      twilioWorkerId: 'WK123',
      info: null,
      createdAt: '2020-07-31T20:39:37.408Z',
      updatedAt: '2020-07-31T20:39:37.408Z',
      connectedContacts: null,
    };

    const expected = {
      tasks: { task1: { connectedCase, temporaryCaseInfo: null, caseHasBeenEdited: false, prevStatus: 'open' } },
    };

    const result = reduce(state, actions.setConnectedCase(connectedCase, task.taskSid, false));
    expect(result).toStrictEqual(expected);

    state = result;
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
        task1: { connectedCase: { ...connectedCase, info }, temporaryCaseInfo, caseHasBeenEdited: true, prevStatus },
      },
    };

    const result = reduce(state, actions.updateCaseInfo(info, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle UPDATE_TEMP_INFO', async () => {
    const randomTemp = { screen: 'add-note', info: '' };

    const { connectedCase, prevStatus } = state.tasks.task1;
    const expected = {
      tasks: { task1: { connectedCase, temporaryCaseInfo: randomTemp, caseHasBeenEdited: true, prevStatus } },
    };

    const result = reduce(state, actions.updateTempInfo({ screen: 'add-note', info: '' }, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle MARK_CASE_AS_UPDATED', async () => {
    const expected = { tasks: { task1: { ...state.tasks.task1, caseHasBeenEdited: false } } };

    const result = reduce(state, actions.markCaseAsUpdated(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });
});
