import { DataCallTypes } from 'hrm-form-definitions';

import type { TaskEntry } from './reducer';
import { CSAMReportEntry } from '../../types/types';

// Action types
export const UPDATE_FORM = 'UPDATE_FORM';
export const SAVE_END_MILLIS = 'SAVE_END_MILLIS';
export const SET_CATEGORIES_GRID_VIEW = 'SET_CATEGORIES_GRID_VIEW';
export const HANDLE_EXPAND_CATEGORY = 'HANDLE_EXPAND_CATEGORY';
export const HANDLE_SELECT_SEARCH_RESULT = 'HANDLE_SELECT_SEARCH_RESULT';
export const PREPOPULATE_FORM = 'PREPOPULATE_FORM';
export const RESTORE_ENTIRE_FORM = 'RESTORE_ENTIRE_FORM';
export const UPDATE_HELPLINE = 'UPDATE_HELPLINE';
export const ADD_CSAM_REPORT_ENTRY = 'contacts/ADD_CSAM_REPORT_ENTRY';
export const SET_EDITING_CONTACT = 'SET_EDITING_CONTACT';
export const SET_CALL_TYPE = 'SET_CALL_TYPE';

type UpdateFormAction = {
  type: typeof UPDATE_FORM;
  taskId: string;
  parent: keyof TaskEntry;
  payload: any;
};

type SaveEndMillisAction = {
  type: typeof SAVE_END_MILLIS;
  taskId: string;
};

type SetCategoriesGridViewAction = {
  type: typeof SET_CATEGORIES_GRID_VIEW;
  gridView: boolean;
  taskId: string;
};

type HandleExpandCategoryAction = {
  type: typeof HANDLE_EXPAND_CATEGORY;
  category: string;
  taskId: string;
};

type PrePopulateFormAction = {
  type: typeof PREPOPULATE_FORM;
  callType: DataCallTypes;
  values: { [property: string]: string };
  taskId: string;
  isCaseInfo: Boolean;
};

type RestoreEntireFormAction = {
  type: typeof RESTORE_ENTIRE_FORM;
  form: TaskEntry;
  taskId: string;
};

type UpdateHelpline = {
  type: typeof UPDATE_HELPLINE;
  helpline: string;
  taskId: string;
};

type AddCSAMReportEntry = {
  type: typeof ADD_CSAM_REPORT_ENTRY;
  csamReportEntry: CSAMReportEntry;
  taskId: string;
};

type SetEditingContact = {
  type: typeof SET_EDITING_CONTACT;
  editing: boolean;
};

type CheckButtonDataAction = { type: typeof SET_CALL_TYPE; isCallTypeCaller: boolean };

export type ContactsActionType =
  | UpdateFormAction
  | SaveEndMillisAction
  | SetCategoriesGridViewAction
  | HandleExpandCategoryAction
  | PrePopulateFormAction
  | RestoreEntireFormAction
  | UpdateHelpline
  | AddCSAMReportEntry
  | SetEditingContact
  | CheckButtonDataAction;
