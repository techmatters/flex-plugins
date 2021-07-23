import {
  GeneralActionType,
  INITIALIZE_CONTACT_STATE,
  RECREATE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  DefinitionVersion,
} from './types';

export const initializeContactState = (definitions: DefinitionVersion) => (taskId: string): GeneralActionType => ({
  type: INITIALIZE_CONTACT_STATE,
  definitions,
  taskId,
});

export const recreateContactState = (definitions: DefinitionVersion) => (taskId: string): GeneralActionType => ({
  type: RECREATE_CONTACT_STATE,
  definitions,
  taskId,
});

export const removeContactState = (taskId: string): GeneralActionType => ({
  type: REMOVE_CONTACT_STATE,
  taskId,
});
