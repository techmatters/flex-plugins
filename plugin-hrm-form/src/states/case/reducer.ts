import { omit } from 'lodash';
import { v4 as uuidV4 } from 'uuid';

import { Case, CaseItemEntry } from '../../types/types';
import {
  CaseActionType,
  INIT_CASE_SECTION_WORKING_COPY,
  MARK_CASE_AS_UPDATED,
  REMOVE_CASE_SECTION_WORKING_COPY,
  REMOVE_CONNECTED_CASE,
  SET_CONNECTED_CASE,
  TemporaryCaseInfo,
  UPDATE_CASE_CONTACT,
  UPDATE_CASE_INFO,
  UPDATE_CASE_SECTION_WORKING_COPY,
  UPDATE_CASE_STATUS,
  UPDATE_TEMP_INFO,
} from './types';
import { GeneralActionType, REMOVE_CONTACT_STATE } from '../types';

export type CaseWorkingCopy = {
  sections: {
    [section: string]: {
      new?: CaseItemEntry;
      existing: { [id: string]: CaseItemEntry };
    };
  };
  summary?: CaseItemEntry;
};

export type CaseState = {
  tasks: {
    [taskId: string]: {
      connectedCase: Case;
      temporaryCaseInfo?: TemporaryCaseInfo;
      prevStatus: string; // the status as it comes from the DB (required as it may be locally updated in connectedCase)
      caseWorkingCopy: CaseWorkingCopy;
    };
  };
};

const initialState: CaseState = {
  tasks: {},
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(state = initialState, action: CaseActionType | GeneralActionType): CaseState {
  switch (action.type) {
    case SET_CONNECTED_CASE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            connectedCase: action.connectedCase,
            temporaryCaseInfo: null,
            prevStatus: action.connectedCase.status,
            caseWorkingCopy: { sections: {} },
          },
        },
      };
    case REMOVE_CONNECTED_CASE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    // eslint-disable-next-line sonarjs/no-duplicated-branches
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case UPDATE_CASE_INFO: {
      const { connectedCase } = state.tasks[action.taskId];
      const updatedCase = { ...connectedCase, info: action.info };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            connectedCase: updatedCase,
            temporaryCaseInfo: null,
          },
        },
      };
    }
    case UPDATE_TEMP_INFO:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            temporaryCaseInfo: action.value,
          },
        },
      };
    case UPDATE_CASE_SECTION_WORKING_COPY:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            caseWorkingCopy: action.api.updateWorkingCopy(
              state.tasks[action.taskId]?.caseWorkingCopy,
              action.sectionItem,
              action.id,
            ),
          },
        },
      };
    case INIT_CASE_SECTION_WORKING_COPY:
      const item: CaseItemEntry = action.id
        ? action.api.toForm(action.api.getSectionItemById(state.tasks[action.taskId].connectedCase.info, action.id))
        : { id: uuidV4(), form: {}, createdAt: null, twilioWorkerId: null };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            caseWorkingCopy: action.api.updateWorkingCopy(state.tasks[action.taskId]?.caseWorkingCopy, item, action.id),
          },
        },
      };
    case REMOVE_CASE_SECTION_WORKING_COPY:
      const caseWorkingCopy = state.tasks[action.taskId]?.caseWorkingCopy;
      if (caseWorkingCopy) {
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [action.taskId]: {
              ...state.tasks[action.taskId],
              caseWorkingCopy: action.api.updateWorkingCopy(caseWorkingCopy, undefined, action.id),
            },
          },
        };
      }
      return state;
    case UPDATE_CASE_STATUS:
      const { connectedCase } = state.tasks[action.taskId];
      const updatedCase = { ...connectedCase, status: action.status };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            connectedCase: updatedCase,
          },
        },
      };
    case MARK_CASE_AS_UPDATED:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
          },
        },
      };
    case UPDATE_CASE_CONTACT:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            connectedCase: {
              ...state.tasks[action.taskId].connectedCase,
              connectedContacts: (state.tasks[action.taskId].connectedCase.connectedContacts ?? []).map(cc =>
                cc.id === action.contact.id ? action.contact : cc,
              ),
            },
          },
        },
      };
    default:
      return state;
  }
}
