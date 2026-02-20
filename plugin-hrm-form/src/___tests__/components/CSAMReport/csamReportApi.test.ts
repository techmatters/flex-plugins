/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { DeepPartial } from 'redux';
import { Dispatch } from 'react';

import { RootState } from '../../../states';
import { AppRoutes } from '../../../states/routing/types';
import { CSAMPage, existingContactCSAMApi, newContactCSAMApi } from '../../../components/CSAMReport/csamReportApi';
import {
  ChildCSAMReportForm,
  CounselorCSAMReportForm,
  CSAMReportStateEntry,
  CSAMReportStatus,
  CSAMReportTypes,
} from '../../../states/csam-report/types';
import {
  updateStatusActionForContact,
  removeCSAMReportActionForContact,
  newCSAMReportActionForContact,
  updateCounsellorFormActionForContact,
  updateChildFormActionForContact,
} from '../../../states/csam-report/actions';
import { changeRoute } from '../../../states/routing/actions';
import { CSAMReportEntry } from '../../../types/types';
import { reportToIWF, selfReportToIWF } from '../../../services/iwfService';
import { acknowledgeCSAMReport, createCSAMReport } from '../../../services/CSAMReportService';
import { addExternalReportEntry } from '../../../states/csam-report/existingContactExternalReport';
import { csamReportBase, namespace, routingBase } from '../../../states/storeNamespaces';

jest.mock('../../../services/iwfService', () => ({
  reportToIWF: jest.fn(),
  selfReportToIWF: jest.fn(),
}));

jest.mock('../../../services/CSAMReportService', () => ({
  acknowledgeCSAMReport: jest.fn(),
  createCSAMReport: jest.fn(),
}));

const TEST_CONTACT_ID = '1337';

const stateWithRoute = (taskSid: string, route: AppRoutes): RootState => {
  const partialState: DeepPartial<RootState> = {
    [namespace]: {
      [routingBase]: {
        tasks: {
          [taskSid]: [route],
        },
      },
    },
  };
  return (partialState as unknown) as RootState;
};

const stateWithContactCsamReport = (contactId: string, entry: CSAMReportStateEntry): RootState => {
  const partialState: DeepPartial<RootState> = {
    [namespace]: {
      [csamReportBase]: {
        contacts: {
          [contactId]: entry,
        },
      },
    },
  };
  return (partialState as unknown) as RootState;
};

