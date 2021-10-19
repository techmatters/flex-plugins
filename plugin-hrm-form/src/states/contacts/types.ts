import type { TaskEntry } from './reducer';

// Action types
export const UPDATE_FORM = 'UPDATE_FORM';
export const SAVE_END_MILLIS = 'SAVE_END_MILLIS';
export const SET_CATEGORIES_GRID_VIEW = 'SET_CATEGORIES_GRID_VIEW';
export const HANDLE_EXPAND_CATEGORY = 'HANDLE_EXPAND_CATEGORY';
export const HANDLE_SELECT_SEARCH_RESULT = 'HANDLE_SELECT_SEARCH_RESULT';
export const PREPOPULATE_FORM_CHILD = 'PREPOPULATE_FORM_CHILD';
export const PREPOPULATE_FORM_CALLER = 'PREPOPULATE_FORM_CALLER';
export const RESTORE_ENTIRE_FORM = 'RESTORE_ENTIRE_FORM';
export const UPDATE_HELPLINE = 'UPDATE_HELPLINE';

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

type PrePopulateFormChildAction = {
  type: typeof PREPOPULATE_FORM_CHILD;
  firstName: string;
  gender: string;
  age: string;
  ethnicity: string;
  language: string;
  taskId: string;
};

type PrePopulateFormCallerAction = {
  type: typeof PREPOPULATE_FORM_CALLER;
  firstName: string;
  gender: string;
  age: string;
  ethnicity: string;
  language: string;
  taskId: string;
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

export type ContactsActionType =
  | UpdateFormAction
  | SaveEndMillisAction
  | SetCategoriesGridViewAction
  | HandleExpandCategoryAction
  | PrePopulateFormChildAction
  | PrePopulateFormCallerAction
  | RestoreEntireFormAction
  | UpdateHelpline;
