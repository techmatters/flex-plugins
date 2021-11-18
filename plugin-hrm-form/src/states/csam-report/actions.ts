import * as t from './types';

// Action creators

export const updateFormAction = (form: t.CSAMReportForm, taskId: string): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  taskId,
});

export const updateStatusAction = (reportStatus: t.CSAMReportStatus, taskId: string): t.CSAMReportActionType => ({
  type: t.UPDATE_STATUS,
  reportStatus,
  taskId,
});

export const clearCSAMReportAction = (taskId: string) => ({
  type: t.CLEAR_CSAM_REPORT,
  taskId,
});
