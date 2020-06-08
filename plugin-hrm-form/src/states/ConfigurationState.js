import { CHANGE_LANGUAGE } from './ActionTypes';
import { defaultLanguage } from '../utils/pluginHelpers';

export const changeLanguage = language => ({ type: CHANGE_LANGUAGE, language });

const initialState = {
  language: defaultLanguage,
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.language,
      };
    default:
      return state;
  }
}
