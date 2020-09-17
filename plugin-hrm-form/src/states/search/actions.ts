/* eslint-disable import/no-unused-modules */
import { Dispatch } from 'redux';

import * as t from './types';
import { ConfigurationState } from '../configuration/reducer';
import { SearchContact } from '../../types/types';
import { searchContacts as searchContactsApiCall } from '../../services/ContactService';
import { ContactDetailsSectionsType } from '../../components/common/ContactDetails';
import { addDetails } from './helpers';

// Action creators
export const handleSearchFormChange = (taskId: string) => <K extends keyof t.SearchFormValues>(
  name: K,
  value: t.SearchFormValues[K],
): t.SearchActionType => {
  return {
    type: t.HANDLE_SEARCH_FORM_CHANGE,
    name,
    value,
    taskId,
  } as t.SearchActionType; // casting cause inference is not providing enough information, but the restrictions are made in argument types
};

export const searchContacts = (dispatch: Dispatch<any>) => (taskId: string) => async (
  searchParams: any,
  counselorsHash: ConfigurationState['counselors']['hash'],
) => {
  try {
    dispatch({ type: t.SEARCH_CONTACTS_REQUEST, taskId });

    const searchResultRaw = await searchContactsApiCall(searchParams);
    const contactsWithCounselorName = addDetails(counselorsHash, searchResultRaw.contacts);
    const searchResult = { ...searchResultRaw, contacts: contactsWithCounselorName };

    dispatch({ type: t.SEARCH_CONTACTS_SUCCESS, searchResult, taskId });
  } catch (error) {
    dispatch({ type: t.SEARCH_CONTACTS_FAILURE, error, taskId });
  }
};

export const changeSearchPage = (taskId: string) => (page: t.SearchPagesType): t.SearchActionType => ({
  type: t.CHANGE_SEARCH_PAGE,
  page,
  taskId,
});

export const viewContactDetails = (taskId: string) => (contact: SearchContact): t.SearchActionType => ({
  type: t.VIEW_CONTACT_DETAILS,
  contact,
  taskId,
});

export const handleExpandDetailsSection = (taskId: string) => (section: ContactDetailsSectionsType) => ({
  type: t.HANDLE_EXPAND_DETAILS_SECTION,
  section,
  taskId,
});
