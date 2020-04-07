import { omit } from 'lodash';

import {
  INITIALIZE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  RECREATE_SEARCH_CONTACT,
  HANDLE_SELECT_SEARCH_RESULT,
  HANDLE_SEARCH_FORM_CHANGE,
  CHANGE_SEARCH_PAGE,
  VIEW_CONTACT_DETAILS,
  SEARCH_CONTACTS_REQUEST,
  SEARCH_CONTACTS_SUCCESS,
  SEARCH_CONTACTS_FAILURE,
} from './ActionTypes';
import { searchContacts as searchContactsApiCall } from '../services/ContactService';
import callTypes from './DomainConstants';
import { createBlankForm } from './ContactFormStateFactory';

const { childInformation: blankChildInformation, callerInformation: blankCallerInformation } = createBlankForm();

/**
 * @param {any} contact a contact result object
 * @returns {string[]} returns an array conaining the tags of the contact as strings (if any)
 */
const retrieveTags = contact => {
  const { details } = contact;
  if (!details || !details.caseInformation || !details.caseInformation.categories) return [];

  const cats = Object.entries(details.caseInformation.categories);
  const subcats = cats.flatMap(([_, subs]) => Object.entries(subs));

  const flattened = subcats.map(([subcat, bool]) => {
    if (bool) return subcat;
    return null;
  });

  const tags = flattened.reduce((acc, curr) => {
    if (curr) return [...acc, curr];
    return acc;
  }, []);

  return tags;
};

const addDetails = (counselorsHash, raw) => {
  const detailed = raw.map(contact => {
    const counselor = counselorsHash[contact.overview.counselor] || 'Unknown';
    const tags = retrieveTags(contact);
    const det = { ...contact, counselor, tags };
    return det;
  });

  return detailed;
};

export const SearchPages = {
  form: 'form',
  results: 'results',
  details: 'details',
};

export const recreateSearchContact = taskId => ({ type: RECREATE_SEARCH_CONTACT, taskId });

export const handleSelectSearchResult = (searchResult, taskId) => ({
  type: HANDLE_SELECT_SEARCH_RESULT,
  searchResult,
  taskId,
});

export const handleSearchFormChange = taskId => (name, value) => ({
  type: HANDLE_SEARCH_FORM_CHANGE,
  name,
  value,
  taskId,
});

export const searchContacts = dispatch => taskId => async (hrmBaseUrl, searchParams, counselorsHash) => {
  try {
    dispatch({ type: SEARCH_CONTACTS_REQUEST, taskId });
    const searchResultRaw = await searchContactsApiCall(hrmBaseUrl, searchParams);
    const searchResult = addDetails(counselorsHash, searchResultRaw);

    dispatch({ type: SEARCH_CONTACTS_SUCCESS, searchResult, taskId });
  } catch (error) {
    dispatch({ type: SEARCH_CONTACTS_FAILURE, error, taskId });
  }
};

export const changeSearchPage = taskId => page => ({ type: CHANGE_SEARCH_PAGE, page, taskId });

export const viewContactDetails = taskId => contact => ({ type: VIEW_CONTACT_DETAILS, contact, taskId });

function copyNewValues(originalObject, objectWithNewValues) {
  if (objectWithNewValues === null || typeof objectWithNewValues === 'undefined') {
    return originalObject;
  }

  const isLeaf = originalObject.hasOwnProperty('value');

  if (isLeaf) {
    return {
      ...originalObject,
      value: objectWithNewValues,
      touched: true,
    };
  }

  const keys = Object.keys(originalObject);
  const values = keys.map(key => copyNewValues(originalObject[key], objectWithNewValues[key]));

  const entries = keys.map((key, i) => [key, values[i]]);
  return Object.fromEntries(entries);
}

function copyCallerInformation(original, newValues) {
  const callerInformation = copyNewValues(blankCallerInformation, newValues.callerInformation);
  return { ...original, callerInformation };
}

function copyChildInformation(original, newValues) {
  const childInformation = copyNewValues(blankChildInformation, newValues.childInformation);
  return { ...original, childInformation };
}

/**
 * Partially copies values from the contact (newValues) into the form (original)
 * based on the type calls of both
 * @param {{ callType: { value: string; }; }} original
 * @param {{ callType: string; }} newValues
 * @returns {{ callType: { value: string; }; }} a new form with caller or child information copied over
 */
function partiallyCopyValues(original, newValues) {
  switch (newValues.callType) {
    case callTypes.caller: {
      if (original.callType.value === callTypes.caller) {
        return copyCallerInformation(original, newValues);
      }
      if (original.callType.value === callTypes.child) {
        return copyChildInformation(original, newValues);
      }
      return original;
    }
    case callTypes.child: {
      return copyChildInformation(original, newValues);
    }
    default:
      return original;
  }
}

export function copySearchResultIntoTask(currentTask, searchResult) {
  const searchResultDetails = searchResult.details;
  return partiallyCopyValues(currentTask, searchResultDetails);
}

const initialState = {
  tasks: {},
};

const newTaskEntry = {
  currentPage: SearchPages.form,
  currentContact: null,
  form: {
    firstName: '',
    lastName: '',
    counselor: { label: '', value: '' },
    phoneNumber: '',
    dateFrom: '',
    dateTo: '',
  },
  searchResult: [],
  isRequesting: false,
  error: null,
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    case RECREATE_SEARCH_CONTACT:
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
    case HANDLE_SEARCH_FORM_CHANGE: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: { ...task, form: { ...task.form, [action.name]: action.value } },
        },
      };
    }
    case CHANGE_SEARCH_PAGE: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: { ...task, currentPage: action.page },
        },
      };
    }
    case VIEW_CONTACT_DETAILS: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: { ...task, currentPage: SearchPages.details, currentContact: action.contact },
        },
      };
    }
    case SEARCH_CONTACTS_REQUEST: {
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
    case SEARCH_CONTACTS_SUCCESS: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            searchResult: action.searchResult,
            currentPage: SearchPages.results,
            isRequesting: false,
            error: null,
          },
        },
      };
    }
    case SEARCH_CONTACTS_FAILURE: {
      const task = state.tasks[action.taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...task,
            searchResult: action.searchResult,
            currentPage: SearchPages.results,
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
