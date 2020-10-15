// Action types
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
export const POPULATE_COUNSELORS = 'POPULATE_COUNSELORS';
export const CHAT_CAPACITY_UPDATED = 'CHAT_CAPACITY_UPDATED';

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

export type ConfigurationActionType = ChangeLanguageAction | PopulateCounselorsAction | ChatCapacityUpdatedAction;
