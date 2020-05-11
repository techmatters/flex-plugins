import { CHANGE_LANGUAGE } from './ActionTypes';

// default language to initialize plugin
export const defaultLanguage = 'en-US';

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
