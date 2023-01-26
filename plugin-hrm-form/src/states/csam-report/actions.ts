import * as t from './types';
import { CSAMReportType, CSAMReportTypes } from './types';

// Action creators
export const updateCounsellorFormAction = (
  form: t.CounselorCSAMReportForm,
  taskId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportTypes.COUNSELLOR,
  taskId,
});

export const updateChildFormAction = (form: t.ChildCSAMReportForm, taskId: string): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportTypes.CHILD,
  taskId,
});

export const updateStatusAction = (reportStatus: t.CSAMReportStatus, taskId: string): t.CSAMReportActionType => ({
  type: t.UPDATE_STATUS,
  reportStatus,
  taskId,
});

export const removeCSAMReportAction = (taskId: string): t.CSAMReportActionType => ({
  type: t.REMOVE_DRAFT_CSAM_REPORT,
  taskId,
});

export const updateCounsellorFormActionForContact = (
  form: t.CounselorCSAMReportForm,
  contactId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportTypes.COUNSELLOR,
  contactId,
});

export const updateChildFormActionForContact = (
  form: t.ChildCSAMReportForm,
  contactId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  reportType: CSAMReportTypes.CHILD,
  contactId,
});

export const newCSAMReportAction = (
  taskId: string,
  reportType?: CSAMReportType,
  createForm: boolean = false,
): t.CSAMReportActionType => ({
  type: t.NEW_DRAFT_CSAM_REPORT,
  taskId,
  reportType,
  createForm,
});

export const newCSAMReportActionForContact = (
  contactId: string,
  reportType?: CSAMReportType,
  createForm: boolean = false,
): t.CSAMReportActionType => ({
  type: t.NEW_DRAFT_CSAM_REPORT,
  contactId,
  reportType,
  createForm,
});

export const updateStatusActionForContact = (
  reportStatus: t.CSAMReportStatus,
  contactId: string,
): t.CSAMReportActionType => ({
  type: t.UPDATE_STATUS,
  reportStatus,
  contactId,
});

export const removeCSAMReportActionForContact = (contactId: string): t.CSAMReportActionType => ({
  type: t.REMOVE_DRAFT_CSAM_REPORT,
  contactId,
});
