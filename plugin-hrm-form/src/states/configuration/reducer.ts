import { ConfigurationActionType, CHANGE_LANGUAGE, POPULATE_COUNSELORS, CounselorsList } from './types';
import { defaultLanguage } from '../../utils/pluginHelpers';
import { createCounselorsHash } from '../helpers';

export type ConfigurationState = {
  language: string;
  counselors: {
    list: CounselorsList;
    hash: { [sid: string]: string };
  };
};

const initialState: ConfigurationState = {
  language: defaultLanguage,
  counselors: {
    list: [],
    hash: {},
  },
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(state = initialState, action: ConfigurationActionType): ConfigurationState {
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
