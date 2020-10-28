// Action types
export const INIT_FORM = 'INIT_FORM';
export const UPDATE_FORM = 'UPDATE_FORM';
export const SAVE_END_MILLIS = 'SAVE_END_MILLIS';
export const SET_CATEGORIES_GRID_VIEW = 'SET_CATEGORIES_GRID_VIEW';
export const HANDLE_EXPAND_CATEGORY = 'HANDLE_EXPAND_CATEGORY';

type InitFormAction = {
  type: typeof INIT_FORM;
  taskId: string;
};

type UpdateForm = {
  type: typeof UPDATE_FORM;
  taskId: string;
  parent: string;
  payload: any;
};

type SaveEndMillis = {
  type: typeof SAVE_END_MILLIS;
  taskId: string;
};

type SetCategoriesGridView = {
  type: typeof SET_CATEGORIES_GRID_VIEW;
  gridView: boolean;
  taskId: string;
};

type HandleExpandCategory = {
  type: typeof HANDLE_EXPAND_CATEGORY;
  category: string;
  taskId: string;
};

export type ContactsActionType =
  | InitFormAction
  | UpdateForm
  | SaveEndMillis
  | SetCategoriesGridView
  | HandleExpandCategory;
