/* eslint-disable import/no-unused-modules */
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

import type { ReferrableResourceSearchState, SearchSettings } from '../../search';
import type { FilterOption } from '../../types';
import { dedupAndSort, LoadReferenceActionFunction, ReferenceLocationState } from '../../referenceLocations';
import { getDistinctStringAttributes } from '../../../../services/ResourceService';

export type USCHReferenceLocationState = {
  countryOptions: FilterOption[];
  provinceOptions: FilterOption[];
  cityOptions: FilterOption[];
};

export const referenceLocationsInitialState: USCHReferenceLocationState = {
  countryOptions: [],
  provinceOptions: [],
  cityOptions: [],
};

export const enum USCHReferenceLocationList {
  Country = 'address/country',
  Provinces = 'address/province',
  Cities = 'address/city',
}

export type USCHFilterOptions = {
  // feeStructure: FilterOption[];
  country: FilterOption[];
  province: FilterOption[];
  city?: FilterOption[];
};

const initialFilterOptions: USCHFilterOptions = {
  // feeStructure: [
  //   { value: 'Free' },
  // ],
  country: [],
  province: [{ label: '', value: undefined }],
  city: [],
};

export type USCHFilterSelections = {
  country?: string;
  province?: string;
  city?: string;
  // feeStructure?: string[];
};

const getFilterOptionsBasedOnSelections = ({
  countryOptions,
  provinceOptions,
  cityOptions,
}: ReferenceLocationState = {}): USCHFilterOptions => {
  return {
    ...initialFilterOptions,
    country: [{ label: '', value: undefined }, ...(countryOptions || [])],
    province: [{ label: '', value: undefined }, ...(provinceOptions || [])],
    city: [{ label: '', value: undefined }, ...(cityOptions || [])],
  };
};

const ensureFilterSelectionsAreValid = (
  filterSelections: USCHFilterSelections = {},
  filterOptions: USCHFilterOptions = initialFilterOptions,
): USCHFilterSelections => {
  return {
    // Don't add undefined values to the filter selections
    ...Object.fromEntries(
      Object.entries({
        ...filterSelections,
        country: filterOptions.country.find(opt => opt.value === filterSelections.country)?.value,
        province: filterOptions.province.find(opt => opt.value === filterSelections.province)?.value,
        city: filterOptions.city.find(opt => opt.value === filterSelections.city)?.value,
      }).filter(([, value]) => value !== undefined),
    ),
  };
};

export const loadReferenceActionFunction: (list: string) => LoadReferenceActionFunction = (
  list: string,
) => async () => {
  const apiAttributes = await getDistinctStringAttributes({ key: list });
  const unsortedOptions = apiAttributes.map(({ value }) => ({
    label: value,
    value,
  }));
  return { list, options: dedupAndSort(unsortedOptions) };
};

export const handlerUpdateSearchFormAction = (
  state: ReferrableResourceSearchState,
  { payload }: { payload: SearchSettings },
) => {
  const updatedFilterOptions = getFilterOptionsBasedOnSelections(state.referenceLocations);
  const validatedFilterSelections = ensureFilterSelectionsAreValid(
    { ...state.parameters.filterSelections, ...payload.filterSelections },
    updatedFilterOptions,
  );

  console.log('>>>>>>>>>>> payload', payload);
  console.log('>>>>>>>>>>> referenceLocations', state.referenceLocations);
  console.log('>>>>>>>>>>> updatedFilterOptions', updatedFilterOptions);
  console.log('>>>>>>>>>>> validatedFilterSelections', validatedFilterSelections);

  return {
    ...state,
    filterOptions: updatedFilterOptions,
    parameters: {
      ...state.parameters,
      ...payload,
      filterSelections: validatedFilterSelections,
    },
  };
};

export const handleLoadReferenceLocationsAsyncActionFulfilled = (
  state: ReferrableResourceSearchState,
  { payload }: { payload: { list: string; options: FilterOption[] } },
) => {
  const { list, options } = payload;
  let { referenceLocations } = state;
  switch (list) {
    case USCHReferenceLocationList.Country:
      referenceLocations = { ...referenceLocations, countryOptions: options };
      break;
    case USCHReferenceLocationList.Provinces:
      referenceLocations = { ...referenceLocations, provinceOptions: options };
      break;
    case USCHReferenceLocationList.Cities:
      referenceLocations = { ...referenceLocations, cityOptions: options };
      break;
    default:
  }

  const updatedFilterOptions = getFilterOptionsBasedOnSelections(referenceLocations);
  const validatedFilterSelections = ensureFilterSelectionsAreValid(
    state.parameters.filterSelections,
    updatedFilterOptions,
  );

  return {
    ...state,
    filterOptions: updatedFilterOptions,
    filterSelections: validatedFilterSelections,
    referenceLocations,
  };
};
