// Action types
export const UPDATE_FORM = 'csam-report/UPDATE_FORM';
export const UPDATE_STATUS = 'csam-report/UPDATE_STATUS';
export const CLEAR_CSAM_REPORT = 'csam-report/CLEAR_CSAM_REPORT';

export type CSAMReportForm = {
  webAddress: string;
  description: string;
  anonymous: boolean;
  firstName: string;
  lastName: string;
  email: string;
};

export type CSAMReportStatus = {
  responseCode: string;
  responseData: string;
  responseDescription: string;
};

type UpdateFormAction = {
  type: typeof UPDATE_FORM;
  form: CSAMReportForm;
  taskId: string;
};

type UpdateStatusAction = {
  type: typeof UPDATE_STATUS;
  reportStatus: CSAMReportStatus;
  taskId: string;
};

type ClearCSAMReport = {
  type: typeof CLEAR_CSAM_REPORT;
  taskId: string;
};

export type CSAMReportActionType = UpdateFormAction | UpdateStatusAction | ClearCSAMReport;
