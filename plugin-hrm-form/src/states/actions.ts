import {
  GeneralActionType,
  INITIALIZE_CONTACT_STATE,
  RECREATE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  DefinitionsObject,
} from './types';

export const initializeContactState = (definitions: DefinitionsObject) => (taskId: string): GeneralActionType => ({
  type: INITIALIZE_CONTACT_STATE,
  definitions,
  taskId,
});

export const recreateContactState = (definitions: DefinitionsObject) => (taskId: string): GeneralActionType => ({
  type: RECREATE_CONTACT_STATE,
  definitions,
  taskId,
});

export const removeContactState = (taskId: string): GeneralActionType => ({
  type: REMOVE_CONTACT_STATE,
  taskId,
});
