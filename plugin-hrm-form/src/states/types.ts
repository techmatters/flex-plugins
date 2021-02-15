import type { DefinitionVersion } from '../components/common/forms/types';

// Action types
export const INITIALIZE_CONTACT_STATE = 'INITIALIZE_CONTACT_STATE';
export const RECREATE_CONTACT_STATE = 'RECREATE_CONTACT_STATE';
export const REMOVE_CONTACT_STATE = 'REMOVE_CONTACT_STATE';

// Type currently used for grouping the form definitions, but it might include more later on.
export type ContactFormDefinition = DefinitionVersion['tabbedForms'];

type InitializeContactStateAction = {
  type: typeof INITIALIZE_CONTACT_STATE;
  definitions: ContactFormDefinition;
  taskId: string;
};

type RecreateContactStateAction = {
  type: typeof RECREATE_CONTACT_STATE;
  definitions: ContactFormDefinition;
  taskId: string;
};

type RemoveContactStateAction = {
  type: typeof REMOVE_CONTACT_STATE;
  taskId: string;
};

export type GeneralActionType = InitializeContactStateAction | RecreateContactStateAction | RemoveContactStateAction;
