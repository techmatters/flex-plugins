/* eslint-disable import/no-unused-modules */
import * as t from './types';
import { TaskEntry } from './reducer';
import { CallTypes } from '../DomainConstants';

// Action creators
export const initFormAction = (taskId: string): t.ContactsActionType => ({ type: t.INIT_FORM, taskId });

export const updateForm = (taskId: string, parent: keyof TaskEntry, payload: any): t.ContactsActionType => ({
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
