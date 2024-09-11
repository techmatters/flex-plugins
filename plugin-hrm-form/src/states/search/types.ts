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

import { Contact, SearchCaseResult } from '../../types/types';

// Action types
export const HANDLE_SEARCH_FORM_CHANGE = 'HANDLE_SEARCH_FORM_CHANGE';
export const HANDLE_FORM_UPDATE = 'HANDLE_FORM_UPDATE';
export const CHANGE_SEARCH_PAGE = 'CHANGE_SEARCH_PAGE';
export const VIEW_CONTACT_DETAILS = 'VIEW_CONTACT_DETAILS';
export const SEARCH_CONTACTS_REQUEST = 'SEARCH_CONTACTS_REQUEST';
export const SEARCH_CONTACTS_SUCCESS = 'SEARCH_CONTACTS_SUCCESS';
export const SEARCH_CONTACTS_FAILURE = 'SEARCH_CONTACTS_FAILURE';
export const GENERALIZED_SEARCH_CONTACTS_SUCCESS = 'GENERALIZED_SEARCH_CONTACTS_SUCCESS';
export const GENERALIZED_SEARCH_CONTACTS_FAILURE = 'GENERALIZED_SEARCH_CONTACTS_FAILURE';
export const SEARCH_CASES_REQUEST = 'SEARCH_CASES_REQUEST';
export const SEARCH_CASES_SUCCESS = 'SEARCH_CASES_SUCCESS';
export const SEARCH_CASES_FAILURE = 'SEARCH_CASES_FAILURE';
export const VIEW_PREVIOUS_CONTACTS = 'VIEW_PREVIOUS_CONTACTS';
export const CREATE_NEW_SEARCH = 'CREATE_NEW_SEARCH';

// types and constants used to construct search form
export const newSearchFormEntry = {
  firstName: '',
  lastName: '',
  counselor: { label: '', value: '' } as { label: string; value: string } | string,
  phoneNumber: '',
  dateFrom: '',
  dateTo: '',
  contactNumber: '',
  helpline: { label: '', value: '' },
  searchTerm: '',
  onlyDataContacts: false,
};

export type SearchFormValues = {
  [K in keyof typeof newSearchFormEntry]: typeof newSearchFormEntry[K];
};

export type SearchParams = Partial<SearchFormValues> & {
  taskSid?: string;
};

export type GeneralizedSearchParams = {
  [K in keyof SearchParams]: SearchParams[K] extends { value: infer U } ? U : SearchParams[K];
};

export type DetailedSearchContactsResult = {
  count: number;
  contacts: Contact[];
};

// Supported action object types
type SearchFormChangeAction = {
  [K in keyof SearchFormValues]: {
    name: K;
    value: SearchFormValues[K];
  };
}[keyof SearchFormValues] & { type: typeof HANDLE_SEARCH_FORM_CHANGE; taskId: string; context: string };

type SearchFormUpdate = {
  values: Partial<SearchFormValues>;
} & { type: typeof HANDLE_FORM_UPDATE; taskId: string; context: string };

type SearchContactsRequestAction = { type: typeof SEARCH_CONTACTS_REQUEST; taskId: string; context: string };

type CreateNewSearchAction = { type: typeof CREATE_NEW_SEARCH; taskId: string; context: string };

export type SearchContactsSuccessAction = {
  type: typeof SEARCH_CONTACTS_SUCCESS;
  searchResult: DetailedSearchContactsResult;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
  context: string;
};

type SearchContactsFailureAction = {
  type: typeof SEARCH_CONTACTS_FAILURE;
  error: any;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
  context: string;
};

export type SearchV2ContactsSuccessAction = {
  type: typeof GENERALIZED_SEARCH_CONTACTS_SUCCESS;
  searchMatchIds: string[];
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
  context: string;
};

export type SearchV2ContactsFailureAction = {
  type: typeof GENERALIZED_SEARCH_CONTACTS_FAILURE;
  error: any;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
  context: string;
};

type SearchCasesRequestAction = { type: typeof SEARCH_CASES_REQUEST; taskId: string; context: string };

export type SearchCasesSuccessAction = {
  type: typeof SEARCH_CASES_SUCCESS;
  searchResult: SearchCaseResult;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
  context: string;
};

type SearchCasesFailureAction = { type: typeof SEARCH_CASES_FAILURE; error: any; taskId: string; context: string };

type ViewPreviousContactsAction = {
  type: typeof VIEW_PREVIOUS_CONTACTS;
  taskId: string;
  contactNumber: string;
  context: string;
};

export type SearchActionType =
  | SearchFormChangeAction
  | SearchFormUpdate
  | SearchContactsRequestAction
  | SearchContactsSuccessAction
  | SearchContactsFailureAction
  | SearchV2ContactsSuccessAction
  | SearchV2ContactsFailureAction
  | SearchCasesRequestAction
  | SearchCasesSuccessAction
  | SearchCasesFailureAction
  | ViewPreviousContactsAction
  | CreateNewSearchAction;

export type SearchResultReferences = {
  count: number;
  ids: string[];
};

export type PreviousContactCounts = {
  contacts: number;
  cases: number;
};
