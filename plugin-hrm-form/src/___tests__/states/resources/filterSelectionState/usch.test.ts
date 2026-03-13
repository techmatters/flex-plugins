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

import { getDistinctStringAttributes } from '../../../../services/ResourceService';
import {
  handleLoadReferenceLocationsAsyncActionFulfilled,
  handlerUpdateSearchFormAction,
  loadReferenceActionFunction,
  referenceLocationsInitialState,
  USCHReferenceLocationList,
} from '../../../../states/resources/filterSelectionState/usch';
import { ReferrableResourceSearchState, ResourceSearchStatus } from '../../../../states/resources/search';

jest.mock('../../../../services/ResourceService');

const mockGetDistinctStringAttributes = getDistinctStringAttributes as jest.MockedFunction<
  typeof getDistinctStringAttributes
>;

const baseSearchState: ReferrableResourceSearchState = {
  referenceLocations: {
    countryOptions: [
      { value: 'Canada', label: 'Canada' },
      { value: 'United States', label: 'United States' },
    ],
    provinceOptions: [
      { value: 'United States/California', label: 'California' },
      { value: 'United States/New York', label: 'New York' },
      { value: 'Canada/Ontario', label: 'Ontario' },
    ],
    cityOptions: [
      { value: 'United States/California/Los Angeles', label: 'Los Angeles' },
      { value: 'United States/New York/New York City', label: 'New York City' },
      { value: 'Canada/Ontario/Toronto', label: 'Toronto' },
    ],
  },
  filterOptions: {
    country: [
      { label: '', value: undefined },
      { value: 'Canada', label: 'Canada' },
      { value: 'United States', label: 'United States' },
    ],
    province: [{ label: '', value: undefined }],
    city: [],
  },
  parameters: {
    filterSelections: {},
    generalSearchTerm: '',
    pageSize: 5,
  },
  currentPage: 0,
  suggesters: {},
  status: ResourceSearchStatus.NotSearched,
  results: [],
};

