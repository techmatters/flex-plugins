/* eslint-disable import/no-unused-modules */
import * as t from './types';
import { TaskEntry } from './reducer';
import { CallTypes } from '../DomainConstants';

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

export const prepopulateFormChild = (gender: string, age: string, taskId: string): t.ContactsActionType => ({
  type: t.PREPOPULATE_FORM_CHILD,
  gender,
  age,
  taskId,
});

export const prepopulateFormCaller = (gender: string, age: string, taskId: string): t.ContactsActionType => ({
  type: t.PREPOPULATE_FORM_CALLER,
  gender,
  age,
  taskId,
});

export const restoreEntireForm = (form: TaskEntry, taskId: string): t.ContactsActionType => ({
  type: t.RESTORE_ENTIRE_FORM,
  form,
  taskId,
});
