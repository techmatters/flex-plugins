import * as t from './types';
import { defaultLanguage } from '../../utils/pluginHelpers';
import { createCounselorsHash } from '../helpers';

export type ConfigurationState = {
  language: string;
  counselors: {
    list: t.CounselorsList;
    hash: { [sid: string]: string };
  };
  workerInfo: { chatChannelCapacity: number };
};

const initialState: ConfigurationState = {
  language: defaultLanguage,
  counselors: {
    list: [],
    hash: {},
  },
  workerInfo: { chatChannelCapacity: 0 },
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(state = initialState, action: t.ConfigurationActionType): ConfigurationState {
  switch (action.type) {
    case t.CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.language,
      };
    case t.POPULATE_COUNSELORS: {
      const counselorsHash = createCounselorsHash(action.counselorsList);
      return {
        ...state,
        counselors: { list: action.counselorsList, hash: counselorsHash },
      };
    }
    case t.CHAT_CAPACITY_UPDATED: {
      return {
        ...state,
        workerInfo: {
          ...state.workerInfo,
          chatChannelCapacity: action.capacity,
        },
      };
    }
    default:
      return state;
  }
}
