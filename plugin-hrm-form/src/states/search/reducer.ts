import { omit } from 'lodash';

import * as t from './types';
import { INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE, GeneralActionType } from '../types';
import { SearchContactResult } from '../../types/types';

type TaskEntry = {
  currentPage: t.SearchPagesType;
  currentContact: SearchContactResult;
  form: t.SearchFormValues;
  detailsExpanded: {
    [key in t.ContactDetailsSectionsType]: boolean;
  };
  searchResult: t.DetailerSearchResult;
  isRequesting: boolean;
  error: any;
};

export type SearchState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
};

const initialState: SearchState = {
  tasks: {},
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
  },
  detailsExpanded: {
    [t.ContactDetailsSections.GENERAL_DETAILS]: true,
    [t.ContactDetailsSections.CALLER_INFORMATION]: false,
    [t.ContactDetailsSections.CHILD_INFORMATION]: false,
    [t.ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
    [t.ContactDetailsSections.CONTACT_SUMMARY]: false,
  },
  searchResult: [],
  isRequesting: false,
  error: null,
};

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
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            searchResult: action.searchResult,
            currentPage: t.SearchPages.results,
            isRequesting: false,
            error: null,
          },
        },
      };
    }
    case t.SEARCH_CONTACTS_FAILURE: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            currentPage: t.SearchPages.results,
            isRequesting: false,
            error: action.error,
          },
        },
      };
    }
    default:
      return state;
  }
}
