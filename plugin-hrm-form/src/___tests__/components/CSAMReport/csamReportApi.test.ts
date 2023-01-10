import { DeepPartial } from 'redux';
import { Dispatch } from 'react';

import { csamReportBase, namespace, RootState, routingBase } from '../../../states';
import { AppRoutes } from '../../../states/routing/types';
import { CSAMPage, newContactCSAMApi } from '../../../components/CSAMReport/csamReportApi';
import {
  ChildCSAMReportForm,
  CounselorCSAMReportForm,
  CSAMReportStateEntry,
  CSAMReportStatus,
  CSAMReportTypes,
} from '../../../states/csam-report/types';
import {
  removeCSAMReportAction,
  newCSAMReportAction,
  updateCounsellorFormAction,
  updateChildFormAction,
  updateStatusAction,
} from '../../../states/csam-report/actions';
import { changeRoute } from '../../../states/routing/actions';
import { addCSAMReportEntry } from '../../../states/contacts/actions';
import { CSAMReportEntry } from '../../../types/types';

const stateWithRoute = (taskSid: string, route: AppRoutes): RootState => {
  const partialState: DeepPartial<RootState> = {
    [namespace]: {
      [routingBase]: {
        tasks: {
          [taskSid]: route,
        },
      },
    },
  };
  return (partialState as unknown) as RootState;
};

const stateWithTaskCsamReport = (taskSid: string, entry: CSAMReportStateEntry): RootState => {
  const partialState: DeepPartial<RootState> = {
    [namespace]: {
      [csamReportBase]: {
        tasks: {
          [taskSid]: entry,
        },
      },
    },
  };
  return (partialState as unknown) as RootState;
};

