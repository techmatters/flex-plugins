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

import { Dispatch } from 'react';

import * as CSAMAction from '../../states/csam-report/actions';
import { RootState } from '../../states';
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
import { reportToIWF, selfReportToIWF } from '../../services/iwfService';
import { newCSAMReportActionForContact } from '../../states/csam-report/actions';
import { csamReportBase, namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';

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
  saveReport: (state: CSAMReportStateEntry, twilioWorkerId: string) => Promise<SaveReportResponse>;
};

const saveCounsellorReport = async (
  form: CounselorCSAMReportForm,
  twilioWorkerId: string,
  contactId?: number,
): Promise<SaveReportResponse> => {
  const iwfResponse = await reportToIWF(form);
  const hrmReport = await createCSAMReport({
    reportType: 'counsellor-generated',
    csamReportId: iwfResponse['IWFReportService1.0'].responseData,
    twilioWorkerId,
    contactId,
  });
  return { hrmReport, iwfReport: iwfResponse['IWFReportService1.0'] };
};

const saveChildReport = async (
  form: ChildCSAMReportForm,
  twilioWorkerId: string,
  contactId?: number,
): Promise<SaveReportResponse> => {
  /* ServerLess API will be called here */
  const storedReport = await createCSAMReport({
    reportType: 'self-generated',
    twilioWorkerId,
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

const saveReport = async (
  state: CSAMReportStateEntry,
  twilioWorkerId: string,
  contactId: string,
): Promise<SaveReportResponse> => {
  const numberContactId = contactId ? Number.parseInt(contactId, 10) : undefined;
  if (Number.isNaN(numberContactId)) {
    throw new Error(
      `Only integer contact IDs are currently supported. '${contactId}' could not be parsed as an integer`,
    );
  }
  if (isCounsellorTaskEntry(state)) {
    return saveCounsellorReport(state.form, twilioWorkerId, numberContactId);
  } else if (isChildTaskEntry(state)) {
    return saveChildReport(state.form, twilioWorkerId, numberContactId);
  }
  throw new Error('Invalid CSAM state, cannot be saved');
};

export const newContactCSAMApi = (contactId: string, taskSid: string, previousRoute: AppRoutes): CSAMReportApi => ({
  currentPage: (state: RootState) => {
    const routing = getCurrentTopmostRouteForTask(state[namespace].routing, taskSid);
    if (routing.route === 'csam-report') {
      const [key] = Object.entries(CSAMPage).find(([, v]) => v === routing.subroute) ?? [];
      return CSAMPage[key];
    }
    return undefined;
  },
  reportState: (state: RootState) => state[namespace][csamReportBase].contacts[contactId],
  navigationActionDispatcher: dispatch => (page, reportType) => {
    if (page === CSAMPage.ReportTypePicker) {
      dispatch(CSAMAction.newCSAMReportActionForContact(contactId, reportType, false));
    } else if (page === CSAMPage.Form) {
      dispatch(CSAMAction.newCSAMReportActionForContact(contactId, reportType, true));
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
    dispatch(CSAMAction.removeCSAMReportActionForContact(contactId));
    dispatch(changeRoute(previousRoute, taskSid));
  },
  addReportDispatcher: dispatch => csamReportEntry => {
    dispatch(addExternalReportEntry(csamReportEntry, contactId));
  },
  pickReportTypeDispatcher: dispatch => reportType =>
    dispatch(CSAMAction.newCSAMReportActionForContact(contactId, reportType, false)),
  updateCounsellorReportDispatcher: dispatch => form => {
    dispatch(CSAMAction.updateCounsellorFormActionForContact(form, contactId));
  },
  updateChildReportDispatcher: dispatch => form => {
    dispatch(CSAMAction.updateChildFormActionForContact(form, contactId));
  },
  updateStatusDispatcher: dispatch => csamStatus => {
    dispatch(CSAMAction.updateStatusActionForContact(csamStatus, contactId));
  },
  saveReport: (state, twilioWorkerId) => saveReport(state, twilioWorkerId, contactId),
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
      case CSAMPage.ReportTypePicker: // Not used in the new contact scenario
        dispatch(CSAMAction.newCSAMReportActionForContact(contactId, reportType, false));
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
  saveReport: (state, twilioWorkerId) => saveReport(state, twilioWorkerId, contactId),
  exitActionDispatcher: dispatch => () => {
    // Redundant, navigation is implicit based on draft CSAM report state
    dispatch(CSAMAction.removeCSAMReportActionForContact(contactId));
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
