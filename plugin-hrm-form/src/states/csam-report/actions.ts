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
