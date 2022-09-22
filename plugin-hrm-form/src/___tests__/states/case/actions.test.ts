import { Case, SearchContact } from '../../../types/types';
import {
  CaseActionType,
  EditTemporaryCaseInfo,
  MARK_CASE_AS_UPDATED,
  REMOVE_CONNECTED_CASE,
  SET_CONNECTED_CASE,
  UPDATE_CASE_CONTACT,
  UPDATE_CASE_INFO,
  UPDATE_TEMP_INFO,
} from '../../../states/case/types';
import * as actions from '../../../states/case/actions';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';
import { searchContactToHrmServiceContact } from '../../../states/contacts/contactDetailsAdapter';

jest.mock('../../../states/contacts/contactDetailsAdapter', () => ({
  searchContactToHrmServiceContact: jest.fn(),
}));

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
    const value: EditTemporaryCaseInfo = {
      screen: NewCaseSubroutes.CaseSummary,
      action: CaseItemAction.Edit,
      info: {
        id: 'TEST_NOTE_ID',
        createdAt: new Date().toISOString(),
        twilioWorkerId: 'TEST_WORKER_ID',
        form: {},
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

  test('searchContactToHrmServiceContact', async () => {
    const expectedAction: CaseActionType = {
      type: UPDATE_CASE_CONTACT,
      taskId: task.taskSid,
      contact: 'I AM A HRM CONTACT',
    };
    (<jest.Mock>searchContactToHrmServiceContact).mockReturnValue('I AM A HRM CONTACT');
    const input: Partial<SearchContact> = {
      contactId: 'something',
    };
    expect(actions.updateCaseContactsWithSearchContact(task.taskSid, <SearchContact>input)).toStrictEqual(
      expectedAction,
    );
    expect(searchContactToHrmServiceContact).toHaveBeenCalledWith(input);
  });
});