describe('newContactCSAMApi', () => {
  const previousRoute: AppRoutes = { route: 'new-case', subroute: 'case-print-view' };
  const TEST_TASK_ID = 'a task';
  const api = newContactCSAMApi(TEST_CONTACT_ID, TEST_TASK_ID, previousRoute);
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
    test('CSAM entry exists for contact - returns entry', () => {
      const entry: CSAMReportStateEntry = {};
      expect(api.reportState(stateWithContactCsamReport(TEST_CONTACT_ID, entry))).toBe(entry);
    });
    test("CSAM entry doesn't exist for task - returns entry", () => {
      const entry: CSAMReportStateEntry = {};
      expect(api.reportState(stateWithContactCsamReport('not a task', entry))).not.toBeDefined();
    });
  });

  describe('navigationActionDispatcher', () => {
    const navigate = api.navigationActionDispatcher(dispatch);
    test('ReportTypePicker - dispatches newCSAMReportAction without creating a form, and dispatches a changeRoute action', () => {
      navigate(CSAMPage.ReportTypePicker, CSAMReportTypes.CHILD);
      expect(dispatch).toHaveBeenCalledWith(
        newCSAMReportActionForContact(TEST_CONTACT_ID, CSAMReportTypes.CHILD, false),
      );
      expect(dispatch).toHaveBeenCalledWith(
        changeRoute({ route: 'csam-report', subroute: 'report-type-picker', previousRoute }, TEST_TASK_ID),
      );
    });
    test('Form - dispatches newCSAMReportAction creating a form, and dispatches a changeRoute action', () => {
      navigate(CSAMPage.Form, CSAMReportTypes.CHILD);
      expect(dispatch).toHaveBeenCalledWith(
        newCSAMReportActionForContact(TEST_CONTACT_ID, CSAMReportTypes.CHILD, true),
      );
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
    expect(dispatch).toHaveBeenCalledWith(removeCSAMReportActionForContact(TEST_CONTACT_ID));
    expect(dispatch).toHaveBeenCalledWith(changeRoute(previousRoute, TEST_TASK_ID));
  });
  test('pickReportTypeDispatcher - dispatches newCSAMReportAction action without a new form', () => {
    api.pickReportTypeDispatcher(dispatch)(CSAMReportTypes.CHILD);
    expect(dispatch).toHaveBeenCalledWith(newCSAMReportActionForContact(TEST_CONTACT_ID, CSAMReportTypes.CHILD, false));
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
    expect(dispatch).toHaveBeenCalledWith(updateCounsellorFormActionForContact(form, TEST_CONTACT_ID));
  });
  test('updateChildReportDispatcher - dispatches updateChildFormAction action without a new form', () => {
    const form: ChildCSAMReportForm = { ageVerified: false, childAge: '' };
    api.updateChildReportDispatcher(dispatch)(form);
    expect(dispatch).toHaveBeenCalledWith(updateChildFormActionForContact(form, TEST_CONTACT_ID));
  });
  test('updateStatusDispatcher - dispatches newCSAMReportAction action without a new form', () => {
    const status: CSAMReportStatus = { responseCode: '', responseData: '', responseDescription: '' };
    api.updateStatusDispatcher(dispatch)(status);
    expect(dispatch).toHaveBeenCalledWith(updateStatusActionForContact(status, TEST_CONTACT_ID));
  });

  describe('saveReport', () => {
    const TEST_WORKER_SID = 'a worker sid';
    const DEFAULT_IWF_REPORT_RESPONSE = {
      'IWFReportService1.0': {
        responseData: 'IWF REPORT ID',
      },
    };
    const UNACKNOWLEDGED_HRM_CSAM_ENTRY: CSAMReportEntry = {
      acknowledged: false,
      createdAt: '',
      csamReportId: 'A CSAM ID',
      id: 1234,
      reportType: undefined,
      twilioWorkerId: '',
    };
    const mockCreateCSAMReport = createCSAMReport as jest.Mock<Promise<CSAMReportEntry>>;

    beforeEach(() => {
      mockCreateCSAMReport.mockClear();
    });

    describe('Child Report', () => {
      const mockSelfReportToIWF = selfReportToIWF as jest.Mock;
      const EMPTY_CHILD_FORM: ChildCSAMReportForm = { ageVerified: false, childAge: '' };
      const mockAcknowledgeCSAMReport = acknowledgeCSAMReport as jest.Mock<Promise<CSAMReportEntry>>;
      const ACKNOWLEDGED_HRM_CSAM_ENTRY: CSAMReportEntry = { ...UNACKNOWLEDGED_HRM_CSAM_ENTRY, acknowledged: true };
      beforeEach(() => {
        mockSelfReportToIWF.mockClear();
        mockAcknowledgeCSAMReport.mockClear();
      });
      test('Creates report in HRM, reports to IWF, then acknowledge report in HRM, without a contactID', async () => {
        mockCreateCSAMReport.mockResolvedValue(UNACKNOWLEDGED_HRM_CSAM_ENTRY);
        mockSelfReportToIWF.mockResolvedValue({ status: 'grand', reportUrl: 'a url' });
        mockAcknowledgeCSAMReport.mockResolvedValue(ACKNOWLEDGED_HRM_CSAM_ENTRY);
        const returned = await api.saveReport(
          {
            reportType: CSAMReportTypes.CHILD,
            form: EMPTY_CHILD_FORM,
          },
          TEST_WORKER_SID,
        );
        expect(createCSAMReport).toHaveBeenCalledWith({
          reportType: 'self-generated',
          twilioWorkerId: TEST_WORKER_SID,
          contactId: 1337,
        });
        expect(selfReportToIWF).toHaveBeenCalledWith(EMPTY_CHILD_FORM, UNACKNOWLEDGED_HRM_CSAM_ENTRY.csamReportId);
        expect(acknowledgeCSAMReport).toHaveBeenCalledWith(UNACKNOWLEDGED_HRM_CSAM_ENTRY.id);
        expect(returned.hrmReport).toStrictEqual(ACKNOWLEDGED_HRM_CSAM_ENTRY);
        expect(returned.iwfReport).toStrictEqual({
          responseCode: 'grand',
          responseData: 'a url',
          responseDescription: '',
        });
      });
      test("Reports to IWF throws - throws and does creates a report in HRM, but doesn't acknowledge it", async () => {
        mockSelfReportToIWF.mockRejectedValue(new Error());
        await expect(
          api.saveReport(
            {
              reportType: CSAMReportTypes.CHILD,
              form: EMPTY_CHILD_FORM,
            },
            TEST_WORKER_SID,
          ),
        ).rejects.toThrow();
        expect(createCSAMReport).toHaveBeenCalledWith({
          reportType: 'self-generated',
          twilioWorkerId: TEST_WORKER_SID,
          contactId: 1337,
        });
        expect(selfReportToIWF).toHaveBeenCalledWith(EMPTY_CHILD_FORM, UNACKNOWLEDGED_HRM_CSAM_ENTRY.csamReportId);
        expect(acknowledgeCSAMReport).not.toHaveBeenCalled();
      });
      test('Call to create CSAM in HRM throws - throws and does not send report to IWF', async () => {
        mockCreateCSAMReport.mockRejectedValue(new Error());
        await expect(
          api.saveReport(
            {
              reportType: CSAMReportTypes.CHILD,
              form: EMPTY_CHILD_FORM,
            },
            TEST_WORKER_SID,
          ),
        ).rejects.toThrow();
        expect(selfReportToIWF).not.toHaveBeenCalled();
        expect(acknowledgeCSAMReport).not.toHaveBeenCalled();
      });
      test('Call to acknowledge CSAM in HRM throws - does send report to IWF', async () => {
        mockCreateCSAMReport.mockResolvedValue(UNACKNOWLEDGED_HRM_CSAM_ENTRY);
        mockSelfReportToIWF.mockResolvedValue({ status: 'grand', reportUrl: 'a url' });
        mockAcknowledgeCSAMReport.mockRejectedValue(new Error());
        await expect(
          api.saveReport(
            {
              reportType: CSAMReportTypes.CHILD,
              form: EMPTY_CHILD_FORM,
            },
            TEST_WORKER_SID,
          ),
        ).rejects.toThrow();
        expect(selfReportToIWF).toHaveBeenCalledWith(EMPTY_CHILD_FORM, UNACKNOWLEDGED_HRM_CSAM_ENTRY.csamReportId);
        expect(acknowledgeCSAMReport).toHaveBeenCalledWith(UNACKNOWLEDGED_HRM_CSAM_ENTRY.id);
      });
    });
    describe('Counsellor Report', () => {
      const mockReportToIWF = reportToIWF as jest.Mock;
      const EMPTY_COUNSELLOR_FORM: CounselorCSAMReportForm = {
        anonymous: '',
        description: '',
        email: '',
        firstName: '',
        lastName: '',
        webAddress: '',
      };

      beforeEach(() => {
        mockReportToIWF.mockClear();
        mockCreateCSAMReport.mockClear();
      });

      test('Reports to IWF, then creates report in HRM, without a contactID', async () => {
        mockReportToIWF.mockResolvedValue(DEFAULT_IWF_REPORT_RESPONSE);
        mockCreateCSAMReport.mockResolvedValue(UNACKNOWLEDGED_HRM_CSAM_ENTRY);
        const returned = await api.saveReport(
          {
            reportType: CSAMReportTypes.COUNSELLOR,
            form: EMPTY_COUNSELLOR_FORM,
          },
          TEST_WORKER_SID,
        );
        expect(reportToIWF).toHaveBeenCalledWith(EMPTY_COUNSELLOR_FORM);
        expect(createCSAMReport).toHaveBeenCalledWith({
          reportType: 'counsellor-generated',
          csamReportId: DEFAULT_IWF_REPORT_RESPONSE['IWFReportService1.0'].responseData,
          twilioWorkerId: TEST_WORKER_SID,
          contactId: 1337,
        });
        expect(returned.hrmReport).toStrictEqual(UNACKNOWLEDGED_HRM_CSAM_ENTRY);
        expect(returned.iwfReport).toBe(DEFAULT_IWF_REPORT_RESPONSE['IWFReportService1.0']);
      });
      test('Reports to IWF throws - throws and does not create a report in HRM', async () => {
        mockReportToIWF.mockRejectedValue(new Error());
        await expect(
          api.saveReport(
            {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: EMPTY_COUNSELLOR_FORM,
            },
            TEST_WORKER_SID,
          ),
        ).rejects.toThrow();
        expect(reportToIWF).toHaveBeenCalledWith(EMPTY_COUNSELLOR_FORM);
        expect(createCSAMReport).not.toHaveBeenCalled();
      });
      test('Call to HRM throws - throws and does send report to IWF', async () => {
        mockCreateCSAMReport.mockRejectedValue(new Error());
        await expect(
          api.saveReport(
            {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: EMPTY_COUNSELLOR_FORM,
            },
            TEST_WORKER_SID,
          ),
        ).rejects.toThrow();
        expect(reportToIWF).toHaveBeenCalledWith(EMPTY_COUNSELLOR_FORM);
      });
    });
    test('Report without form - throws', async () => {
      await expect(
        api.saveReport(
          {
            reportType: CSAMReportTypes.COUNSELLOR,
          },
          TEST_WORKER_SID,
        ),
      ).rejects.toThrow();
      await expect(
        api.saveReport(
          {
            reportType: CSAMReportTypes.CHILD,
          },
          TEST_WORKER_SID,
        ),
      ).rejects.toThrow();
      await expect(api.saveReport({}, TEST_WORKER_SID)).rejects.toThrow();
    });
  });
});

