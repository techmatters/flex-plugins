import * as t from './types';

// Action creators

export const updateFormAction = (form: t.CSAMCLCReportForm, taskId: string): t.CSAMCLCReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  taskId,
});

export const updateStatusAction = (reportStatus: t.CSAMCLCReportStatus, taskId: string): t.CSAMCLCReportActionType => ({
  type: t.UPDATE_STATUS,
  reportStatus,
  taskId,
});

export const clearCSAMCLCReportAction = (taskId: string): t.CSAMCLCReportActionType => ({
  type: t.CLEAR_CSAM_CLC_REPORT,
  taskId,
});
