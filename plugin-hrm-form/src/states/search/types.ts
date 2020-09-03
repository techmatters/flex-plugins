import { SearchContactResult } from '../../types/types';
import { addDetails } from './helpers';
// Action types
export const HANDLE_SEARCH_FORM_CHANGE = 'HANDLE_SEARCH_FORM_CHANGE';
export const CHANGE_SEARCH_PAGE = 'CHANGE_SEARCH_PAGE';
export const VIEW_CONTACT_DETAILS = 'VIEW_CONTACT_DETAILS';
export const SEARCH_CONTACTS_REQUEST = 'SEARCH_CONTACTS_REQUEST';
export const SEARCH_CONTACTS_SUCCESS = 'SEARCH_CONTACTS_SUCCESS';
export const SEARCH_CONTACTS_FAILURE = 'SEARCH_CONTACTS_FAILURE';
export const HANDLE_EXPAND_DETAILS_SECTION = 'HANDLE_EXPAND_DETAILS_SECTION';

// types and constants used to construct search form
export const newSearchFormEntry = {
  firstName: '',
  lastName: '',
  counselor: { label: '', value: '' },
  phoneNumber: '',
  dateFrom: '',
  dateTo: '',
};

export type SearchFormValues = {
  [K in keyof typeof newSearchFormEntry]: typeof newSearchFormEntry[K];
};

// this was inside search reducer, but it's used in ContactDetails and Timeline components. Should this be moved to a more common/shared place?
export const ContactDetailsSections = {
  GENERAL_DETAILS: 'General details',
  CALLER_INFORMATION: 'Caller information',
  CHILD_INFORMATION: 'Child information',
  ISSUE_CATEGORIZATION: 'Issue categorization',
  CONTACT_SUMMARY: 'Contact summary',
} as const;

export type ContactDetailsSectionsType = typeof ContactDetailsSections[keyof typeof ContactDetailsSections];

export const SearchPages = {
  form: 'form',
  results: 'results',
  details: 'details',
} as const;

export type SearchPagesType = typeof SearchPages[keyof typeof SearchPages];

export type DetailedSearchResult = ReturnType<typeof addDetails>;

// Supported action object types
type SearchFormChangeAction = {
  [K in keyof SearchFormValues]: {
    name: K;
    value: SearchFormValues[K];
  };
}[keyof SearchFormValues] & { type: typeof HANDLE_SEARCH_FORM_CHANGE; taskId: string };

type SearchContactsRequestAction = { type: typeof SEARCH_CONTACTS_REQUEST; taskId: string };

type SearchContactsSuccessAction = {
  type: typeof SEARCH_CONTACTS_SUCCESS;
  searchResult: DetailerSearchResult;
  taskId: string;
};

type SearchContactsFailureAction = { type: typeof SEARCH_CONTACTS_FAILURE; error: any; taskId: string };

// maybe we can migrate this to be handled by the routing instead later on?
type SearchChangePageAction = { type: typeof CHANGE_SEARCH_PAGE; page: SearchPagesType; taskId: string };

type SearchViewContactAction = { type: typeof VIEW_CONTACT_DETAILS; contact: SearchContactResult; taskId: string };

type SearchExpandSectionAction = {
  type: typeof HANDLE_EXPAND_DETAILS_SECTION;
  section: ContactDetailsSectionsType;
  taskId: string;
};

export type SearchActionType =
  | SearchFormChangeAction
  | SearchContactsRequestAction
  | SearchContactsSuccessAction
  | SearchContactsFailureAction
  | SearchChangePageAction
  | SearchViewContactAction
  | SearchExpandSectionAction;
