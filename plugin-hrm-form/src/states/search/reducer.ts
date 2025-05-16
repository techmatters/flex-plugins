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

import { omit } from 'lodash';

import * as t from './types';
import { newSearchFormEntry, PreviousContactCounts, SearchResultReferences } from './types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import { Contact, standaloneTaskSid } from '../../types/types';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../../components/common/ContactDetails';
import {
  CONNECT_TO_CASE_ACTION_FULFILLED,
  ContactConnectingAction,
  ContactUpdatingAction,
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED,
  UPDATE_CONTACT_ACTION_FULFILLED,
} from '../contacts/types';
import { CaseUpdatingAction, CREATE_CASE_ACTION_FULFILLED } from '../case/types';

export type SearchStateTaskEntry = {
  form: t.SearchFormValues;
  detailsExpanded: {
    [key in ContactDetailsSectionsType]: boolean;
  };
  searchContactsResult: SearchResultReferences;
  searchCasesResult: SearchResultReferences;
  previousContactCounts?: PreviousContactCounts;
  isRequesting: boolean;
  isRequestingCases: boolean;
  error: any;
  casesError: any;
  caseRefreshRequired: boolean;
  contactRefreshRequired: boolean;
  searchExistingCaseStatus: boolean;
};

type SearchState = {
  tasks: {
    [taskId: string]: {
      [context: string]: SearchStateTaskEntry;
    };
  };
};

