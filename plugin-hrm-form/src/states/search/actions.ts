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

/* eslint-disable import/no-unused-modules */
import { Dispatch } from 'redux';
import { endOfDay, formatISO, parseISO, startOfDay } from 'date-fns';

import * as t from './types';
import { GeneralizedSearchParams, SearchParams } from './types';
import {
  searchContacts as searchContactsApiCall,
  generalizedSearch as generalizedContactsSearchApi,
} from '../../services/ContactService';
import {
  searchCases as searchCasesApiCall,
  generalizedSearch as generalizedCasesSearchApi,
} from '../../services/CaseService';
import { updateDefinitionVersion } from '../configuration/actions';
import { getCasesMissingVersions, getContactsMissingVersions } from '../../utils/definitionVersions';
import { getNumberFromTask } from '../../utils';

// Action creators
export const handleSearchFormChange = (taskId: string, context: string) => <K extends keyof t.SearchFormValues>(
  name: K,
  value: t.SearchFormValues[K],
): t.SearchActionType => {
  return {
    type: t.HANDLE_SEARCH_FORM_CHANGE,
    name,
    value,
    taskId,
    context,
  } as t.SearchActionType; // casting cause inference is not providing enough information, but the restrictions are made in argument types
};

export const handleSearchFormUpdate = (taskId: string, context: string) => (
  values: t.SearchFormValues,
): t.SearchActionType => {
  return {
    type: t.HANDLE_FORM_UPDATE,
    values,
    taskId,
    context,
  };
};

export const newCreateSearchForm = (taskId: string, context: string): t.SearchActionType => {
  return {
    type: t.CREATE_NEW_SEARCH,
    taskId,
    context,
  } as t.SearchActionType;
};

export const searchContacts = (dispatch: Dispatch<any>) => (taskId: string, context: string) => async (
  searchParams: SearchParams,
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CONTACTS_REQUEST, taskId, context });

    const { dateFrom, dateTo, ...rest } = searchParams ?? {};
    const searchParamsToSubmit: SearchParams = rest;
    if (dateFrom) {
      searchParamsToSubmit.dateFrom = formatISO(startOfDay(parseISO(dateFrom)));
    }
    if (dateTo) {
      searchParamsToSubmit.dateTo = formatISO(endOfDay(parseISO(dateTo)));
    }

    const searchResultRaw = await searchContactsApiCall(searchParamsToSubmit, limit, offset);
    const searchResult = { ...searchResultRaw, contacts: searchResultRaw.contacts };

    const definitions = await getContactsMissingVersions(searchResultRaw.contacts);
    definitions.forEach(d => dispatch(updateDefinitionVersion(d.version, d.definition)));

    dispatch({ type: t.SEARCH_CONTACTS_SUCCESS, searchResult, taskId, dispatchedFromPreviousContacts, context });
  } catch (error) {
    dispatch({ type: t.SEARCH_CONTACTS_FAILURE, error, taskId, dispatchedFromPreviousContacts, context });
  }
};

const pickGeneralizedSearchParams = (searchParams: SearchParams): GeneralizedSearchParams => ({
  ...searchParams,
  counselor: typeof searchParams.counselor === 'string' ? searchParams.counselor : searchParams.counselor.value,
  helpline: typeof searchParams.helpline === 'string' ? searchParams.helpline : searchParams.helpline.value,
  dateFrom: searchParams.dateFrom ? formatISO(startOfDay(parseISO(searchParams.dateFrom))) : searchParams.dateFrom,
  dateTo: searchParams.dateTo ? formatISO(startOfDay(parseISO(searchParams.dateTo))) : searchParams.dateTo,
});

export const generalizedSearchContacts = (dispatch: Dispatch<any>) => (taskId: string, context: string) => async (
  searchParams: SearchParams,
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CONTACTS_REQUEST, taskId, context });

    const searchParamsToSubmit = pickGeneralizedSearchParams(searchParams);

    const searchResultRaw = await generalizedContactsSearchApi({
      searchParameters: searchParamsToSubmit,
      limit,
      offset,
    });
    const searchResult = { ...searchResultRaw, contacts: searchResultRaw.contacts };

    const definitions = await getContactsMissingVersions(searchResultRaw.contacts);
    definitions.forEach(d => dispatch(updateDefinitionVersion(d.version, d.definition)));

    dispatch({ type: t.SEARCH_CONTACTS_SUCCESS, searchResult, taskId, dispatchedFromPreviousContacts, context });
  } catch (error) {
    dispatch({ type: t.SEARCH_CONTACTS_FAILURE, error, taskId, dispatchedFromPreviousContacts, context });
  }
};

export const searchCases = (dispatch: Dispatch<any>) => (taskId: string, context: string) => async (
  searchParams: any,
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CASES_REQUEST, taskId, context });

    const { dateFrom, dateTo, ...rest } = searchParams || {};

    // Adapt dateFrom and dateTo to what is expected in the search endpoint
    const searchCasesPayload = {
      ...rest,
      filters: {
        createdAt: {
          from: dateFrom ? formatISO(startOfDay(parseISO(dateFrom))) : undefined,
          to: dateTo ? formatISO(endOfDay(parseISO(dateTo))) : undefined,
        },
      },
    };

    const searchResult = await searchCasesApiCall(searchCasesPayload, limit, offset);

    const definitions = await getCasesMissingVersions(searchResult.cases);
    definitions.forEach(d => dispatch(updateDefinitionVersion(d.version, d.definition)));

    dispatch({
      type: t.SEARCH_CASES_SUCCESS,
      searchResult,
      taskId,
      dispatchedFromPreviousContacts,
      reference: `search-${taskId}`,
      context,
    });
  } catch (error) {
    dispatch({ type: t.SEARCH_CASES_FAILURE, error, taskId, context });
  }
};

export const generalizedSearchCases = (dispatch: Dispatch<any>) => (taskId: string, context: string) => async (
  searchParams: SearchParams,
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CASES_REQUEST, taskId, context });

    const searchParamsToSubmit = pickGeneralizedSearchParams(searchParams);

    const searchResult = await generalizedCasesSearchApi({ searchParameters: searchParamsToSubmit, limit, offset });

    const definitions = await getCasesMissingVersions(searchResult.cases);
    definitions.forEach(d => dispatch(updateDefinitionVersion(d.version, d.definition)));

    dispatch({
      type: t.SEARCH_CASES_SUCCESS,
      searchResult,
      taskId,
      dispatchedFromPreviousContacts,
      reference: `search-${taskId}`,
      context,
    });
  } catch (error) {
    dispatch({ type: t.SEARCH_CASES_FAILURE, error, taskId, context });
  }
};

export const viewPreviousContacts = (dispatch: Dispatch<any>) => (task: ITask) => () => {
  const contactNumber = getNumberFromTask(task);
  const taskId = task.taskSid;

  dispatch({ type: t.VIEW_PREVIOUS_CONTACTS, taskId, contactNumber });
};
