/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

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

export type CSAMActionForContact = {
  contactId: string;
};

type UpdateChildFormAction = {
  type: typeof UPDATE_FORM;
  reportType: typeof CSAMReportTypes.CHILD;
  form: ChildCSAMReportForm;
  contactId: string;
};

type UpdateCounselorFormAction = {
  type: typeof UPDATE_FORM;
  reportType: typeof CSAMReportTypes.COUNSELLOR;
  form: CounselorCSAMReportForm;
  contactId: string;
};

type UpdateStatusAction = {
  type: typeof UPDATE_STATUS;
  reportStatus: CSAMReportStatus;
  contactId: string;
};

type RemoveDraftCSAMReportAction = {
  type: typeof REMOVE_DRAFT_CSAM_REPORT;
  reportType?: CSAMReportType;
  contactId: string;
};

type NewDraftCSAMReport = {
  type: typeof NEW_DRAFT_CSAM_REPORT;
  reportType?: CSAMReportType;
  createForm?: boolean;
  contactId: string;
};

export type CSAMReportActionType =
  | UpdateChildFormAction
  | UpdateCounselorFormAction
  | UpdateStatusAction
  | RemoveDraftCSAMReportAction
  | NewDraftCSAMReport;

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
