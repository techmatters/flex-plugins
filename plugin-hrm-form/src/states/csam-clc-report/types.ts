// Action types
export const UPDATE_FORM = 'csam-clc-report/UPDATE_FORM';
export const UPDATE_STATUS = 'csam-clc-report/UPDATE_STATUS';
export const CLEAR_CSAM_CLC_REPORT = 'csam-clc-report/CLEAR_CSAM_CLC_REPORT';

export type CSAMCLCReportForm = {
  childAge: string;
  ageVerified: boolean;
};

export type CSAMCLCReportStatus = {
  responseCode: string;
  responseData: string;
  responseDescription: string;
};

type UpdateFormAction = {
  type: typeof UPDATE_FORM;
  form: CSAMCLCReportForm;
  taskId: string;
};

type UpdateStatusAction = {
  type: typeof UPDATE_STATUS;
  reportStatus: CSAMCLCReportStatus;
  taskId: string;
};

type ClearCSAMCLCReport = {
  type: typeof CLEAR_CSAM_CLC_REPORT;
  taskId: string;
};

export type CSAMCLCReportActionType = UpdateFormAction | UpdateStatusAction | ClearCSAMCLCReport;
