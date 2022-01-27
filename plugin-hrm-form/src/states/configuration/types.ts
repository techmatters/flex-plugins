import type { DefinitionVersion } from 'hrm-form-definitions';

// Action types
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
export const POPULATE_COUNSELORS = 'POPULATE_COUNSELORS';
export const CHAT_CAPACITY_UPDATED = 'CHAT_CAPACITY_UPDATED';
export const POPULATE_CURRENT_DEFINITION_VERSION = 'POPULATE_CURRENT_DEFINITION_VERSION';
export const UPDATE_DEFINITION_VERSION = 'UPDATE_DEFINITION_VERSION';

export type CounselorsList = {
  sid: string;
  fullName: string;
}[];

type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE;
  language: string;
};

type PopulateCounselorsAction = {
  type: typeof POPULATE_COUNSELORS;
  counselorsList: CounselorsList;
};

type ChatCapacityUpdatedAction = {
  type: typeof CHAT_CAPACITY_UPDATED;
  capacity: number;
};

type PopulateCurrentDefinitionVersion = {
  type: typeof POPULATE_CURRENT_DEFINITION_VERSION;
  definitions: DefinitionVersion;
};

type UpdateDefinitionVersion = {
  type: typeof UPDATE_DEFINITION_VERSION;
  version: string;
  definitions: DefinitionVersion;
};

export type ConfigurationActionType =
  | ChangeLanguageAction
  | PopulateCounselorsAction
  | ChatCapacityUpdatedAction
  | PopulateCurrentDefinitionVersion
  | UpdateDefinitionVersion;
