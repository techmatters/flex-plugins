import * as t from './types';

// Action creators

export const updateFormAction = (form: t.CSAMReportForm, taskId: string): t.CSAMReportActionType => ({
  type: t.UPDATE_FORM,
  form,
  taskId,
});
