import { DeepPartial } from 'redux';

import { csamReportBase, namespace, RootState, routingBase } from '../../../states';
import { AppRoutes } from '../../../states/routing/types';
import { CSAMPage, newContactCSAMApi } from '../../../components/CSAMReport/csamReportApi';
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
  return partialState as RootState;
};

const stateWithTaskCsamReport = (taskSid: string, entry: CSAMReportEntry): RootState => {
  const partialState: DeepPartial<RootState> = {
    [namespace]: {
      [csamReportBase]: {
        tasks: {
          [taskSid]: entry,
        },
      },
    },
  };
  return partialState as RootState;
};

describe('newContactCSAMApi', () => {
  const previousRoute: AppRoutes = { route: 'new-case', subroute: 'caseSummary', previousRoute: undefined };
  const TEST_TASK_ID = 'a task';
  const api = newContactCSAMApi(TEST_TASK_ID, previousRoute);
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

  describe('state', () => {
    test('CSAM entry exists for task - returns entry', () => {
      const entry: CSAMReportEntry = {};
      expect(api.reportState(stateWithTaskCsamReport(TEST_TASK_ID, entry))).toBe(entry);
    });
    test("CSAM entry doesn't exist for task - returns entry", () => {
      const entry: CSAMReportEntry = {};
      expect(api.reportState(stateWithTaskCsamReport('not a task', entry))).not.toBeDefined();
    });
  });
});
