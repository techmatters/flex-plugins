/* eslint-disable import/no-unused-modules */
import * as t from './types';

// Action creators
export const initFormAction = (taskId: string): t.ContactsActionType => ({ type: t.INIT_FORM, taskId });

export const updateForm = (taskId: string, parent: string, payload: any): t.ContactsActionType => ({
  type: t.UPDATE_FORM,
  taskId,
  parent,
  payload,
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
