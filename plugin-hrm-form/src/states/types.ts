// Action types
export const INITIALIZE_CONTACT_STATE = 'INITIALIZE_CONTACT_STATE';
export const REMOVE_CONTACT_STATE = 'REMOVE_CONTACT_STATE';

type InitializeContactStateAction = {
  type: typeof INITIALIZE_CONTACT_STATE;
  taskId: string;
};

type RemoveContactStateAction = {
  type: typeof REMOVE_CONTACT_STATE;
  taskId: string;
};

export type GeneralActionType = InitializeContactStateAction | RemoveContactStateAction;
