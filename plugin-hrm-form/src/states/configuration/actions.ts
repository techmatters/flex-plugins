import * as t from './types';
import type { FormsVersion } from '../../components/common/forms/types';

// Action creators
export const changeLanguage = (language: string): t.ConfigurationActionType => ({ type: t.CHANGE_LANGUAGE, language });

export const populateCounselorsState = (counselorsList: t.CounselorsList): t.ConfigurationActionType => ({
  type: t.POPULATE_COUNSELORS,
  counselorsList,
});

export const chatCapacityUpdated = (capacity: number): t.ConfigurationActionType => ({
  type: t.CHAT_CAPACITY_UPDATED,
  capacity,
});

export const populateCurrentDefinitionVersion = (definitions: FormsVersion): t.ConfigurationActionType => ({
  type: t.POPULATE_CURRENT_DEFINITION_VERSION,
  definitions,
});

export const updateFormsVersion = (version: string, definitions: FormsVersion): t.ConfigurationActionType => ({
  type: t.UPDATE_FORMS_VERSION,
  version,
  definitions,
});
