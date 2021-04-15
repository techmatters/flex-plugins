import { SearchContact, SearchCaseResult, Case } from '../../types/types';
import { addDetails } from './helpers';
import { ContactDetailsSectionsType } from '../../components/common/ContactDetails';
// Action types
export const HANDLE_SEARCH_FORM_CHANGE = 'HANDLE_SEARCH_FORM_CHANGE';
export const CHANGE_SEARCH_PAGE = 'CHANGE_SEARCH_PAGE';
export const VIEW_CONTACT_DETAILS = 'VIEW_CONTACT_DETAILS';
export const SEARCH_CONTACTS_REQUEST = 'SEARCH_CONTACTS_REQUEST';
export const SEARCH_CONTACTS_SUCCESS = 'SEARCH_CONTACTS_SUCCESS';
export const SEARCH_CONTACTS_FAILURE = 'SEARCH_CONTACTS_FAILURE';
export const SEARCH_CASES_REQUEST = 'SEARCH_CASES_REQUEST';
export const SEARCH_CASES_SUCCESS = 'SEARCH_CASES_SUCCESS';
export const SEARCH_CASES_FAILURE = 'SEARCH_CASES_FAILURE';
export const SEARCH_CASES_UPDATE = 'SEARCH_CASES_UPDATE';
export const HANDLE_EXPAND_DETAILS_SECTION = 'HANDLE_EXPAND_DETAILS_SECTION';

// types and constants used to construct search form
export const newSearchFormEntry = {
  firstName: '',
  lastName: '',
  counselor: { label: '', value: '' },
  phoneNumber: '',
  dateFrom: '',
  dateTo: '',
  contactNumber: '',
};

export type SearchFormValues = {
  [K in keyof typeof newSearchFormEntry]: typeof newSearchFormEntry[K];
};

export const SearchPages = {
  form: 'form',
  resultsContacts: 'results.contacts',
  resultsCases: 'results.cases',
  details: 'details',
  case: 'case',
} as const;

export type SearchPagesType = typeof SearchPages[keyof typeof SearchPages];

export type DetailedSearchContactsResult = {
  count: number;
  contacts: ReturnType<typeof addDetails>;
};

// Supported action object types
type SearchFormChangeAction = {
  [K in keyof SearchFormValues]: {
    name: K;
    value: SearchFormValues[K];
  };
}[keyof SearchFormValues] & { type: typeof HANDLE_SEARCH_FORM_CHANGE; taskId: string };

type SearchContactsRequestAction = { type: typeof SEARCH_CONTACTS_REQUEST; taskId: string };

export type SearchContactsSuccessAction = {
  type: typeof SEARCH_CONTACTS_SUCCESS;
  searchResult: DetailedSearchContactsResult;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
};

type SearchContactsFailureAction = {
  type: typeof SEARCH_CONTACTS_FAILURE;
  error: any;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
};

type SearchCasesRequestAction = { type: typeof SEARCH_CASES_REQUEST; taskId: string };

export type SearchCasesSuccessAction = {
  type: typeof SEARCH_CASES_SUCCESS;
  searchResult: SearchCaseResult;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
};

type SearchCasesFailureAction = { type: typeof SEARCH_CASES_FAILURE; error: any; taskId: string };

// maybe we can migrate this to be handled by the routing instead later on?
type SearchChangePageAction = { type: typeof CHANGE_SEARCH_PAGE; page: SearchPagesType; taskId: string };

type SearchViewContactAction = { type: typeof VIEW_CONTACT_DETAILS; contact: SearchContact; taskId: string };

type SearchExpandSectionAction = {
  type: typeof HANDLE_EXPAND_DETAILS_SECTION;
  section: ContactDetailsSectionsType;
  taskId: string;
};

type SearchCasesUpdateAction = {
  type: typeof SEARCH_CASES_UPDATE;
  taskId: string;
  updatedCase: Case;
};

export type SearchActionType =
  | SearchFormChangeAction
  | SearchContactsRequestAction
  | SearchContactsSuccessAction
  | SearchContactsFailureAction
  | SearchCasesRequestAction
  | SearchCasesSuccessAction
  | SearchCasesFailureAction
  | SearchChangePageAction
  | SearchViewContactAction
  | SearchExpandSectionAction
  | SearchCasesUpdateAction;
