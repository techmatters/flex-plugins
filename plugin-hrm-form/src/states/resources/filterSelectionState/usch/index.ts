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
  categoryOptions: FilterOption[];
};

export const referenceLocationsInitialState: USCHReferenceLocationState = {
  countryOptions: [],
  provinceOptions: [],
  cityOptions: [],
  categoryOptions: [],
};

export const enum USCHReferenceLocationList {
  Country = 'address/country',
  Provinces = 'address/province',
  Cities = 'address/city',
  // Stored under one key per category: 'categories/0', 'categories/1', ...
  Categories = 'categories',
}

export type USCHFilterOptions = {
  // feeStructure: FilterOption[];
  country: FilterOption[];
  province: FilterOption[];
  city?: FilterOption[];
  categories: FilterOption[];
};

const initialFilterOptions: USCHFilterOptions = {
  // feeStructure: [
  //   { value: 'Free' },
  // ],
  country: [],
  province: [{ label: '', value: undefined }],
  city: [],
  categories: [],
};

export type USCHFilterSelections = {
  country?: string;
  province?: string;
  city?: string;
  categories?: string[];
};

const getFilterOptionsBasedOnSelections = (
  filterSelections: USCHFilterSelections,
  { countryOptions, provinceOptions, cityOptions, categoryOptions }: ReferenceLocationState = {},
): USCHFilterOptions => {
  return {
    ...initialFilterOptions,
    country: [{ label: '', value: undefined }, ...(countryOptions || [])],
    province: [
      { label: '', value: undefined },
      ...(provinceOptions || []).filter(
        ({ value }) => filterSelections.country && (!value || value.startsWith(filterSelections.country)),
      ),
    ],
    city: [
      { label: '', value: undefined },
      ...(cityOptions || []).filter(({ value }) => {
        const { country, province } = filterSelections;
        if (!country) {
          return false;
        }
        const startPrefix = province?.startsWith(country) ? province : country;
        return !value || value.startsWith(startPrefix);
      }),
    ],
    categories: categoryOptions || [],
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
  const apiAttributes = await getDistinctStringAttributes({
    key: list,
    allowDescendantKeys: list === USCHReferenceLocationList.Categories,
  });
  const unsortedOptions = apiAttributes.map(({ value, info }) => ({
    // Some values in the DB have stray spaces. Only the label is trimmed: the value must stay
    // exactly as stored, because it is matched exactly against the search index.
    label: (info?.name ?? value).trim(),
    value,
  }));
  return { list, options: dedupAndSort(unsortedOptions) };
};

export const handlerUpdateSearchFormAction = (
  state: ReferrableResourceSearchState,
  { payload }: { payload: SearchSettings },
) => {
  const updatedFilterOptions = getFilterOptionsBasedOnSelections(
    {
      ...state.parameters.filterSelections,
      ...(payload.filterSelections ?? {}),
    },
    state.referenceLocations,
  );
  const validatedFilterSelections = ensureFilterSelectionsAreValid(
    { ...state.parameters.filterSelections, ...payload.filterSelections },
    updatedFilterOptions,
  );

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

const moveDefaultOptionToHead = ({
  options,
  defaultOptionValue,
}: {
  options: FilterOption<string>[];
  defaultOptionValue: string;
}) => {
  const defaultOptionIndex = options.findIndex(o => o.value === defaultOptionValue);
  const containsDefaultOption = defaultOptionIndex > -1;
  if (!containsDefaultOption) {
    return { sortedOptions: options, containsDefaultOption };
  }

  const defaultOption = options[defaultOptionIndex];
  const sortedOptions = [defaultOption];

  options.forEach((option, index) => {
    if (index === defaultOptionIndex) {
      return;
    }

    sortedOptions.push(option);
  });

  return { sortedOptions, containsDefaultOption };
};

export const handleLoadReferenceLocationsAsyncActionFulfilled = (
  state: ReferrableResourceSearchState,
  { payload }: { payload: { list: string; options: FilterOption[] } },
): ReferrableResourceSearchState => {
  const { list, options } = payload;
  let { referenceLocations } = state;
  let defaultFilterSelection: Partial<USCHFilterSelections> = state.parameters.filterSelections;

  switch (list) {
    case USCHReferenceLocationList.Country:
      const defaultCountryTarget = 'United States';

      // sort the list, moving defaultCountryTarget to the top, if present
      const { sortedOptions, containsDefaultOption } = moveDefaultOptionToHead({
        options,
        defaultOptionValue: defaultCountryTarget,
      });
      referenceLocations = { ...referenceLocations, countryOptions: sortedOptions };

      // select defaultCountryTarget filter upon load
      if (containsDefaultOption) {
        defaultFilterSelection = { ...defaultFilterSelection, country: defaultCountryTarget };
      }
      break;
    case USCHReferenceLocationList.Provinces:
      referenceLocations = { ...referenceLocations, provinceOptions: options };
      break;
    case USCHReferenceLocationList.Cities:
      referenceLocations = { ...referenceLocations, cityOptions: options };
      break;
    case USCHReferenceLocationList.Categories:
      referenceLocations = { ...referenceLocations, categoryOptions: options };
      break;
    default:
  }
  const updatedFilterOptions = getFilterOptionsBasedOnSelections(state.parameters.filterSelections, referenceLocations);
  const validatedFilterSelections = ensureFilterSelectionsAreValid(
    state.parameters.filterSelections,
    updatedFilterOptions,
  );

  return {
    ...state,
    filterOptions: updatedFilterOptions,
    parameters: {
      ...state.parameters,
      filterSelections: {
        ...defaultFilterSelection,
        ...validatedFilterSelections,
      },
    },
    referenceLocations,
  };
};
