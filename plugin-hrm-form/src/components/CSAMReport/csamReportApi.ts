import { Dispatch } from 'react';

import * as CSAMAction from '../../states/csam-report/actions';
import * as ContactAction from '../../states/contacts/actions';
import { csamReportBase, namespace, RootState, routingBase } from '../../states';
import { changeRoute } from '../../states/routing/actions';
import { AppRoutes } from '../../states/routing/types';
import { CSAMReportEntry } from '../../types/types';
import {
  ChildCSAMReportForm,
  CounselorCSAMReportForm,
  CSAMReportStatus,
  isChildTaskEntry,
  isCounsellorTaskEntry,
  CSAMReportStateEntry,
  CSAMReportType,
} from '../../states/csam-report/types';
import { addExternalReportEntry } from '../../states/csam-report/existingContactExternalReport';
import { acknowledgeCSAMReport, createCSAMReport } from '../../services/CSAMReportService';
import { getConfig } from '../../HrmFormPlugin';
import { reportToIWF, selfReportToIWF } from '../../services/ServerlessService';
import {
  clearCSAMReportAction,
  newCSAMReportAction,
  newCSAMReportActionForContact,
} from '../../states/csam-report/actions';

export enum CSAMPage {
  ReportTypePicker = 'report-type-picker',
  Form = 'form',
  Status = 'status',
  Loading = 'loading',
}

type SaveReportResponse = { hrmReport: CSAMReportEntry; iwfReport: CSAMReportStatus };

export type CSAMReportApi = {
  currentPage: (state: RootState) => CSAMPage | undefined;
  reportState: (state: RootState) => CSAMReportStateEntry;
  navigationActionDispatcher: (dispatch: Dispatch<unknown>) => (page: CSAMPage, reportType: CSAMReportType) => void;
  exitActionDispatcher: (dispatch: Dispatch<unknown>) => () => void;
  addReportDispatcher: (dispatch: Dispatch<unknown>) => (csamReportEntry: CSAMReportEntry) => void;
  pickReportTypeDispatcher: (dispatch: Dispatch<unknown>) => (reportType: CSAMReportType) => void;
  updateCounsellorReportDispatcher: (dispatch: Dispatch<unknown>) => (csamReportForm: CounselorCSAMReportForm) => void;
  updateChildReportDispatcher: (dispatch: Dispatch<unknown>) => (csamReportForm: ChildCSAMReportForm) => void;
  updateStatusDispatcher: (dispatch: Dispatch<unknown>) => (csamStatus: CSAMReportStatus) => void;
  saveReport: (state: CSAMReportStateEntry) => Promise<SaveReportResponse>;
};

const saveCounsellorReport = async (form: CounselorCSAMReportForm, contactId?: number): Promise<SaveReportResponse> => {
  const iwfResponse = await reportToIWF(form);
  const hrmReport = await createCSAMReport({
    reportType: 'counsellor-generated',
    csamReportId: iwfResponse['IWFReportService1.0'].responseData,
    twilioWorkerId: getConfig().workerSid,
    contactId,
  });
  return { hrmReport, iwfReport: iwfResponse['IWFReportService1.0'] };
};

const saveChildReport = async (form: ChildCSAMReportForm, contactId?: number): Promise<SaveReportResponse> => {
  /* ServerLess API will be called here */
  const storedReport = await createCSAMReport({
    reportType: 'self-generated',
    twilioWorkerId: getConfig().workerSid,
    contactId,
  });

  const caseNumber = storedReport.csamReportId;
  const report = await selfReportToIWF(form, caseNumber);

  const iwfReport = {
    responseCode: report.status,
    responseData: report.reportUrl,
    responseDescription: '',
  };
  const reportToAcknowledge: CSAMReportEntry = storedReport;

  /* If everything went fine, before moving to the next screen acknowledge the record in DB */
  const acknowledged = await acknowledgeCSAMReport(reportToAcknowledge.id);

  return { hrmReport: acknowledged, iwfReport };
};

const saveReport = async (state: CSAMReportStateEntry, contactId?: string): Promise<SaveReportResponse> => {
  const numberContactId = contactId ? Number.parseInt(contactId, 10) : undefined;
  if (isCounsellorTaskEntry(state)) {
    return saveCounsellorReport(state.form, numberContactId);
  } else if (isChildTaskEntry(state)) {
    return saveChildReport(state.form, numberContactId);
  }
  throw new Error('Invalid CSAM state, cannot be saved');
};

