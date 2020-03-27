import {
  HANDLE_SELECT_SEARCH_RESULT,
  HANDLE_SEARCH_FORM_CHANGE,
  CHANGE_SEARCH_PAGE,
  VIEW_CONTACT_DETAILS,
  SEARCH_CONTACTS_REQUEST,
  SEARCH_CONTACTS_SUCCESS,
  SEARCH_CONTACTS_FAILURE,
} from './ActionTypes';
import { searchContacts as searchContactsApiCall } from '../services/ContactService';

export const SearchPages = {
  form: 'form',
  results: 'results',
  details: 'details',
};

export const handleSelectSearchResult = (searchResult, taskId) => ({
  type: HANDLE_SELECT_SEARCH_RESULT,
  searchResult,
  taskId,
});

export const handleSearchFormChange = (name, value) => ({
  type: HANDLE_SEARCH_FORM_CHANGE,
  name,
  value,
});

export const searchContacts = dispatch => async (hrmBaseUrl, searchParams) => {
  try {
    dispatch({ type: SEARCH_CONTACTS_REQUEST });
    const searchResult = await searchContactsApiCall(hrmBaseUrl, searchParams);
    dispatch({ type: SEARCH_CONTACTS_SUCCESS, searchResult });
  } catch (error) {
    dispatch({ type: SEARCH_CONTACTS_FAILURE, error });
  }
};

export const changeSearchPage = page => ({ type: CHANGE_SEARCH_PAGE, page });

export const viewContactDetails = contact => ({ type: VIEW_CONTACT_DETAILS, contact });

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

export function copySearchResultIntoTask(currentTask, searchResult) {
  const searchResultDetails = searchResult.details;
  return copyNewValues(currentTask, searchResultDetails);
}

const initialState = {
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
    case HANDLE_SEARCH_FORM_CHANGE:
      return {
        ...state,
        form: {
          ...state.form,
          [action.name]: action.value,
        },
      };
    case CHANGE_SEARCH_PAGE:
      return {
        ...state,
        currentPage: action.page,
      };
    case VIEW_CONTACT_DETAILS:
      return {
        ...state,
        currentPage: SearchPages.details,
        currentContact: action.contact,
      };
    case SEARCH_CONTACTS_REQUEST:
      return {
        ...state,
        isRequesting: true,
      };
    case SEARCH_CONTACTS_SUCCESS:
      return {
        ...state,
        isRequesting: false,
        searchResult: action.searchResult,
        currentPage: SearchPages.results,
        error: null,
      };
    case SEARCH_CONTACTS_FAILURE:
      return {
        ...state,
        isRequesting: false,
        error: action.error,
      };
    default:
      return state;
  }
}
