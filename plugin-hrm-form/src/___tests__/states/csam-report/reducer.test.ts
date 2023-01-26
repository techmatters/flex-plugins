import { reduce, initialState } from '../../../states/csam-report/reducer';
import * as actions from '../../../states/csam-report/actions';
import { GeneralActionType } from '../../../states/types';
import { ChildCSAMReportForm, CSAMReportTypes } from '../../../states/csam-report/types';
import { initialValues } from '../../../components/CSAMReport/CSAMReportFormDefinition';
import {
  newCSAMReportAction,
  newCSAMReportActionForContact,
  updateChildFormAction,
  updateCounsellorFormActionForContact,
} from '../../../states/csam-report/actions';

const childForm: ChildCSAMReportForm = {
  ageVerified: false,
  childAge: '16',
};
const newCounsellorTaskEntry = {
  form: { ...initialValues },
  reportType: CSAMReportTypes.COUNSELLOR,
  reportStatus: {
    responseCode: '',
    responseData: '',
    responseDescription: '',
  },
} as const;
const task = { taskSid: 'task-sid' };
const testContactId = 'TEST_CONTACT_ID';

describe('test reducer', () => {
  test('should return initial state', async () => {
    const state = undefined;

    const expected = initialState;

    const result = reduce(state, <GeneralActionType>{});
    expect(result).toStrictEqual(expected);
  });
  describe('UPDATE_FORM', () => {
    describe('for task', () => {
      test('task exists - should replace form for entry at taskSid', async () => {
        const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));

        const expected = {
          ...state,
          tasks: {
            ...state.tasks,
            [task.taskSid]: {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            },
          },
        };

        const result = reduce(
          state,
          actions.updateCounsellorFormAction({ ...newCounsellorTaskEntry.form, webAddress: 'some-url' }, task.taskSid),
        );

        expect(result).toStrictEqual(expected);
      });
      test("Task doesn't exist - creates CSAM entry with form & type set", async () => {
        const result = reduce(
          initialState,
          actions.updateChildFormAction({ ...childForm, ageVerified: true }, task.taskSid),
        );

        expect(result).toStrictEqual({
          ...initialState,
          tasks: {
            ...initialState.tasks,
            [task.taskSid]: {
              reportType: CSAMReportTypes.CHILD,
              form: { ...childForm, ageVerified: true },
            },
          },
        });
      });
      test('task exists with different form type - should reset type to new form type', async () => {
        const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));

        const expected = {
          ...state,
          tasks: {
            ...state.tasks,
            [task.taskSid]: {
              reportType: CSAMReportTypes.CHILD,
              form: { ...childForm, childAge: '16' },
            },
          },
        };

        const result = reduce(state, actions.updateChildFormAction({ ...childForm, childAge: '16' }, task.taskSid));

        expect(result).toStrictEqual(expected);
      });
    });
    describe('for contact', () => {
      test('contact exists - should replace form for entry at contactId', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));

        const expected = {
          ...state,
          contacts: {
            ...state.contacts,
            [testContactId]: {
              reportType: CSAMReportTypes.CHILD,
              form: { ...childForm, ageVerified: true },
            },
          },
        };

        const result = reduce(
          state,
          actions.updateChildFormActionForContact({ ...childForm, ageVerified: true }, testContactId),
        );

        expect(result).toStrictEqual(expected);
      });
      test("contact doesn't exist - creates CSAM entry with just form", async () => {
        const result = reduce(
          initialState,
          actions.updateCounsellorFormActionForContact(
            { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            testContactId,
          ),
        );

        expect(result).toStrictEqual({
          ...initialState,
          contacts: {
            ...initialState.contacts,
            [testContactId]: {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            },
          },
        });
      });
      test('contact exists with different form type - should reset type to new form type', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));

        const expected = {
          ...state,
          contacts: {
            ...state.contacts,
            [testContactId]: {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            },
          },
        };

        const result = reduce(
          state,
          actions.updateCounsellorFormActionForContact(
            { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            testContactId,
          ),
        );

        expect(result).toStrictEqual(expected);
      });
    });
  });
  describe('UPDATE_STATUS', () => {
    describe('for task', () => {
      test('task exists - should set status to one provisded in action', async () => {
        const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));

        const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
        const expected = {
          ...state,
          tasks: {
            ...state.tasks,
            [task.taskSid]: { reportType: CSAMReportTypes.COUNSELLOR, reportStatus, form: undefined },
          },
        };

        const result = reduce(state, actions.updateStatusAction(reportStatus, task.taskSid));

        expect(result).toStrictEqual(expected);
      });

      test("task doesn't exist - create task status to one provided in action", async () => {
        const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
        const expected = {
          ...initialState,
          tasks: {
            ...initialState.tasks,
            [task.taskSid]: { reportStatus },
          },
        };

        const result = reduce(initialState, actions.updateStatusAction(reportStatus, task.taskSid));

        expect(result).toStrictEqual(expected);
      });
    });
    describe('for contact', () => {
      test('contact exists - should set status to one provided in action', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));

        const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
        const expected = {
          ...state,
          contacts: {
            ...state.contacts,
            [testContactId]: { reportType: CSAMReportTypes.CHILD, reportStatus, form: undefined },
          },
        };

        const result = reduce(state, actions.updateStatusActionForContact(reportStatus, testContactId));

        expect(result).toStrictEqual(expected);
      });

      test("task doesn't exist - create task status to one provided in action", async () => {
        const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
        const expected = {
          ...initialState,
          contacts: {
            ...initialState.contacts,
            [testContactId]: { reportStatus },
          },
        };

        const result = reduce(initialState, actions.updateStatusActionForContact(reportStatus, testContactId));

        expect(result).toStrictEqual(expected);
      });
    });
  });
  describe('REMOVE_DRAFT_CSAM_REPORT', () => {
    describe('for task', () => {
      test('entry exists at task ID - it should be removed', async () => {
        const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));

        const result = reduce(state, actions.removeCSAMReportAction(task.taskSid));

        expect(result).toStrictEqual(initialState);
      });
      test('no entry exists for task SID - NOOP', async () => {
        const result = reduce(initialState, actions.removeCSAMReportAction(task.taskSid));

        expect(result).toStrictEqual(initialState);
      });
    });
    describe('for contact', () => {
      test('entry exists for contact ID - it should be removed', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR));
        const result = reduce(state, actions.removeCSAMReportActionForContact(testContactId));

        expect(result).toStrictEqual(initialState);
      });
      test('no entry exists for contact ID - NOOP', async () => {
        const result = reduce(initialState, actions.removeCSAMReportActionForContact(testContactId));

        expect(result).toStrictEqual(initialState);
      });
    });
  });
  describe('NEW_DRAFT_CSAM_REPORT', () => {
    describe('for task', () => {
      const populatedState = reduce(
        initialState,
        updateChildFormAction({ ageVerified: false, childAge: '14' }, task.taskSid),
      );
      test('Entry for task does not exist, createForm option true - adds new task with empty form', () => {
        const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR, true));
        expect(state).toStrictEqual({
          ...initialState,
          tasks: {
            [task.taskSid]: { reportType: CSAMReportTypes.COUNSELLOR, form: {} },
          },
        });
      });

      test('Entry for task does not exist, createForm option false - adds new task with no form', () => {
        const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR, false));
        expect(state).toStrictEqual({
          ...initialState,
          tasks: {
            [task.taskSid]: { reportType: CSAMReportTypes.COUNSELLOR, form: undefined },
          },
        });
      });

      test('Entry for task does not exist, createForm option false and no type set - adds empty entry', () => {
        const state = reduce(initialState, newCSAMReportAction(task.taskSid));
        expect(state).toStrictEqual({
          ...initialState,
          tasks: {
            [task.taskSid]: { reportType: undefined, form: undefined },
          },
        });
      });

      test('Entry for task does exist, createForm option true - clears form', () => {
        const state = reduce(populatedState, newCSAMReportAction(task.taskSid, CSAMReportTypes.CHILD, true));
        expect(state).toStrictEqual({
          ...populatedState,
          tasks: {
            [task.taskSid]: { reportType: CSAMReportTypes.CHILD, form: {} },
          },
        });
      });

      test('Entry for task does exist, createForm option false & reportType not set - NOOP', () => {
        const state = reduce(populatedState, newCSAMReportAction(task.taskSid));
        expect(state).toStrictEqual(populatedState);
      });

      test('Entry for task does exist, createForm option false and type set - resets type of existing entry', () => {
        const state = reduce(populatedState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));
        expect(state).toStrictEqual({
          ...populatedState,
          tasks: {
            [task.taskSid]: {
              ...populatedState.tasks[task.taskSid],
              reportType: CSAMReportTypes.COUNSELLOR,
            },
          },
        });
      });
    });
    describe('for contact', () => {
      const populatedState = reduce(
        initialState,
        updateCounsellorFormActionForContact(
          {
            anonymous: '',
            description: '',
            email: '',
            firstName: '',
            lastName: '',
            webAddress: '',
          },
          testContactId,
        ),
      );
      test('Entry for contact does not exist, createForm option true - adds new task with empty form', () => {
        const state = reduce(
          initialState,
          newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR, true),
        );
        expect(state).toStrictEqual({
          ...initialState,
          contacts: {
            [testContactId]: { reportType: CSAMReportTypes.COUNSELLOR, form: {} },
          },
        });
      });

      test('Entry for contact does not exist, createForm option false - adds new task with no form', () => {
        const state = reduce(
          initialState,
          newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR, false),
        );
        expect(state).toStrictEqual({
          ...initialState,
          contacts: {
            [testContactId]: { reportType: CSAMReportTypes.COUNSELLOR, form: undefined },
          },
        });
      });

      test('Entry for contact does not exist, createForm option false and no type set - adds empty entry', () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId));
        expect(state).toStrictEqual({
          ...initialState,
          contacts: {
            [testContactId]: { reportType: undefined, form: undefined },
          },
        });
      });

      test('Entry for contact does exist, createForm option true - clears form', () => {
        const state = reduce(
          populatedState,
          newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR, true),
        );
        expect(state).toStrictEqual({
          ...populatedState,
          contacts: {
            [testContactId]: { reportType: CSAMReportTypes.COUNSELLOR, form: {} },
          },
        });
      });

      test('Entry for contact does exist, createForm option false & reportType not set - NOOP', () => {
        const state = reduce(populatedState, newCSAMReportActionForContact(testContactId));
        expect(state).toStrictEqual(populatedState);
      });

      test('Entry for contact does exist, createForm option false and type set - resets type of existing entry', () => {
        const state = reduce(populatedState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));
        expect(state).toStrictEqual({
          ...populatedState,
          contacts: {
            [testContactId]: { ...populatedState.contacts[testContactId], reportType: CSAMReportTypes.CHILD },
          },
        });
      });
    });
  });
});
