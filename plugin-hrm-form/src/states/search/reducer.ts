import { omit } from 'lodash';

import * as t from './types';
import { INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE, GeneralActionType } from '../types';
import { SearchContact, SearchCaseResult, standaloneTaskSid } from '../../types/types';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../../components/common/ContactDetails';

type PreviousContacts = {
  contacts?: t.DetailedSearchContactsResult;
  cases?: SearchCaseResult;
};

type TaskEntry = {
  currentPage: t.SearchPagesType;
  currentContact: SearchContact;
  form: t.SearchFormValues;
  detailsExpanded: {
    [key in ContactDetailsSectionsType]: boolean;
  };
  searchContactsResult: t.DetailedSearchContactsResult;
  searchCasesResult: SearchCaseResult;
  previousContacts?: PreviousContacts;
  isRequesting: boolean;
  isRequestingCases: boolean;
  error: any;
  casesError: any;
};

type SearchState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
};

export const newTaskEntry: TaskEntry = {
  currentPage: t.SearchPages.form,
  currentContact: null,
  form: {
    firstName: '',
    lastName: '',
    counselor: { label: '', value: '' },
    phoneNumber: '',
    dateFrom: '',
    dateTo: '',
    contactNumber: '',
  },
  detailsExpanded: {
    [ContactDetailsSections.GENERAL_DETAILS]: true,
    [ContactDetailsSections.CALLER_INFORMATION]: false,
    [ContactDetailsSections.CHILD_INFORMATION]: false,
    [ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
    [ContactDetailsSections.CONTACT_SUMMARY]: false,
  },
  searchContactsResult: { count: 0, contacts: [] },
  searchCasesResult: { count: 0, cases: [] },
  previousContacts: undefined,
  isRequesting: false,
  isRequestingCases: false,
  error: null,
  casesError: null,
};

export const initialState: SearchState = {
  tasks: {
    [standaloneTaskSid]: newTaskEntry,
  },
};

// eslint-disable-next-line complexity
export function reduce(state = initialState, action: t.SearchActionType | GeneralActionType): SearchState {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    case RECREATE_CONTACT_STATE:
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case t.HANDLE_SEARCH_FORM_CHANGE: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: { ...task, form: { ...task.form, [action.name]: action.value } },
        },
      };
    }
    case t.CHANGE_SEARCH_PAGE: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: { ...task, currentPage: action.page },
        },
      };
    }
    case t.VIEW_CONTACT_DETAILS: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: { ...task, currentPage: t.SearchPages.details, currentContact: action.contact },
        },
      };
    }
    case t.HANDLE_EXPAND_DETAILS_SECTION: {
      const task = state.tasks[action.taskId];
      const { detailsExpanded } = task;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            detailsExpanded: {
              ...detailsExpanded,
              [action.section]: !detailsExpanded[action.section],
            },
          },
        },
      };
    }
    case t.SEARCH_CONTACTS_REQUEST: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            isRequesting: true,
          },
        },
      };
    }
    case t.SEARCH_CONTACTS_SUCCESS: {
      const task = state.tasks[action.taskId];
      const previousContacts = action.dispatchedFromPreviousContacts
        ? { ...task.previousContacts, contacts: action.searchResult }
        : task.previousContacts;
      const currentPage = action.dispatchedFromPreviousContacts ? task.currentPage : t.SearchPages.resultsContacts;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            searchContactsResult: action.searchResult,
            previousContacts,
            currentPage,
            isRequesting: false,
            error: null,
          },
        },
      };
    }
    case t.SEARCH_CONTACTS_FAILURE: {
      const task = state.tasks[action.taskId];
      const currentPage = action.dispatchedFromPreviousContacts ? task.currentPage : t.SearchPages.resultsContacts;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            currentPage,
            isRequesting: false,
            error: action.error,
          },
        },
      };
    }
    case t.SEARCH_CASES_REQUEST: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            isRequestingCases: true,
          },
        },
      };
    }
    case t.SEARCH_CASES_SUCCESS: {
      const task = state.tasks[action.taskId];
      const previousContacts = action.dispatchedFromPreviousContacts
        ? { ...task.previousContacts, cases: action.searchResult }
        : task.previousContacts;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            searchCasesResult: action.searchResult,
            previousContacts,
            isRequestingCases: false,
            casesError: null,
          },
        },
      };
    }
    case t.SEARCH_CASES_FAILURE: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            isRequestingCases: false,
            casesError: action.error,
          },
        },
      };
    }
    case t.SEARCH_CASES_UPDATE: {
      /**
       * Updates searchCasesResult with the updatedCase to a specific TaskEntry
       * @param taskId TaskEntry Id
       */
      const updateSearchCasesInTask = (taskId: string): TaskEntry => {
        const taskEntry = state.tasks[taskId];
        const updatedCases = taskEntry.searchCasesResult.cases.map(c =>
          c.id === action.updatedCase.id ? action.updatedCase : c,
        );
        return {
          ...taskEntry,
          searchCasesResult: {
            ...taskEntry.searchCasesResult,
            cases: updatedCases,
          },
        };
      };

      /**
       * Searches in the entire task collection and updates it with the new taskEntry.
       * This code contemplates the following scenario:
       * 1. The User opens two or more tasks.
       * 2. The user triggers a search with similar parameters on each task.
       * 3. One case (i.e. Case: XXXX) is returned in several tasks.
       * 4. The user triggers an update for Case: XXXX in one of the tasks.
       * 5. Case is updated across all tasks.
       */
      const tasks = Object.keys(state.tasks).reduce(
        (acc, taskId) => ({ ...acc, [taskId]: updateSearchCasesInTask(taskId) }),
        {},
      );

      return {
        ...state,
        tasks,
      };
    }
    case t.VIEW_PREVIOUS_CONTACTS: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            searchContactsResult: task.previousContacts.contacts,
            searchCasesResult: task.previousContacts.cases,
            currentPage: t.SearchPages.resultsContacts,
            form: {
              ...task.form,
              contactNumber: action.contactNumber,
            },
          },
        },
      };
    }
    default:
      return state;
  }
}
