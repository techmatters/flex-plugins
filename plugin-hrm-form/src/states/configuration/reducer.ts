import * as t from './types';
import { defaultLanguage } from '../../utils/pluginHelpers';
import { createCounselorsHash } from '../helpers';
import type { DefinitionVersion } from '../../components/common/forms/types';

export type ConfigurationState = {
  language: string;
  counselors: {
    list: t.CounselorsList;
    hash: { [sid: string]: string };
  };
  workerInfo: { chatChannelCapacity: number };
  definitionVersions: { [version: string]: DefinitionVersion | undefined };
  currentDefinitionVersion: DefinitionVersion | undefined;
};

const initialState: ConfigurationState = {
  language: defaultLanguage,
  counselors: {
    list: [],
    hash: {},
  },
  workerInfo: { chatChannelCapacity: 0 },
  definitionVersions: {},
  currentDefinitionVersion: undefined,
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
    case t.POPULATE_CURRENT_DEFINITION_VERSION: {
      return {
        ...state,
        currentDefinitionVersion: action.definitions,
      };
    }
    case t.UPDATE_DEFINITION_VERSION: {
      return {
        ...state,
        definitionVersions: {
          ...state.definitionVersions,
          [action.version]: action.definitions,
        },
      };
    }
    default:
      return state;
  }
}
