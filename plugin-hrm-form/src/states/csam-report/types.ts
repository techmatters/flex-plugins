// Action types
export const UPDATE_FORM = 'csam-report/UPDATE_FORM';
export const UPDATE_STATUS = 'csam-report/UPDATE_STATUS';
export const REMOVE_DRAFT_CSAM_REPORT = 'csam-report/CLEAR_CSAM_REPORT';
export const NEW_DRAFT_CSAM_REPORT = 'csam-report/NEW_DRAFT_CSAM_REPORT';

export const CSAMReportTypes = {
  CHILD: 'child',
  COUNSELLOR: 'counsellor',
};

const ConstCSAMReportTypes = {
  ...CSAMReportTypes,
} as const;

export type CSAMReportType = typeof ConstCSAMReportTypes[keyof typeof ConstCSAMReportTypes];

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
  reportType: typeof CSAMReportTypes.CHILD;
  form: ChildCSAMReportForm;
} & (CSAMActionForContact | CSAMActionForTask);

type UpdateCounselorFormAction = {
  type: typeof UPDATE_FORM;
  reportType: typeof CSAMReportTypes.COUNSELLOR;
  form: CounselorCSAMReportForm;
} & (CSAMActionForContact | CSAMActionForTask);

type UpdateStatusAction = {
  type: typeof UPDATE_STATUS;
  reportStatus: CSAMReportStatus;
} & (CSAMActionForContact | CSAMActionForTask);

type RemoveDraftCSAMReportAction = {
  type: typeof REMOVE_DRAFT_CSAM_REPORT;
  reportType?: CSAMReportType;
} & (CSAMActionForContact | CSAMActionForTask);

type NewDraftCSAMReport = {
  type: typeof NEW_DRAFT_CSAM_REPORT;
  reportType?: CSAMReportType;
  createForm?: boolean;
} & (CSAMActionForContact | CSAMActionForTask);

export type CSAMReportActionType =
  | UpdateChildFormAction
  | UpdateCounselorFormAction
  | UpdateStatusAction
  | RemoveDraftCSAMReportAction
  | NewDraftCSAMReport;

export const isCSAMActionForContact = (
  action: CSAMReportActionType,
): action is CSAMReportActionType & CSAMActionForContact =>
  typeof (action as CSAMActionForContact).contactId === 'string';

export const isCounselorCSAMReportForm = (c: CSAMReportForm): c is CounselorCSAMReportForm => {
  return (c as CounselorCSAMReportForm) !== null;
};

type CSAMReportStateEntryForCounsellorReport = {
  form: CounselorCSAMReportForm;
  reportType: typeof CSAMReportTypes.COUNSELLOR;
  reportStatus: CSAMReportStatus;
};

type CSAMReportStateEntryForChildReport = {
  form: ChildCSAMReportForm;
  reportType: typeof CSAMReportTypes.CHILD;
  reportStatus: CSAMReportStatus;
};

export type CSAMReportStateEntry =
  | CSAMReportStateEntryForCounsellorReport
  | CSAMReportStateEntryForChildReport
  | { reportType?: CSAMReportType };

export const isCounsellorTaskEntry = (t: CSAMReportStateEntry): t is CSAMReportStateEntryForCounsellorReport =>
  (t as CSAMReportStateEntryForCounsellorReport).form && t.reportType === CSAMReportTypes.COUNSELLOR;
export const isChildTaskEntry = (t: CSAMReportStateEntry): t is CSAMReportStateEntryForChildReport =>
  (t as CSAMReportStateEntryForChildReport).form && t.reportType === CSAMReportTypes.CHILD;
