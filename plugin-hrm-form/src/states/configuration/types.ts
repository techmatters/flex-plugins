import type { FormsVersion } from '../../components/common/forms/types';

// Action types
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
export const POPULATE_COUNSELORS = 'POPULATE_COUNSELORS';
export const CHAT_CAPACITY_UPDATED = 'CHAT_CAPACITY_UPDATED';
export const POPULATE_CURRENT_DEFINITION_VERSION = 'POPULATE_CURRENT_DEFINITION_VERSION';
export const UPDATE_FORMS_VERSION = 'UPDATE_FORMS_VERSION';

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
  definitions: FormsVersion;
};

type UpdateFormsVersion = {
  type: typeof UPDATE_FORMS_VERSION;
  version: string;
  definitions: FormsVersion;
};

export type ConfigurationActionType =
  | ChangeLanguageAction
  | PopulateCounselorsAction
  | ChatCapacityUpdatedAction
  | PopulateCurrentDefinitionVersion
  | UpdateFormsVersion;
