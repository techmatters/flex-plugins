import { CHANGE_LANGUAGE, POPULATE_COUNSELORS } from './ActionTypes';
import { defaultLanguage } from '../utils/pluginHelpers';
import { createCounselorsHash } from './helpers';

export const changeLanguage = language => ({ type: CHANGE_LANGUAGE, language });

export const populateCounselorsState = counselorsList => ({ type: POPULATE_COUNSELORS, counselorsList });

const initialState = {
  language: defaultLanguage,
  counselors: {
    list: [],
    hash: {},
  },
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.language,
      };
    case POPULATE_COUNSELORS: {
      const counselorsHash = createCounselorsHash(action.counselorsList);
      return {
        ...state,
        counselors: { list: action.counselorsList, hash: counselorsHash },
      };
    }
    default:
      return state;
  }
}