export const newContactCSAMApi = (taskSid: string, previousRoute: AppRoutes): CSAMReportApi => ({
  currentPage: (state: RootState) => {
    const { subroute, route } = state[namespace][routingBase].tasks[taskSid];
    if (route === 'csam-report') {
      const [key] = Object.entries(CSAMPage).find(([, v]) => v === subroute) ?? [];
      return CSAMPage[key];
    }
    return undefined;
  },
  reportState: (state: RootState) => state[namespace][csamReportBase].tasks[taskSid],
  navigationActionDispatcher: dispatch => (page, reportType) => {
    if (page === CSAMPage.ReportTypePicker) {
      dispatch(CSAMAction.newCSAMReportAction(taskSid, reportType, false));
    } else if (page === CSAMPage.Form) {
      dispatch(CSAMAction.newCSAMReportAction(taskSid, reportType, true));
    }
    dispatch(
      changeRoute(
        {
          route: 'csam-report',
          subroute: page,
          previousRoute,
        },
        taskSid,
      ),
    );
  },
  exitActionDispatcher: dispatch => () => {
    dispatch(clearCSAMReportAction(taskSid));
    dispatch(changeRoute(previousRoute, taskSid));
  },
  addReportDispatcher: dispatch => csamReportEntry => {
    dispatch(ContactAction.addCSAMReportEntry(csamReportEntry, taskSid));
  },
  pickReportTypeDispatcher: dispatch => reportType => dispatch(newCSAMReportAction(taskSid, reportType, false)),
  updateCounsellorReportDispatcher: dispatch => form => {
    dispatch(CSAMAction.updateCounsellorFormAction(form, taskSid));
  },
  updateChildReportDispatcher: dispatch => form => {
    dispatch(CSAMAction.updateChildFormAction(form, taskSid));
  },
  updateStatusDispatcher: dispatch => csamStatus => {
    dispatch(CSAMAction.updateStatusAction(csamStatus, taskSid));
  },
  saveReport: state => saveReport(state),
});

export const existingContactCSAMApi = (contactId: string): CSAMReportApi => ({
  currentPage: (state: RootState) => {
    const report = state[namespace][csamReportBase].contacts[contactId];
    if (isCounsellorTaskEntry(report) || isChildTaskEntry(report)) {
      if (report.reportStatus) {
        return report.reportStatus.responseCode ? CSAMPage.Status : CSAMPage.Loading;
      }
      return CSAMPage.Form;
    }
    return CSAMPage.ReportTypePicker;
  },
  reportState: (state: RootState) => state[namespace][csamReportBase].contacts[contactId],

  navigationActionDispatcher: dispatch => (page, reportType) => {
    switch (page) {
      case CSAMPage.ReportTypePicker:
        dispatch(CSAMAction.newCSAMReportActionForContact(contactId, reportType, true));
        break;
      case CSAMPage.Form:
        dispatch(CSAMAction.newCSAMReportActionForContact(contactId, reportType, true));
        break;
      case CSAMPage.Loading:
        dispatch(
          CSAMAction.updateStatusActionForContact(
            { responseCode: undefined, responseData: undefined, responseDescription: undefined },
            contactId,
          ),
        );
        break;
      default:
    }
  },
  saveReport: state => saveReport(state, contactId),
  exitActionDispatcher: dispatch => () => {
    // Redundant, navigation is implicit based on draft CSAM report state
    dispatch(CSAMAction.clearCSAMReportActionForContact(contactId));
  },
  addReportDispatcher: dispatch => csamReportEntry => {
    dispatch(addExternalReportEntry(csamReportEntry, contactId));
  },
  pickReportTypeDispatcher: dispatch => reportType =>
    dispatch(newCSAMReportActionForContact(contactId, reportType, false)),
  updateCounsellorReportDispatcher: dispatch => form => {
    dispatch(CSAMAction.updateCounsellorFormActionForContact(form, contactId));
  },
  updateChildReportDispatcher: dispatch => form => {
    dispatch(CSAMAction.updateChildFormActionForContact(form, contactId));
  },
  updateStatusDispatcher: dispatch => csamStatus => {
    dispatch(CSAMAction.updateStatusActionForContact(csamStatus, contactId));
  },
});
