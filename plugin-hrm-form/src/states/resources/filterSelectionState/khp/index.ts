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

import { getReferenceAttributeList, ReferenceAttributeStringValue } from '../../../../services/ResourceService';
import type { ReferrableResourceSearchState } from '../../search';
import type { FilterOption } from '../../types';
import { dedupAndSort, LoadReferenceActionFunction, ReferenceLocationState } from '../../referenceLocations';

export type KHPReferenceLocationState = {
  provinceOptions: FilterOption[];
  regionOptions: FilterOption[];
  cityOptions: FilterOption[];
};

export const referenceLocationsInitialState: KHPReferenceLocationState = {
  provinceOptions: [],
  regionOptions: [],
  cityOptions: [],
};

export const enum KHPReferenceLocationList {
  Provinces = 'provinces',
  Regions = 'country/province/region',
  Cities = 'country/province/region/city',
}

const minAgeOptions: FilterOption<number>[] = [
  { label: '0', value: undefined },
  ...Array.from({ length: 30 }, (_, i) => i + 1).map(age => ({ value: age })),
];

const maxAgeOptions: FilterOption<number>[] = [
  ...Array.from({ length: 30 }, (_, i) => i).map(age => ({ value: age })),
  { value: undefined, label: '30+' },
];

export type KHPFilterOptions = {
  feeStructure: FilterOption[];
  howServiceIsOffered: FilterOption[];
  province: FilterOption[];
  region?: FilterOption[];
  city?: FilterOption[];
  minEligibleAge: FilterOption<number>[];
  maxEligibleAge: FilterOption<number>[];
};

export const initialFilterOptions: KHPFilterOptions = {
  feeStructure: [
    { value: 'Free' },
    { value: 'Cost Unknown' },
    { value: 'Membership Fee' },
    { value: 'Cost for Service' },
    { value: 'Sliding Scale' },
    { value: 'One Time Small Fee' },
    { value: 'Covered by Health Insurance' },
  ],
  howServiceIsOffered: [{ value: 'In-person Support' }, { value: 'Online Support' }, { value: 'Phone Support' }],
  province: [{ label: '', value: undefined }],
  region: [],
  city: [],
  minEligibleAge: minAgeOptions,
  maxEligibleAge: maxAgeOptions,
};

export type KHPFilterSelections = {
  city?: string;
  region?: string;
  province?: string;
  interpretationTranslationServicesAvailable?: true;
  minEligibleAge?: number;
  maxEligibleAge?: number;
  feeStructure?: string[];
  howServiceIsOffered?: string[];
};

const getFilterOptionsBasedOnSelections = (
  filterSelections: KHPFilterSelections = {},
  { provinceOptions, regionOptions, cityOptions }: ReferenceLocationState = {},
): KHPFilterOptions => {
  return {
    ...initialFilterOptions,
    minEligibleAge: minAgeOptions.filter(opt => {
      const maxSelection = filterSelections.maxEligibleAge ?? 1000;
      return opt.value === undefined || opt.value <= maxSelection;
    }),
    maxEligibleAge: maxAgeOptions.filter(opt => {
      const minSelection = filterSelections.minEligibleAge ?? 0;
      return opt.value === undefined || opt.value >= minSelection;
    }),
    province: [{ label: '', value: undefined }, ...(provinceOptions || [])],
    region: [
      { label: '', value: undefined },
      ...(regionOptions || []).filter(
        ({ value }) => filterSelections.province && (!value || value.startsWith(filterSelections.province)),
      ),
    ],
    city: [
      { label: '', value: undefined },
      ...(cityOptions || []).filter(({ value }) => {
        const { region, province } = filterSelections;
        if (!province) {
          return false;
        }
        const startPrefix = region?.startsWith(province) ? region : province;
        return !value || value.startsWith(startPrefix);
      }),
    ],
  };
};

const ensureFilterSelectionsAreValid = (
  filterSelections: KHPFilterSelections = {},
  filterOptions: KHPFilterOptions = initialFilterOptions,
): KHPFilterSelections => {
  return {
    // Don't add undefined values to the filter selections
    ...Object.fromEntries(
      Object.entries({
        ...filterSelections,
        minEligibleAge: filterOptions.minEligibleAge.find(opt => opt.value === filterSelections.minEligibleAge)?.value,
        maxEligibleAge: filterOptions.maxEligibleAge.find(opt => opt.value === filterSelections.maxEligibleAge)?.value,
        province: filterOptions.province.find(opt => opt.value === filterSelections.province)?.value,
        region: filterOptions.region.find(opt => opt.value === filterSelections.region)?.value,
        city: filterOptions.city.find(opt => opt.value === filterSelections.city)?.value,
      }).filter(([, value]) => value !== undefined),
    ),
  };
};

export const loadReferenceActionFunction: (list: string) => LoadReferenceActionFunction = (
  list: string,
) => async () => {
  const apiAttributes = await getReferenceAttributeList(list, 'en');
  const unsortedOptions = apiAttributes.map(({ value, info }: ReferenceAttributeStringValue) => ({
    label: info?.name ?? value,
    value,
  }));
  return { list, options: dedupAndSort(unsortedOptions) };
};

export const handlerUpdateSearchFormAction = (state: ReferrableResourceSearchState, { payload }) => {
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

export const handleLoadReferenceLocationsAsyncActionFulfilled = (state: ReferrableResourceSearchState, { payload }) => {
  const { list, options } = payload;
  let { referenceLocations } = state;
  switch (list) {
    case KHPReferenceLocationList.Provinces:
      referenceLocations = { ...referenceLocations, provinceOptions: options };
      break;
    case KHPReferenceLocationList.Regions:
      referenceLocations = { ...referenceLocations, regionOptions: options };
      break;
    case KHPReferenceLocationList.Cities:
      referenceLocations = { ...referenceLocations, cityOptions: options };
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
      filterSelections: validatedFilterSelections,
    },
    referenceLocations,
  };
};
