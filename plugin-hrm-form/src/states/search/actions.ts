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
import { ApiSearchParams, SearchParams } from './types';
import { searchContacts } from '../../services/ContactService';
import { searchCases } from '../../services/CaseService';
import { updateDefinitionVersion } from '../configuration/actions';
import { getCasesMissingVersions, getContactsMissingVersions } from '../../utils/definitionVersions';

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

export const newSearchFormUpdateAction = (
  taskId: string,
  context: string,
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

const convertSearchParamsToApiSearchParams = (searchParams: SearchParams): ApiSearchParams => ({
  ...searchParams,
  helpline: typeof searchParams.helpline === 'string' ? searchParams.helpline : searchParams.helpline.value,
  dateFrom: searchParams.dateFrom ? formatISO(startOfDay(parseISO(searchParams.dateFrom))) : searchParams.dateFrom,
  dateTo: searchParams.dateTo ? formatISO(endOfDay(parseISO(searchParams.dateTo))) : searchParams.dateTo,
  onlyDataContacts: searchParams.onlyDataContacts,
});

export const dispatchSearchContactsActions = (dispatch: Dispatch<any>) => (taskId: string, context: string) => async (
  searchParams: SearchParams,
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CONTACTS_REQUEST, taskId, context });

    const searchParamsToSubmit = convertSearchParamsToApiSearchParams(searchParams);

    const searchResultRaw = await searchContacts({
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

export const dispatchSearchCasesActions = (dispatch: Dispatch<any>) => (taskId: string, context: string) => async (
  searchParams: SearchParams,
  limit: number,
  offset: number,
  dispatchedFromPreviousContacts?: boolean,
) => {
  try {
    dispatch({ type: t.SEARCH_CASES, taskId, context });

    const searchParamsToSubmit = convertSearchParamsToApiSearchParams(searchParams);

    const searchResult = await searchCases({ searchParameters: searchParamsToSubmit, limit, offset });

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
