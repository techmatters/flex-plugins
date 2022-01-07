import type { DefinitionVersion } from 'hrm-form-definitions';

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
      const sortedList = action.counselorsList.sort((c1, c2) => c1.fullName.localeCompare(c2.fullName));
      const counselorsHash = createCounselorsHash(sortedList);
      return {
        ...state,
        counselors: {
          list: sortedList,
          hash: counselorsHash,
        },
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