describe('USCH filterSelectionState', () => {
  describe('referenceLocationsInitialState', () => {
    test('has the correct initial shape with empty option arrays', () => {
      expect(referenceLocationsInitialState).toStrictEqual({
        countryOptions: [],
        provinceOptions: [],
        cityOptions: [],
      });
    });
  });

  describe('loadReferenceActionFunction', () => {
    beforeEach(() => {
      mockGetDistinctStringAttributes.mockReset();
    });

    test('Country - calls getDistinctStringAttributes with the correct key', async () => {
      mockGetDistinctStringAttributes.mockResolvedValue([]);
      await loadReferenceActionFunction(USCHReferenceLocationList.Country)();
      expect(getDistinctStringAttributes).toHaveBeenCalledWith({ key: USCHReferenceLocationList.Country });
    });

    test('Provinces - calls getDistinctStringAttributes with the correct key', async () => {
      mockGetDistinctStringAttributes.mockResolvedValue([]);
      await loadReferenceActionFunction(USCHReferenceLocationList.Provinces)();
      expect(getDistinctStringAttributes).toHaveBeenCalledWith({ key: USCHReferenceLocationList.Provinces });
    });

    test('Cities - calls getDistinctStringAttributes with the correct key', async () => {
      mockGetDistinctStringAttributes.mockResolvedValue([]);
      await loadReferenceActionFunction(USCHReferenceLocationList.Cities)();
      expect(getDistinctStringAttributes).toHaveBeenCalledWith({ key: USCHReferenceLocationList.Cities });
    });

    test('returns the list name and sorted/deduped options using label from info.name when available', async () => {
      mockGetDistinctStringAttributes.mockResolvedValue([
        { value: 'United States', info: { name: 'United States' }, id: '1', language: 'en' },
        { value: 'Canada', info: { name: 'Canada' }, id: '2', language: 'en' },
        { value: 'Mexico', info: { name: 'Mexico' }, id: '3', language: 'en' },
      ]);
      const result = await loadReferenceActionFunction(USCHReferenceLocationList.Country)();
      expect(result).toStrictEqual({
        list: USCHReferenceLocationList.Country,
        options: [
          { value: 'Canada', label: 'Canada' },
          { value: 'Mexico', label: 'Mexico' },
          { value: 'United States', label: 'United States' },
        ],
      });
    });

    test('uses value as label when info.name is not available', async () => {
      mockGetDistinctStringAttributes.mockResolvedValue([
        { value: 'United States', info: null, id: '1', language: 'en' },
        { value: 'Canada', info: null, id: '2', language: 'en' },
      ]);
      const result = await loadReferenceActionFunction(USCHReferenceLocationList.Country)();
      expect(result).toStrictEqual({
        list: USCHReferenceLocationList.Country,
        options: [
          { value: 'Canada', label: 'Canada' },
          { value: 'United States', label: 'United States' },
        ],
      });
    });

    test('deduplicates options with the same value, keeping the last', async () => {
      mockGetDistinctStringAttributes.mockResolvedValue([
        { value: 'United States', info: { name: 'United States (first)' }, id: '1', language: 'en' },
        { value: 'United States', info: { name: 'United States (second)' }, id: '2', language: 'en' },
      ]);
      const result = await loadReferenceActionFunction(USCHReferenceLocationList.Country)();
      expect(result.options).toHaveLength(1);
      expect(result.options[0]).toStrictEqual({ value: 'United States', label: 'United States (second)' });
    });
  });

  describe('handleLoadReferenceLocationsAsyncActionFulfilled', () => {
    const emptyState: ReferrableResourceSearchState = {
      ...baseSearchState,
      referenceLocations: {
        countryOptions: [],
        provinceOptions: [],
        cityOptions: [],
      },
      parameters: { filterSelections: {}, generalSearchTerm: '', pageSize: 5 },
    };

    describe('Country list', () => {
      test('updates countryOptions in referenceLocations', () => {
        const options = [
          { value: 'Canada', label: 'Canada' },
          { value: 'United States', label: 'United States' },
        ];
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options },
        });
        // United States is moved to the head since it's the defaultCountryTarget and was not already first
        expect(newState.referenceLocations.countryOptions).toStrictEqual([
          { value: 'United States', label: 'United States' },
          { value: 'Canada', label: 'Canada' },
        ]);
      });

      test('updates filterOptions.country to include loaded countries with empty option at top', () => {
        const options = [
          { value: 'Canada', label: 'Canada' },
          { value: 'United States', label: 'United States' },
        ];
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options },
        });
        // United States is moved to head; filterOptions.country prepends an empty option
        expect(newState.filterOptions.country).toStrictEqual([
          { label: '', value: undefined },
          { value: 'United States', label: 'United States' },
          { value: 'Canada', label: 'Canada' },
        ]);
      });

      const optionsWithUS = [
        { value: 'Canada', label: 'Canada' },
        { value: 'Mexico', label: 'Mexico' },
        { value: 'United States', label: 'United States' },
      ];

      const optionsWithoutUS = [
        { value: 'Canada', label: 'Canada' },
        { value: 'Mexico', label: 'Mexico' },
      ];

      test('options include "United States" - moves it to the top of the country options', () => {
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options: optionsWithUS },
        });
        const countryOptions = newState.referenceLocations.countryOptions as Array<{ value: string }>;
        expect(countryOptions[0].value).toBe('United States');
      });

      test('options include "United States" - auto-selects it as the country filter', () => {
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options: optionsWithUS },
        });
        expect(newState.parameters.filterSelections.country).toBe('United States');
      });

      test('options include "United States" - does not duplicate it', () => {
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options: optionsWithUS },
        });
        const countryOptions = newState.referenceLocations.countryOptions as Array<{ value: string }>;
        const usCount = countryOptions.filter(o => o.value === 'United States').length;
        expect(usCount).toBe(1);
      });

      test('"United States" is already at index 0 - order unchanged, NOT auto-selected (containsDefaultOption requires index > 0)', () => {
        const optionsUSFirst = [
          { value: 'United States', label: 'United States' },
          { value: 'Canada', label: 'Canada' },
        ];
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options: optionsUSFirst },
        });
        const countryOptions = newState.referenceLocations.countryOptions as Array<{ value: string }>;
        expect(countryOptions[0].value).toBe('United States');
        expect(newState.parameters.filterSelections.country).toBeUndefined();
      });

      test('options do not include "United States" - does not auto-select any country', () => {
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options: optionsWithoutUS },
        });
        expect(newState.parameters.filterSelections.country).toBeUndefined();
      });

      test('options do not include "United States" - loads all countries in the options', () => {
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Country, options: optionsWithoutUS },
        });
        const countryOptions = newState.referenceLocations.countryOptions as Array<{ value: string }>;
        expect(countryOptions.map(o => o.value)).toEqual(expect.arrayContaining(['Canada', 'Mexico']));
      });
    });

    describe('Provinces list', () => {
      test('updates provinceOptions in referenceLocations', () => {
        const options = [
          { value: 'United States/California', label: 'California' },
          { value: 'United States/New York', label: 'New York' },
        ];
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Provinces, options },
        });
        expect(newState.referenceLocations.provinceOptions).toStrictEqual(options);
      });

      test('does not affect other reference location state', () => {
        const options = [{ value: 'United States/California', label: 'California' }];
        const stateWithCountries: ReferrableResourceSearchState = {
          ...emptyState,
          referenceLocations: {
            ...emptyState.referenceLocations,
            countryOptions: [{ value: 'United States', label: 'United States' }],
          },
        };
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithCountries, {
          payload: { list: USCHReferenceLocationList.Provinces, options },
        });
        expect(newState.referenceLocations.countryOptions).toStrictEqual([
          { value: 'United States', label: 'United States' },
        ]);
      });

      test('filters province options by selected country', () => {
        const stateWithCountry: ReferrableResourceSearchState = {
          ...emptyState,
          parameters: { ...emptyState.parameters, filterSelections: { country: 'United States' } },
        };
        const options = [
          { value: 'United States/California', label: 'California' },
          { value: 'United States/New York', label: 'New York' },
          { value: 'Canada/Ontario', label: 'Ontario' },
        ];
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithCountry, {
          payload: { list: USCHReferenceLocationList.Provinces, options },
        });
        expect(newState.filterOptions.province).toStrictEqual([
          { label: '', value: undefined },
          { value: 'United States/California', label: 'California' },
          { value: 'United States/New York', label: 'New York' },
        ]);
      });
    });

    describe('Cities list', () => {
      test('updates cityOptions in referenceLocations', () => {
        const options = [
          { value: 'United States/California/Los Angeles', label: 'Los Angeles' },
          { value: 'United States/New York/New York City', label: 'New York City' },
        ];
        const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
          payload: { list: USCHReferenceLocationList.Cities, options },
        });
        expect(newState.referenceLocations.cityOptions).toStrictEqual(options);
      });
    });

    test('Unknown list type - does not update reference locations', () => {
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(baseSearchState, {
        payload: { list: 'unknown/list', options: [{ value: 'X', label: 'X' }] },
      });
      expect(newState.referenceLocations).toStrictEqual(baseSearchState.referenceLocations);
    });

    test('Province selection that is valid in new reference data is retained', () => {
      const stateWithCountryAndProvince: ReferrableResourceSearchState = {
        ...emptyState,
        parameters: {
          ...emptyState.parameters,
          filterSelections: { country: 'United States', province: 'United States/California' },
        },
        referenceLocations: {
          ...emptyState.referenceLocations,
          countryOptions: [{ value: 'United States', label: 'United States' }],
        },
      };
      const options = [
        { value: 'United States/California', label: 'California' },
        { value: 'United States/New York', label: 'New York' },
      ];
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithCountryAndProvince, {
        payload: { list: USCHReferenceLocationList.Provinces, options },
      });
      expect(newState.parameters.filterSelections.province).toBe('United States/California');
    });

    test('Province selection not present in new reference data is preserved (defaultFilterSelection wins over absent validated key)', () => {
      // When loading provinces, the USCH implementation uses { ...defaultFilterSelection, ...validatedFilterSelections }.
      // Since validatedFilterSelections simply omits invalid keys (rather than setting them to undefined),
      // an already-selected province that is not in the newly loaded list is preserved in state.
      const stateWithCountryAndProvince: ReferrableResourceSearchState = {
        ...emptyState,
        parameters: {
          ...emptyState.parameters,
          filterSelections: { country: 'United States', province: 'United States/Texas' },
        },
        referenceLocations: {
          ...emptyState.referenceLocations,
          countryOptions: [{ value: 'United States', label: 'United States' }],
        },
      };
      const options = [
        { value: 'United States/California', label: 'California' },
        { value: 'United States/New York', label: 'New York' },
      ];
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithCountryAndProvince, {
        payload: { list: USCHReferenceLocationList.Provinces, options },
      });
      expect(newState.parameters.filterSelections.province).toBe('United States/Texas');
    });
  });

  describe('handlerUpdateSearchFormAction', () => {
    test('Updates generalSearchTerm in parameters', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { generalSearchTerm: 'new search term' },
      });
      expect(newState.parameters.generalSearchTerm).toBe('new search term');
    });

    test('Setting a country filters province options to those for the selected country', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { country: 'United States' } },
      });
      expect(newState.filterOptions.province).toStrictEqual([
        { label: '', value: undefined },
        { value: 'United States/California', label: 'California' },
        { value: 'United States/New York', label: 'New York' },
      ]);
    });

    test('Setting a country filters city options to those for the selected country', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { country: 'United States' } },
      });
      expect(newState.filterOptions.city).toStrictEqual([
        { label: '', value: undefined },
        { value: 'United States/California/Los Angeles', label: 'Los Angeles' },
        { value: 'United States/New York/New York City', label: 'New York City' },
      ]);
    });

    test('Setting a province with a country filters city options to those for the selected province', () => {
      const stateWithCountry: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: {
          ...baseSearchState.parameters,
          filterSelections: { country: 'United States' },
        },
      };
      const newState = handlerUpdateSearchFormAction(stateWithCountry, {
        payload: {
          filterSelections: { country: 'United States', province: 'United States/California' },
        },
      });
      expect(newState.filterOptions.city).toStrictEqual([
        { label: '', value: undefined },
        { value: 'United States/California/Los Angeles', label: 'Los Angeles' },
      ]);
    });

    test('No country selected - province options are empty (except empty option)', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: {} },
      });
      expect(newState.filterOptions.province).toStrictEqual([{ label: '', value: undefined }]);
    });

    test('No country selected - city options are empty (except empty option)', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: {} },
      });
      expect(newState.filterOptions.city).toStrictEqual([{ label: '', value: undefined }]);
    });

    test('Clearing country selection also clears province and city selections', () => {
      const stateWithSelections: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: {
          ...baseSearchState.parameters,
          filterSelections: {
            country: 'United States',
            province: 'United States/California',
            city: 'United States/California/Los Angeles',
          },
        },
      };
      const newState = handlerUpdateSearchFormAction(stateWithSelections, {
        payload: { filterSelections: { country: undefined } },
      });
      expect(newState.parameters.filterSelections.province).toBeUndefined();
      expect(newState.parameters.filterSelections.city).toBeUndefined();
    });

    test('Changing country clears province selection that does not belong to new country', () => {
      const stateWithSelections: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: {
          ...baseSearchState.parameters,
          filterSelections: { country: 'United States', province: 'United States/California' },
        },
      };
      const newState = handlerUpdateSearchFormAction(stateWithSelections, {
        payload: { filterSelections: { country: 'Canada', province: 'United States/California' } },
      });
      expect(newState.parameters.filterSelections.province).toBeUndefined();
    });

    test('Leaves unrelated state unchanged', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { country: 'United States' } },
      });
      expect(newState.currentPage).toBe(baseSearchState.currentPage);
      expect(newState.status).toBe(baseSearchState.status);
      expect(newState.results).toBe(baseSearchState.results);
    });
  });
});