describe('newContactCSAMApi', () => {
  const previousRoute: AppRoutes = { route: 'new-case', subroute: 'case-print-view' };
  const TEST_TASK_ID = 'a task';
  const api = newContactCSAMApi(TEST_TASK_ID, previousRoute);
  const mockDispatch: jest.Mock = jest.fn();
  const dispatch: Dispatch<unknown> = mockDispatch as Dispatch<unknown>;

  beforeEach(() => {
    mockDispatch.mockClear();
  });

  describe('currentPage', () => {
    test('No route defined for task - throws', () => {
      expect(() =>
        api.currentPage(stateWithRoute('another task', { route: 'csam-report', subroute: 'form', previousRoute })),
      ).toThrow();
    });
    test('Non csam route defined for task - returns undefined', () => {
      expect(api.currentPage(stateWithRoute(TEST_TASK_ID, previousRoute))).not.toBeDefined();
    });
    test('A csam route defined for task - returns CSAMPage equivalent to subroute', () => {
      expect(
        api.currentPage(
          stateWithRoute(TEST_TASK_ID, { route: 'csam-report', subroute: 'report-type-picker', previousRoute }),
        ),
      ).toBe(CSAMPage.ReportTypePicker);
      expect(
        api.currentPage(stateWithRoute(TEST_TASK_ID, { route: 'csam-report', subroute: 'form', previousRoute })),
      ).toBe(CSAMPage.Form);
      expect(
        api.currentPage(stateWithRoute(TEST_TASK_ID, { route: 'csam-report', subroute: 'loading', previousRoute })),
      ).toBe(CSAMPage.Loading);
      expect(
        api.currentPage(stateWithRoute(TEST_TASK_ID, { route: 'csam-report', subroute: 'status', previousRoute })),
      ).toBe(CSAMPage.Status);
    });
  });

  describe('reportState', () => {
    test('CSAM entry exists for task - returns entry', () => {
      const entry: CSAMReportStateEntry = {};
      expect(api.reportState(stateWithTaskCsamReport(TEST_TASK_ID, entry))).toBe(entry);
    });
    test("CSAM entry doesn't exist for task - returns entry", () => {
      const entry: CSAMReportStateEntry = {};
      expect(api.reportState(stateWithTaskCsamReport('not a task', entry))).not.toBeDefined();
    });
  });

  describe('navigationActionDispatcher', () => {
    const navigate = api.navigationActionDispatcher(dispatch);
    test('ReportTypePicker - dispatches newCSAMReportAction without creating a form, and dispatches a changeRoute action', () => {
      navigate(CSAMPage.ReportTypePicker, CSAMReportTypes.CHILD);
      expect(dispatch).toHaveBeenCalledWith(newCSAMReportAction(TEST_TASK_ID, CSAMReportTypes.CHILD, false));
      expect(dispatch).toHaveBeenCalledWith(
        changeRoute({ route: 'csam-report', subroute: 'report-type-picker', previousRoute }, TEST_TASK_ID),
      );
    });
    test('Form - dispatches newCSAMReportAction creating a form, and dispatches a changeRoute action', () => {
      navigate(CSAMPage.Form, CSAMReportTypes.CHILD);
      expect(dispatch).toHaveBeenCalledWith(newCSAMReportAction(TEST_TASK_ID, CSAMReportTypes.CHILD, true));
      expect(dispatch).toHaveBeenCalledWith(
        changeRoute({ route: 'csam-report', subroute: 'form', previousRoute }, TEST_TASK_ID),
      );
    });
    test('Loading - dispatches a changeRoute action', () => {
      navigate(CSAMPage.Loading, CSAMReportTypes.COUNSELLOR);
      expect(dispatch).toHaveBeenCalledWith(
        changeRoute({ route: 'csam-report', subroute: 'loading', previousRoute }, TEST_TASK_ID),
      );
    });
    test('Status - dispatches a changeRoute action', () => {
      navigate(CSAMPage.Status, CSAMReportTypes.CHILD);
      expect(dispatch).toHaveBeenCalledWith(
        changeRoute({ route: 'csam-report', subroute: 'status', previousRoute }, TEST_TASK_ID),
      );
    });
  });
  test('exitActionDispatcher - dispatches removeCSAMReportAction action and changes route to previous route', () => {
    api.exitActionDispatcher(dispatch)();
    expect(dispatch).toHaveBeenCalledWith(removeCSAMReportAction(TEST_TASK_ID));
    expect(dispatch).toHaveBeenCalledWith(changeRoute(previousRoute, TEST_TASK_ID));
  });
  test('addReportDispatcher - dispatches addCSAMReportEntry action', () => {
    const entry: CSAMReportEntry = {
      acknowledged: false,
      createdAt: '',
      csamReportId: '',
      id: 0,
      reportType: undefined,
      twilioWorkerId: '',
    };
    api.addReportDispatcher(dispatch)(entry);
    expect(dispatch).toHaveBeenCalledWith(addCSAMReportEntry(entry, TEST_TASK_ID));
  });
  test('pickReportTypeDispatcher - dispatches newCSAMReportAction action without a new form', () => {
    api.pickReportTypeDispatcher(dispatch)(CSAMReportTypes.CHILD);
    expect(dispatch).toHaveBeenCalledWith(newCSAMReportAction(TEST_TASK_ID, CSAMReportTypes.CHILD, false));
  });
  test('updateCounsellorReportDispatcher - dispatches updateCounsellorFormAction action without a new form', () => {
    const form: CounselorCSAMReportForm = {
      webAddress: '',
      description: '',
      anonymous: '',
      firstName: '',
      lastName: '',
      email: '',
    };
    api.updateCounsellorReportDispatcher(dispatch)(form);
    expect(dispatch).toHaveBeenCalledWith(updateCounsellorFormAction(form, TEST_TASK_ID));
  });
  test('updateChildReportDispatcher - dispatches updateChildFormAction action without a new form', () => {
    const form: ChildCSAMReportForm = { ageVerified: false, childAge: '' };
    api.updateChildReportDispatcher(dispatch)(form);
    expect(dispatch).toHaveBeenCalledWith(updateChildFormAction(form, TEST_TASK_ID));
  });
  test('updateStatusDispatcher - dispatches newCSAMReportAction action without a new form', () => {
    const status: CSAMReportStatus = { responseCode: '', responseData: '', responseDescription: '' };
    api.updateStatusDispatcher(dispatch)(status);
    expect(dispatch).toHaveBeenCalledWith(updateStatusAction(status, TEST_TASK_ID));
  });
});