describe('existingContactCSAMApi', () => {
  const api = existingContactCSAMApi(TEST_CONTACT_ID);
  const mockDispatch: jest.Mock = jest.fn();
  const dispatch: Dispatch<unknown> = mockDispatch as Dispatch<unknown>;

  const EMPTY_STATUS: CSAMReportStatus = { responseCode: '', responseData: '', responseDescription: '' };

  beforeEach(() => {
    mockDispatch.mockClear();
  });

  describe('currentPage', () => {
    test('No report defined for contact - throws', () => {
      expect(() => api.currentPage(stateWithContactCsamReport('not this contact', {}))).toThrowError();
    });
    test('Report with no report type at contact ID - ReportTypePicker', () => {
      expect(api.currentPage(stateWithContactCsamReport(TEST_CONTACT_ID, {}))).toBe(CSAMPage.ReportTypePicker);
    });
    test('Report with report type but no form at contact ID - ReportTypePicker', () => {
      expect(api.currentPage(stateWithContactCsamReport(TEST_CONTACT_ID, { reportType: CSAMReportTypes.CHILD }))).toBe(
        CSAMPage.ReportTypePicker,
      );
    });
    test('Report with report type and form but no status at contact ID - Form', () => {
      expect(
        api.currentPage(
          stateWithContactCsamReport(TEST_CONTACT_ID, {
            reportType: CSAMReportTypes.CHILD,
            form: { childAge: '', ageVerified: false },
          }),
        ),
      ).toBe(CSAMPage.Form);
    });
    test('Report with report type, form and empty status at contact ID - Loading', () => {
      expect(
        api.currentPage(
          stateWithContactCsamReport(TEST_CONTACT_ID, {
            reportType: CSAMReportTypes.CHILD,
            form: { childAge: '', ageVerified: false },
            reportStatus: EMPTY_STATUS,
          }),
        ),
      ).toBe(CSAMPage.Loading);
    });
    test('Report with report type, form and status with code populated - Status', () => {
      expect(
        api.currentPage(
          stateWithContactCsamReport(TEST_CONTACT_ID, {
            reportType: CSAMReportTypes.CHILD,
            form: { childAge: '', ageVerified: false },
            reportStatus: { ...EMPTY_STATUS, responseCode: '1' },
          }),
        ),
      ).toBe(CSAMPage.Status);
    });
    test('Report with report type and status with code populated but no form - ReportTypePricker', () => {
      expect(
        api.currentPage(
          stateWithContactCsamReport(TEST_CONTACT_ID, {
            reportType: CSAMReportTypes.CHILD,
            reportStatus: { ...EMPTY_STATUS, responseCode: '1' },
          }),
        ),
      ).toBe(CSAMPage.ReportTypePicker);
    });
  });

  describe('reportState', () => {
    test('CSAM entry exists for contact - returns entry', () => {
      const entry: CSAMReportStateEntry = {};
      expect(api.reportState(stateWithContactCsamReport(TEST_CONTACT_ID, entry))).toBe(entry);
    });
    test("CSAM entry doesn't exist for task - returns nothing", () => {
      const entry: CSAMReportStateEntry = {};
      expect(api.reportState(stateWithContactCsamReport('not a task', entry))).not.toBeDefined();
    });
  });

  describe('navigationActionDispatcher', () => {
    const navigate = api.navigationActionDispatcher(dispatch);
    test('ReportTypePicker - dispatches newCSAMReportAction without creating a form', () => {
      navigate(CSAMPage.ReportTypePicker, CSAMReportTypes.CHILD);
      expect(dispatch).toHaveBeenCalledWith(
        newCSAMReportActionForContact(TEST_CONTACT_ID, CSAMReportTypes.CHILD, false),
      );
    });
    test('Form - dispatches newCSAMReportAction creating a form', () => {
      navigate(CSAMPage.Form, CSAMReportTypes.COUNSELLOR);
      expect(dispatch).toHaveBeenCalledWith(
        newCSAMReportActionForContact(TEST_CONTACT_ID, CSAMReportTypes.COUNSELLOR, true),
      );
    });
    test('Loading - dispatches an updateStatus action with an empty status', () => {
      navigate(CSAMPage.Loading, CSAMReportTypes.COUNSELLOR);
      expect(dispatch).toHaveBeenCalledWith(
        updateStatusActionForContact(
          { responseCode: undefined, responseData: undefined, responseDescription: undefined },
          TEST_CONTACT_ID,
        ),
      );
    });
    test('Status - noop', () => {
      navigate(CSAMPage.Status, CSAMReportTypes.CHILD);
      expect(dispatch).not.toHaveBeenCalled();
      navigate(CSAMPage.Status, CSAMReportTypes.COUNSELLOR);
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
  test('exitActionDispatcher - dispatches clearCSAMReportActionForContact action', () => {
    api.exitActionDispatcher(dispatch)();
    expect(dispatch).toHaveBeenCalledWith(removeCSAMReportActionForContact(TEST_CONTACT_ID));
  });
  test('addReportDispatcher - dispatches addExternalReportEntry action', () => {
    const entry: CSAMReportEntry = {
      acknowledged: false,
      createdAt: '',
      csamReportId: '',
      id: 0,
      reportType: undefined,
      twilioWorkerId: '',
    };
    api.addReportDispatcher(dispatch)(entry);
    expect(dispatch).toHaveBeenCalledWith(addExternalReportEntry(entry, TEST_CONTACT_ID));
  });
  test('pickReportTypeDispatcher - dispatches newCSAMReportAction action without a new form', () => {
    api.pickReportTypeDispatcher(dispatch)(CSAMReportTypes.CHILD);
    expect(dispatch).toHaveBeenCalledWith(newCSAMReportActionForContact(TEST_CONTACT_ID, CSAMReportTypes.CHILD, false));
  });

  describe('saveReport', () => {
    const TEST_WORKER_SID = 'a worker sid';
    const DEFAULT_IWF_REPORT_RESPONSE = {
      'IWFReportService1.0': {
        responseData: 'IWF REPORT ID',
      },
    };
    const UNACKNOWLEDGED_HRM_CSAM_ENTRY: CSAMReportEntry = {
      acknowledged: false,
      createdAt: '',
      csamReportId: 'A CSAM ID',
      id: 1234,
      reportType: undefined,
      twilioWorkerId: '',
    };
    const mockCreateCSAMReport = createCSAMReport as jest.Mock<Promise<CSAMReportEntry>>;

    beforeEach(() => {
      mockCreateCSAMReport.mockClear();
    });

    describe('Child Report', () => {
      const mockSelfReportToIWF = selfReportToIWF as jest.Mock;
      const EMPTY_CHILD_FORM: ChildCSAMReportForm = { ageVerified: false, childAge: '' };
      const mockAcknowledgeCSAMReport = acknowledgeCSAMReport as jest.Mock<Promise<CSAMReportEntry>>;
      const ACKNOWLEDGED_HRM_CSAM_ENTRY: CSAMReportEntry = { ...UNACKNOWLEDGED_HRM_CSAM_ENTRY, acknowledged: true };
      beforeEach(() => {
        mockSelfReportToIWF.mockClear();
        mockAcknowledgeCSAMReport.mockClear();
      });
      test('Creates report in HRM, reports to IWF, then acknowledge report in HRM, with a contactID', async () => {
        mockCreateCSAMReport.mockResolvedValue(UNACKNOWLEDGED_HRM_CSAM_ENTRY);
        mockSelfReportToIWF.mockResolvedValue({ status: 'grand', reportUrl: 'a url' });
        mockAcknowledgeCSAMReport.mockResolvedValue(ACKNOWLEDGED_HRM_CSAM_ENTRY);
        const returned = await api.saveReport(
          {
            reportType: CSAMReportTypes.CHILD,
            form: EMPTY_CHILD_FORM,
          },
          TEST_WORKER_SID,
        );
        expect(createCSAMReport).toHaveBeenCalledWith({
          reportType: 'self-generated',
          twilioWorkerId: TEST_WORKER_SID,
          contactId: Number.parseInt(TEST_CONTACT_ID, 10),
        });
        expect(selfReportToIWF).toHaveBeenCalledWith(EMPTY_CHILD_FORM, UNACKNOWLEDGED_HRM_CSAM_ENTRY.csamReportId);
        expect(acknowledgeCSAMReport).toHaveBeenCalledWith(UNACKNOWLEDGED_HRM_CSAM_ENTRY.id);
        expect(returned.hrmReport).toStrictEqual(ACKNOWLEDGED_HRM_CSAM_ENTRY);
        expect(returned.iwfReport).toStrictEqual({
          responseCode: 'grand',
          responseData: 'a url',
          responseDescription: '',
        });
      });
      test('Non numeric contactId - throws', async () => {
        const apiWithNonNumericContactId = existingContactCSAMApi('non numeric contactId');
        await expect(
          apiWithNonNumericContactId.saveReport(
            {
              reportType: CSAMReportTypes.CHILD,
              form: EMPTY_CHILD_FORM,
            },
            TEST_WORKER_SID,
          ),
        ).rejects.toThrow();
        expect(createCSAMReport).not.toHaveBeenCalledWith();
        expect(selfReportToIWF).not.toHaveBeenCalledWith(EMPTY_CHILD_FORM, UNACKNOWLEDGED_HRM_CSAM_ENTRY.csamReportId);
        expect(acknowledgeCSAMReport).not.toHaveBeenCalledWith(UNACKNOWLEDGED_HRM_CSAM_ENTRY.id);
      });
    });
    describe('Counsellor Report', () => {
      const mockReportToIWF = reportToIWF as jest.Mock;
      const EMPTY_COUNSELLOR_FORM: CounselorCSAMReportForm = {
        anonymous: '',
        description: '',
        email: '',
        firstName: '',
        lastName: '',
        webAddress: '',
      };

      beforeEach(() => {
        mockReportToIWF.mockClear();
        mockCreateCSAMReport.mockClear();
      });

      test('Reports to IWF, then creates report in HRM, with a contactID', async () => {
        mockReportToIWF.mockResolvedValue(DEFAULT_IWF_REPORT_RESPONSE);
        mockCreateCSAMReport.mockResolvedValue(UNACKNOWLEDGED_HRM_CSAM_ENTRY);
        const returned = await api.saveReport(
          {
            reportType: CSAMReportTypes.COUNSELLOR,
            form: EMPTY_COUNSELLOR_FORM,
          },
          TEST_WORKER_SID,
        );
        expect(reportToIWF).toHaveBeenCalledWith(EMPTY_COUNSELLOR_FORM);
        expect(createCSAMReport).toHaveBeenCalledWith({
          reportType: 'counsellor-generated',
          csamReportId: DEFAULT_IWF_REPORT_RESPONSE['IWFReportService1.0'].responseData,
          twilioWorkerId: TEST_WORKER_SID,
          contactId: Number.parseInt(TEST_CONTACT_ID, 10),
        });
        expect(returned.hrmReport).toStrictEqual(UNACKNOWLEDGED_HRM_CSAM_ENTRY);
        expect(returned.iwfReport).toBe(DEFAULT_IWF_REPORT_RESPONSE['IWFReportService1.0']);
      });

      test('Non numeric contactId - throws', async () => {
        const apiWithNonNumericContactId = existingContactCSAMApi('non numeric contactId');
        await expect(
          apiWithNonNumericContactId.saveReport(
            {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: EMPTY_COUNSELLOR_FORM,
            },
            TEST_WORKER_SID,
          ),
        ).rejects.toThrow();
        expect(reportToIWF).not.toHaveBeenCalled();
        expect(createCSAMReport).not.toHaveBeenCalled();
      });
    });
  });
});
