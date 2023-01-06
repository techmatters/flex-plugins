// Action types

export const UPDATE_FORM = 'csam-report/UPDATE_FORM';
export const UPDATE_STATUS = 'csam-report/UPDATE_STATUS';
export const CLEAR_CSAM_REPORT = 'csam-report/CLEAR_CSAM_REPORT';
export const NEW_DRAFT_CSAM_REPORT = 'csam-report/NEW_DRAFT_CSAM_REPORT';

export enum CSAMReportType {
  CHILD = 'child',
  COUNSELLOR = 'counsellor',
}

export type CounselorCSAMReportForm = {
  webAddress: string;
  description: string;
  anonymous: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ChildCSAMReportForm = {
  childAge: string;
  ageVerified: boolean;
};

export type CSAMReportForm = ChildCSAMReportForm | CounselorCSAMReportForm;

export type CSAMReportStatus = {
  responseCode: string;
  responseData: string;
  responseDescription: string;
};

export type CSAMActionForTask = {
  taskId: string;
};

export type CSAMActionForContact = {
  contactId: string;
};

type UpdateChildFormAction = {
  type: typeof UPDATE_FORM;
  reportType: CSAMReportType.CHILD;
  form: ChildCSAMReportForm;
} & (CSAMActionForContact | CSAMActionForTask);

type UpdateCounselorFormAction = {
  type: typeof UPDATE_FORM;
  reportType: CSAMReportType.COUNSELLOR;
  form: CounselorCSAMReportForm;
} & (CSAMActionForContact | CSAMActionForTask);

type UpdateStatusAction = {
  type: typeof UPDATE_STATUS;
  reportStatus: CSAMReportStatus;
} & (CSAMActionForContact | CSAMActionForTask);

type ClearCSAMReport = {
  type: typeof CLEAR_CSAM_REPORT;
  reportType?: CSAMReportType;
} & (CSAMActionForContact | CSAMActionForTask);

type NewDraftCSAMReport = {
  type: typeof NEW_DRAFT_CSAM_REPORT;
  reportType?: CSAMReportType;
} & (CSAMActionForContact | CSAMActionForTask);

export type CSAMReportActionType =
  | UpdateChildFormAction
  | UpdateCounselorFormAction
  | UpdateStatusAction
  | ClearCSAMReport
  | NewDraftCSAMReport;

export const isCSAMActionForContact = (
  action: CSAMReportActionType,
): action is CSAMReportActionType & CSAMActionForContact =>
  typeof (action as CSAMActionForContact).contactId === 'string';

export const isCounselorCSAMReportForm = (c: CSAMReportForm): c is CounselorCSAMReportForm => {
  return (c as CounselorCSAMReportForm) !== null;
};
