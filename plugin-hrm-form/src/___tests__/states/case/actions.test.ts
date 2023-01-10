import { Case } from '../../../types/types';
import { CaseActionType, REMOVE_CONNECTED_CASE, SET_CONNECTED_CASE } from '../../../states/case/types';
import * as actions from '../../../states/case/actions';

jest.mock('../../../states/contacts/contactDetailsAdapter', () => ({
  searchContactToHrmServiceContact: jest.fn(),
}));

const task = { taskSid: 'task1' };

describe('test action creators', () => {
  test('setConnectedCase', async () => {
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
    };

    const expectedAction: CaseActionType = {
      type: SET_CONNECTED_CASE,
      connectedCase,
      taskId: task.taskSid,
    };

    expect(actions.setConnectedCase(connectedCase, task.taskSid)).toStrictEqual(expectedAction);
  });

  test('removeConnectedCase', async () => {
    const expectedAction: CaseActionType = {
      type: REMOVE_CONNECTED_CASE,
      taskId: task.taskSid,
    };

    expect(actions.removeConnectedCase(task.taskSid)).toStrictEqual(expectedAction);
  });
});