export const newTaskEntry: SearchStateTaskEntry = {
  form: newSearchFormEntry,
  detailsExpanded: {
    [ContactDetailsSections.GENERAL_DETAILS]: true,
    [ContactDetailsSections.CALLER_INFORMATION]: false,
    [ContactDetailsSections.CHILD_INFORMATION]: false,
    [ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
    [ContactDetailsSections.CONTACT_SUMMARY]: false,
    [ContactDetailsSections.TRANSCRIPT]: false,
    [ContactDetailsSections.EXTERNAL_REPORT]: false,
    [ContactDetailsSections.RECORDING]: false,
  },
  searchContactsResult: { count: 0, ids: [] },
  searchCasesResult: { count: 0, ids: [] },
  isRequesting: false,
  isRequestingCases: false,
  caseRefreshRequired: false,
  contactRefreshRequired: false,
  error: null,
  casesError: null,
  searchExistingCaseStatus: false,
};

const initialState: SearchState = {
  tasks: {
    [standaloneTaskSid]: {
      root: newTaskEntry,
    },
  },
};

const contactUpdatingReducer = (state: SearchState, action: ContactUpdatingAction): SearchState => {
  const { contact, previousContact } = (action as any).payload as { contact: Contact; previousContact?: Contact };
  if (!contact?.taskId) return state;
  let updatedState = state;
  if (previousContact && previousContact.taskId !== contact.taskId) {
    updatedState = {
      ...state,
      tasks: omit(state.tasks, previousContact.taskId),
    };
  }
  if (state.tasks[contact.taskId] && action.type !== CREATE_CONTACT_ACTION_FULFILLED) return updatedState;

  return {
    ...updatedState,
    tasks: {
      ...updatedState.tasks,
      [contact.taskId]: {},
    },
  };
};

// eslint-disable-next-line complexity
export function reduce(
  startingState = initialState,
  action:
    | t.SearchActionType
    | RemoveContactStateAction
    | ContactUpdatingAction
    | ContactConnectingAction
    | CaseUpdatingAction,
): SearchState {
  let state = startingState;
  if ((<string[]>[UPDATE_CONTACT_ACTION_FULFILLED, CREATE_CONTACT_ACTION_FULFILLED]).includes(action.type)) {
    state = {
      ...state,
      tasks: Object.fromEntries(
        Object.entries(state.tasks).map(([key, value]) => [
          key,
          Object.fromEntries(
            Object.entries(value).map(([key, context]) => [key, { ...context, contactRefreshRequired: true }]),
          ),
        ]),
      ),
    };
  }
  // TODO: Remove this - now case search results share redux state with connected cases an explicit refresh should be redundant
  if ((<string[]>[CONNECT_TO_CASE_ACTION_FULFILLED, CREATE_CASE_ACTION_FULFILLED]).includes(action.type)) {
    state = {
      ...state,
      tasks: Object.fromEntries(
        Object.entries(state.tasks).map(([key, value]) => [
          key,
          Object.fromEntries(
            Object.entries(value).map(([key, context]) => [key, { ...context, caseRefreshRequired: true }]),
          ),
        ]),
      ),
    };
  }
  switch (action.type) {
    case CREATE_CONTACT_ACTION_FULFILLED:
    case LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED:
    case UPDATE_CONTACT_ACTION_FULFILLED: {
      return contactUpdatingReducer(state, action as ContactUpdatingAction);
    }
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case t.HANDLE_SEARCH_FORM_CHANGE: {
      const task = state.tasks[action.taskId];
      const context = state.tasks[action.taskId][action.context];

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              form: {
                ...context?.form,
                [action.name]: action.value,
              },
            },
          },
        },
      };
    }
    case t.HANDLE_FORM_UPDATE: {
      const task = state.tasks[action.taskId];
      const context = state.tasks[action.taskId][action.context];

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              form: {
                ...context?.form,
                ...action.values,
              },
            },
          },
        },
      };
    }
    case t.CREATE_NEW_SEARCH: {
      const task = state.tasks[action.taskId] || {};
      const context = state.tasks[action.taskId][action.context];

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              ...newTaskEntry,
            },
          },
        },
      };
    }
    case t.SEARCH_CONTACTS_REQUEST: {
      const task = state.tasks[action.taskId];
      const context = state.tasks[action.taskId][action.context];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              isRequesting: true,
              contactRefreshRequired: false,
            },
          },
        },
      };
    }
    case t.SEARCH_CONTACTS_SUCCESS: {
      const {
        searchResult: { contacts, ...searchResult },
        taskId,
        dispatchedFromPreviousContacts,
        context,
      } = action;
      const task = state.tasks[taskId];
      const searchContext = state.tasks[taskId][context];
      const newContactsResult = {
        ids: contacts.map(c => c.id),
        count: searchResult.count,
      };
      const previousContactCounts = dispatchedFromPreviousContacts
        ? { ...searchContext.previousContactCounts, contacts: searchResult.count }
        : searchContext.previousContactCounts;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            [context]: {
              ...searchContext,
              searchContactsResult: newContactsResult,
              isRequesting: false,
              error: null,
              previousContactCounts,
            },
          },
        },
      };
    }
    case t.SEARCH_CONTACTS_FAILURE: {
      const task = state.tasks[action.taskId];
      const context = state.tasks[action.taskId][action.context];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              isRequesting: false,
              error: action.error,
            },
          },
        },
      };
    }
    case t.SEARCH_CASES_REQUEST: {
      const task = state.tasks[action.taskId];
      const context = state.tasks[action.taskId][action.context];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              isRequestingCases: true,
              caseRefreshRequired: false,
            },
          },
        },
      };
    }
    case t.SEARCH_CASES_SUCCESS: {
      const {
        searchResult: { cases, count },
        taskId,
        dispatchedFromPreviousContacts,
      } = action;
      const task = state.tasks[taskId];
      const context = state.tasks[action.taskId][action.context];
      const newCasesResult = {
        ids: cases.map(c => c.id),
        count,
      };
      const previousContactCounts = dispatchedFromPreviousContacts
        ? { ...context.previousContactCounts, cases: newCasesResult.count }
        : context.previousContactCounts;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              previousContactCounts,
              searchCasesResult: newCasesResult,
              isRequestingCases: false,
              casesError: null,
            },
          },
        },
      };
    }
    case t.SEARCH_CASES_FAILURE: {
      const task = state.tasks[action.taskId];
      const context = state.tasks[action.taskId][action.context];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            [action.context]: {
              ...context,
              isRequestingCases: false,
              casesError: action.error,
            },
          },
        },
      };
    }
    case t.VIEW_PREVIOUS_CONTACTS: {
      const task = state.tasks[action.taskId];
      const context = state.tasks[action.taskId][action.context];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            form: {
              ...task.form,
              [action.context]: {
                ...context,
                contactNumber: action.contactNumber,
              },
            },
          },
        },
      };
    }
    default:
      return state;
  }
}
