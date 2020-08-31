import { ConfigurationActionType, CHANGE_LANGUAGE, POPULATE_COUNSELORS, CounselorsList } from './types';

// Action creators
export const changeLanguage = (language: string): ConfigurationActionType => ({ type: CHANGE_LANGUAGE, language });

export const populateCounselorsState = (counselorsList: CounselorsList) => ({
  type: POPULATE_COUNSELORS,
  counselorsList,
});
