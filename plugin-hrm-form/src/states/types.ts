import type { DefinitionVersion } from 'hrm-form-definitions';

export type { DefinitionVersion };

// Action types
export const INITIALIZE_CONTACT_STATE = 'INITIALIZE_CONTACT_STATE';
export const RECREATE_CONTACT_STATE = 'RECREATE_CONTACT_STATE';
export const REMOVE_CONTACT_STATE = 'REMOVE_CONTACT_STATE';

type InitializeContactStateAction = {
  type: typeof INITIALIZE_CONTACT_STATE;
  definitions: DefinitionVersion;
  taskId: string;
};

type RecreateContactStateAction = {
  type: typeof RECREATE_CONTACT_STATE;
  definitions: DefinitionVersion;
  taskId: string;
};

type RemoveContactStateAction = {
  type: typeof REMOVE_CONTACT_STATE;
  taskId: string;
};

export type GeneralActionType = InitializeContactStateAction | RecreateContactStateAction | RemoveContactStateAction;
