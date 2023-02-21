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

/* eslint-disable import/no-unused-modules */
import { CallTypes, DataCallTypes } from 'hrm-form-definitions';

import * as t from './types';
import { CSAMReportEntry } from '../../types/types';
import { TaskEntry } from './types';

// Action creators
export const updateForm = (
  taskId: string,
  parent: keyof TaskEntry,
  payload: TaskEntry[keyof TaskEntry],
): t.ContactsActionType => ({
  type: t.UPDATE_FORM,
  taskId,
  parent,
  payload,
});

export const updateCallType = (taskId: string, callType: CallTypes | ''): t.ContactsActionType => ({
  type: t.UPDATE_FORM,
  taskId,
  parent: 'callType',
  payload: callType,
});

export const saveEndMillis = (taskId: string): t.ContactsActionType => ({ type: t.SAVE_END_MILLIS, taskId });

export const setCategoriesGridView = (gridView: boolean, taskId: string): t.ContactsActionType => ({
  type: t.SET_CATEGORIES_GRID_VIEW,
  gridView,
  taskId,
});

export const handleExpandCategory = (category: string, taskId: string) => ({
  type: t.HANDLE_EXPAND_CATEGORY,
  category,
  taskId,
});

export const prepopulateForm = (
  callType: DataCallTypes,
  values: { [property: string]: string },
  taskId: string,
  isCaseInfo?: Boolean,
): t.ContactsActionType => ({
  type: t.PREPOPULATE_FORM,
  callType,
  values,
  taskId,
  isCaseInfo,
});

export const restoreEntireForm = (form: TaskEntry, taskId: string): t.ContactsActionType => ({
  type: t.RESTORE_ENTIRE_FORM,
  form,
  taskId,
});

export const updateHelpline = (taskId: string, helpline: string): t.ContactsActionType => ({
  type: t.UPDATE_HELPLINE,
  helpline,
  taskId,
});

export const addCSAMReportEntry = (csamReportEntry: CSAMReportEntry, taskId: string): t.ContactsActionType => ({
  type: t.ADD_CSAM_REPORT_ENTRY,
  csamReportEntry,
  taskId,
});

export const setEditContactPageOpen = (): t.ContactsActionType => ({
  type: t.SET_EDITING_CONTACT,
  editing: true,
});

export const setEditContactPageClosed = (): t.ContactsActionType => ({
  type: t.SET_EDITING_CONTACT,
  editing: false,
});

export const setCallType = (isCallTypeCaller: boolean): t.ContactsActionType => ({
  type: t.SET_CALL_TYPE,
  isCallTypeCaller,
});
