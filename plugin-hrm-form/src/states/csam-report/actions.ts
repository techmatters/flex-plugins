import * as t from './types';
import { CSAMReportType } from './types';

// Action creators

export const updateCounsellorFormAction = (
  form: t.CounselorCSAMReportForm,
  taskId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportType.COUNSELLOR,
  taskId,
});
export const updateChildFormAction = (form: t.ChildCSAMReportForm, taskId: string): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportType.CHILD,
  taskId,
});

export const updateStatusAction = (reportStatus: t.CSAMReportStatus, taskId: string): t.CSAMReportActionType => ({
  type: t.UPDATE_STATUS,
  reportStatus,
  taskId,
});

export const clearCSAMReportAction = (taskId: string): t.CSAMReportActionType => ({
  type: t.CLEAR_CSAM_REPORT,
  taskId,
});

export const updateCounsellorFormActionForContact = (
  form: t.CounselorCSAMReportForm,
  contactId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportType.COUNSELLOR,
  contactId,
});

export const updateChildFormActionForContact = (
  form: t.ChildCSAMReportForm,
  contactId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportType.CHILD,
  contactId,
});

export const newCSAMReportActionForContact = (
  contactId: string,
  reportType?: CSAMReportType,
): t.CSAMReportActionType => ({
  type: t.NEW_DRAFT_CSAM_REPORT,
  contactId,
  reportType,
});

export const updateStatusActionForContact = (
  reportStatus: t.CSAMReportStatus,
  contactId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_STATUS,
  reportStatus,
  contactId,
});

export const clearCSAMReportActionForContact = (contactId: string): t.CSAMReportActionType => ({
  type: t.CLEAR_CSAM_REPORT,
  contactId,
});
