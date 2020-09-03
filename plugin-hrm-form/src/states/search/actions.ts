/* eslint-disable import/no-unused-modules */
import { Dispatch } from 'redux';

import * as t from './types';
import { ConfigurationState } from '../configuration/reducer';
import { SearchContactResult } from '../../types/types';
import { searchContacts as searchContactsApiCall } from '../../services/ContactService';
import { addDetails } from './helpers';

// Action creators

// this type is not as strict as it could be. Got stuck and moved on
export const handleSearchFormChange = (taskId: string) => (name, value): t.SearchActionType => ({
  type: t.HANDLE_SEARCH_FORM_CHANGE,
  name,
  value,
  taskId,
});

export const searchContacts = (dispatch: Dispatch<any>) => (taskId: string) => async (
  searchParams: any,
  counselorsHash: ConfigurationState['counselors']['hash'],
) => {
  try {
    const requestAction: t.SearchActionType = { type: t.SEARCH_CONTACTS_REQUEST, taskId };
    dispatch(requestAction);

    const searchResultRaw = await searchContactsApiCall(searchParams);
    const searchResult = addDetails(counselorsHash, searchResultRaw);

    const successAction: t.SearchActionType = { type: t.SEARCH_CONTACTS_SUCCESS, searchResult, taskId };
    dispatch(successAction);
  } catch (error) {
    const failureAction: t.SearchActionType = { type: t.SEARCH_CONTACTS_FAILURE, error, taskId };
    dispatch(failureAction);
  }
};

export const changeSearchPage = (taskId: string) => (page: t.SearchPagesType): t.SearchActionType => ({
  type: t.CHANGE_SEARCH_PAGE,
  page,
  taskId,
});

export const viewContactDetails = (taskId: string) => (contact: SearchContactResult): t.SearchActionType => ({
  type: t.VIEW_CONTACT_DETAILS,
  contact,
  taskId,
});

export const handleExpandDetailsSection = (taskId: string) => (section: t.ContactDetailsSectionsType) => ({
  type: t.HANDLE_EXPAND_DETAILS_SECTION,
  section,
  taskId,
});
