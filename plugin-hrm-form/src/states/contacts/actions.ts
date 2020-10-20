import * as t from './types';

// Action creators
export const initFormAction = (taskSid: string): t.ContactsActionType => ({ type: t.INIT_FORM, taskSid });

export const updateForm = (taskId: string, parent: string, payload: any): t.ContactsActionType => ({
  type: t.UPDATE_FORM,
  taskId,
  parent,
  payload,
});
