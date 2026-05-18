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
import { createAsyncAction } from 'redux-promise-middleware-actions';

import { FilterOption } from './types';

// Deduplicate based on value and sort by label
export const dedupAndSort = (arr: FilterOption[]) => {
  const mapped = arr.reduce((optionMap: Record<string, FilterOption>, option: FilterOption) => {
    optionMap[option.value] = option;
    return optionMap;
  }, {});
  const deduped = Object.values(mapped);
  return deduped.sort((a, b) => a.label.localeCompare(b.label));
};

export type ReferenceLocationState = {
  [input: string]: FilterOption[];
};

const LOAD_REFERENCE_LOCATIONS_LIST_ACTION = 'resource-action/reference-locations/load-all';

export type LoadReferenceActionFunction = () => Promise<{ list: string; options: FilterOption[] }>;

export const loadReferenceLocationsAsyncAction = createAsyncAction(
  LOAD_REFERENCE_LOCATIONS_LIST_ACTION,
  async ({
    loadReferenceActionFunction,
  }: {
    loadReferenceActionFunction: LoadReferenceActionFunction;
  }): Promise<{ list: string; options: FilterOption[] }> => loadReferenceActionFunction(),
  // { promiseTypeDelimiter: '/' }, // Doesn't work :-(
);
