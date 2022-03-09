import { Case } from '../../../types/types';
import {
  AddTemporaryCaseInfo,
  SET_CONNECTED_CASE,
  REMOVE_CONNECTED_CASE,
  UPDATE_CASE_INFO,
  MARK_CASE_AS_UPDATED,
  UPDATE_TEMP_INFO,
  UPDATE_CASE_STATUS,
  CaseActionType,
} from '../../../states/case/types';
import * as actions from '../../../states/case/actions';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';

const task = { taskSid: 'task1' };

describe('test action creators', () => {
  test('setConnectedCase', async () => {
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

    const expectedAction: CaseActionType = {
      type: SET_CONNECTED_CASE,
      connectedCase,
      taskId: task.taskSid,
      caseHasBeenEdited: false,
    };

    expect(actions.setConnectedCase(connectedCase, task.taskSid, false)).toStrictEqual(expectedAction);
  });

  test('removeConnectedCase', async () => {
    const expectedAction: CaseActionType = {
      type: REMOVE_CONNECTED_CASE,
      taskId: task.taskSid,
    };

    expect(actions.removeConnectedCase(task.taskSid)).toStrictEqual(expectedAction);
  });

  test('updateCaseInfo', async () => {
    const info = { summary: 'Some summary', notes: ['Some note'] };
    const expectedAction: CaseActionType = {
      type: UPDATE_CASE_INFO,
      info,
      taskId: task.taskSid,
    };

    expect(actions.updateCaseInfo(info, task.taskSid)).toStrictEqual(expectedAction);
  });

  test('updateTempInfo', async () => {
    const value: AddTemporaryCaseInfo = {
      screen: NewCaseSubroutes.Note,
      action: CaseItemAction.Add,
      info: {
        id: 'TEST_NOTE_ID',
        createdAt: new Date().toISOString(),
        twilioWorkerId: 'TEST_WORKER_ID',
      },
    };
    const expectedAction: CaseActionType = {
      type: UPDATE_TEMP_INFO,
      value,
      taskId: task.taskSid,
    };

    expect(actions.updateTempInfo(value, task.taskSid)).toStrictEqual(expectedAction);
  });

  test('markCaseAsUpdated', async () => {
    const expectedAction: CaseActionType = {
      type: MARK_CASE_AS_UPDATED,
      taskId: task.taskSid,
    };

    expect(actions.markCaseAsUpdated(task.taskSid)).toStrictEqual(expectedAction);
  });
});
