// Action types
export const UPDATE_FORM = 'csam-report/UPDATE_FORM';

export type CSAMReportForm = {
  webAddress: string;
  description: string;
  anonymous: boolean;
  firstName: string;
  lastName: string;
  email: string;
};

type UpdateFormAction = {
  type: typeof UPDATE_FORM;
  form: CSAMReportForm;
  taskId: string;
};

export type CSAMReportActionType = UpdateFormAction;
