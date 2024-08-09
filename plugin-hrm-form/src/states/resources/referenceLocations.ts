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
import { getReferenceAttributeList, ReferenceAttributeStringValue } from '../../services/ResourceService';

// Deduplicate based on value and sort by label
const dedupAndSort = (arr: FilterOption[]) => {
  const mapped = arr.reduce((optionMap: Record<string, FilterOption>, option: FilterOption) => {
    optionMap[option.value] = option;
    return optionMap;
  }, {});
  const deduped = Object.values(mapped);
  return deduped.sort((a, b) => a.label.localeCompare(b.label));
};

export type ReferenceLocationState = {
  provinceOptions: FilterOption[];
  regionOptions: FilterOption[];
  cityOptions: FilterOption[];
};

export const referenceLocationsInitialState: ReferenceLocationState = {
  provinceOptions: [],
  regionOptions: [],
  cityOptions: [],
};

const LOAD_REFERENCE_LOCATIONS_LIST_ACTION = 'resource-action/reference-locations/load-all';

export const enum ReferenceLocationList {
  Provinces = 'provinces',
  Regions = 'country/province/region',
  Cities = 'country/province/region/city',
}

export const loadReferenceLocationsAsyncAction = createAsyncAction(
  LOAD_REFERENCE_LOCATIONS_LIST_ACTION,
  async (list: ReferenceLocationList): Promise<{ list: ReferenceLocationList; options: FilterOption[] }> => {
    const apiAttributes = await getReferenceAttributeList(list, 'en');
    const unsortedOptions = apiAttributes.map(({ value, info }: ReferenceAttributeStringValue) => ({
      label: info?.name ?? value,
      value,
    }));
    return { list, options: dedupAndSort(unsortedOptions) };
  },
  // { promiseTypeDelimiter: '/' }, // Doesn't work :-(
);
