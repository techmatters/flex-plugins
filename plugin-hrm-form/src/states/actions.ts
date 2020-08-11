import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from './types';

export const initializeContactState = (taskId: string): GeneralActionType => ({
  type: INITIALIZE_CONTACT_STATE,
  taskId,
});

export const recreateContactState = (taskId: string): GeneralActionType => ({
  type: RECREATE_CONTACT_STATE,
  taskId,
});

export const removeContactState = (taskId: string): GeneralActionType => ({
  type: REMOVE_CONTACT_STATE,
  taskId,
});
