/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import type { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

import * as t from './types';
import { defaultLanguage } from '../../translations';
import { FETCH_CASE_LIST_FULFILLED_ACTION, FetchCaseListFulfilledAction } from '../caseList/listContent';

export type ConfigurationState = {
  language: string;
  counselors: {
    list: t.CounselorsList;
    hash: { [sid: string]: string };
  };
  workerInfo: { chatChannelCapacity: number };
  definitionVersions: { [version: string]: DefinitionVersion | undefined };
  currentDefinitionVersion?: DefinitionVersion;
};

const initialState: ConfigurationState = {
  language: defaultLanguage,
  counselors: {
    list: [],
    hash: {},
  },
  workerInfo: { chatChannelCapacity: 0 },
  definitionVersions: {},
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(
  state = initialState,
  action: t.ConfigurationActionType | FetchCaseListFulfilledAction,
): ConfigurationState {
  switch (action.type) {
    case t.CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.language,
      };
    case t.POPULATE_COUNSELORS: {
      const sortedList = action.counselorsList.sort((c1, c2) => c1.fullName.localeCompare(c2.fullName));
      const counselorsHash = Object.fromEntries(sortedList.map(({ sid, fullName }) => [sid, fullName]));
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
    case FETCH_CASE_LIST_FULFILLED_ACTION: {
      const { missingDefinitions } = action.payload;
      const missingDefinitionsMap = Object.fromEntries(
        missingDefinitions.map(({ version, definition }) => [version, definition]),
      );
      return {
        ...state,
        definitionVersions: {
          ...state.definitionVersions,
          ...missingDefinitionsMap,
        },
      };
    }
    default:
      return state;
  }
}
