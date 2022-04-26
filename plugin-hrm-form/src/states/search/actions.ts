/* eslint-disable import/no-unused-modules */
import { Dispatch } from 'redux';
import { ITask } from '@twilio/flex-ui';

import * as t from './types';
import { ConfigurationState } from '../configuration/reducer';
import { Case, SearchContact } from '../../types/types';
import { searchContacts as searchContactsApiCall } from '../../services/ContactService';
import { searchCases as searchCasesApiCall } from '../../services/CaseService';
import { ContactDetailsSectionsType } from '../../components/common/ContactDetails';
import { addDetails } from './helpers';
import { updateDefinitionVersion } from '../configuration/actions';
import { getContactsMissingVersions, getCasesMissingVersions } from '../../utils/definitionVersions';
import { getNumberFromTask } from '../../utils/task';

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
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CONTACTS_REQUEST, taskId });

    const searchResultRaw = await searchContactsApiCall(searchParams, limit, offset);
    const contactsWithCounselorName = addDetails(counselorsHash, searchResultRaw.contacts);
    const searchResult = { ...searchResultRaw, contacts: contactsWithCounselorName };

    const definitions = await getContactsMissingVersions(searchResultRaw.contacts);
    definitions.forEach(d => dispatch(updateDefinitionVersion(d.version, d.definition)));

    dispatch({ type: t.SEARCH_CONTACTS_SUCCESS, searchResult, taskId, dispatchedFromPreviousContacts });
  } catch (error) {
    dispatch({ type: t.SEARCH_CONTACTS_FAILURE, error, taskId, dispatchedFromPreviousContacts });
  }
};

export const searchCases = (dispatch: Dispatch<any>) => (taskId: string) => async (
  searchParams: any,
  counselorsHash: ConfigurationState['counselors']['hash'],
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CASES_REQUEST, taskId });
    const searchResult = await searchCasesApiCall(searchParams, limit, offset);

    const definitions = await getCasesMissingVersions(searchResult.cases);
    definitions.forEach(d => dispatch(updateDefinitionVersion(d.version, d.definition)));

    dispatch({ type: t.SEARCH_CASES_SUCCESS, searchResult, taskId, dispatchedFromPreviousContacts });
  } catch (error) {
    dispatch({ type: t.SEARCH_CASES_FAILURE, error, taskId });
  }
};

export const viewPreviousContacts = (dispatch: Dispatch<any>) => (task: ITask) => () => {
  const contactNumber = getNumberFromTask(task);
  const taskId = task.taskSid;

  dispatch({ type: t.VIEW_PREVIOUS_CONTACTS, taskId, contactNumber });
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
