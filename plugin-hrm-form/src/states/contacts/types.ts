// Action types
export const INIT_FORM = 'INIT_FORM';
export const UPDATE_FORM = 'UPDATE_FORM';

type InitFormAction = {
  type: typeof INIT_FORM;
  taskSid: string;
};

type UpdateForm = {
  type: typeof UPDATE_FORM;
  taskId: string;
  parent: string;
  payload: any;
};

export type ContactsActionType = InitFormAction | UpdateForm;
