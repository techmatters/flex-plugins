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

import * as t from './types';
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
