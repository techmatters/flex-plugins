import * as t from './types';

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
