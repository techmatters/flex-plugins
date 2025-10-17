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

import { Contact } from '../../types/types';

// Action types
export const HANDLE_SEARCH_FORM_CHANGE = 'HANDLE_SEARCH_FORM_CHANGE';
export const HANDLE_FORM_UPDATE = 'HANDLE_FORM_UPDATE';
export const SEARCH_CONTACTS_REQUEST = 'SEARCH_CONTACTS_REQUEST';
export const SEARCH_CONTACTS_SUCCESS = 'SEARCH_CONTACTS_SUCCESS';
export const SEARCH_CASES = 'search/cases';
export const VIEW_PREVIOUS_CONTACTS = 'VIEW_PREVIOUS_CONTACTS';
export const CREATE_NEW_SEARCH = 'CREATE_NEW_SEARCH';

// types and constants used to construct search form
export const newSearchFormEntry = {
  firstName: '',
  lastName: '',
  counselor: '',
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

export type ApiSearchParams = {
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

type CreateNewSearchAction = { type: typeof CREATE_NEW_SEARCH; taskId: string; context: string };

export type SearchContactsSuccessAction = {
  type: typeof SEARCH_CONTACTS_SUCCESS;
  searchResult: DetailedSearchContactsResult;
  taskId: string;
  dispatchedFromPreviousContacts?: boolean;
  context: string;
};

type ViewPreviousContactsAction = {
  type: typeof VIEW_PREVIOUS_CONTACTS;
  taskId: string;
  contactNumber: string;
  context: string;
};

export type SearchActionType =
  | SearchFormChangeAction
  | SearchFormUpdate
  | ViewPreviousContactsAction
  | CreateNewSearchAction;

export type SearchResultReferences = {
  count: number;
  ids: string[];
};
