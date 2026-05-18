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

import { getReferenceAttributeList } from '../../../../services/ResourceService';
import {
  handleLoadReferenceLocationsAsyncActionFulfilled,
  handlerUpdateSearchFormAction,
  initialFilterOptions,
  KHPReferenceLocationList,
  loadReferenceActionFunction,
  referenceLocationsInitialState,
} from '../../../../states/resources/filterSelectionState/khp';
import { ReferrableResourceSearchState, ResourceSearchStatus } from '../../../../states/resources/search';

jest.mock('../../../../services/ResourceService');

const mockGetReferenceAttributeList = getReferenceAttributeList as jest.MockedFunction<
  typeof getReferenceAttributeList
>;

const baseSearchState: ReferrableResourceSearchState = {
  referenceLocations: {
    provinceOptions: [
      { value: 'AB', label: 'Alberta' },
      { value: 'BC', label: 'British Columbia' },
      { value: 'ON', label: 'Ontario' },
    ],
    regionOptions: [
      { value: 'AB/Calgary', label: 'Calgary Region' },
      { value: 'AB/Edmonton', label: 'Edmonton Region' },
      { value: 'BC/Vancouver', label: 'Vancouver Region' },
    ],
    cityOptions: [
      { value: 'AB/Calgary/Calgary City', label: 'Calgary City' },
      { value: 'AB/Edmonton/Edmonton City', label: 'Edmonton City' },
      { value: 'BC/Vancouver/Vancouver City', label: 'Vancouver City' },
    ],
  },
  filterOptions: { ...initialFilterOptions },
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

describe('KHP filterSelectionState', () => {
  describe('referenceLocationsInitialState', () => {
    test('has the correct initial shape with empty option arrays', () => {
      expect(referenceLocationsInitialState).toStrictEqual({
        provinceOptions: [],
        regionOptions: [],
        cityOptions: [],
      });
    });
  });

  describe('loadReferenceActionFunction', () => {
    beforeEach(() => {
      mockGetReferenceAttributeList.mockReset();
    });

    test('Provinces - calls getReferenceAttributeList with the correct list and language', async () => {
      mockGetReferenceAttributeList.mockResolvedValue([]);
      await loadReferenceActionFunction(KHPReferenceLocationList.Provinces)();
      expect(getReferenceAttributeList).toHaveBeenCalledWith(KHPReferenceLocationList.Provinces, 'en');
    });

    test('Regions - calls getReferenceAttributeList with the correct list and language', async () => {
      mockGetReferenceAttributeList.mockResolvedValue([]);
      await loadReferenceActionFunction(KHPReferenceLocationList.Regions)();
      expect(getReferenceAttributeList).toHaveBeenCalledWith(KHPReferenceLocationList.Regions, 'en');
    });

    test('Cities - calls getReferenceAttributeList with the correct list and language', async () => {
      mockGetReferenceAttributeList.mockResolvedValue([]);
      await loadReferenceActionFunction(KHPReferenceLocationList.Cities)();
      expect(getReferenceAttributeList).toHaveBeenCalledWith(KHPReferenceLocationList.Cities, 'en');
    });

    test('returns the list name and sorted/deduped options using label from info.name when available', async () => {
      mockGetReferenceAttributeList.mockResolvedValue([
        { value: 'ON', info: { name: 'Ontario' }, id: '1', language: 'en' },
        { value: 'AB', info: { name: 'Alberta' }, id: '2', language: 'en' },
        { value: 'BC', info: { name: 'British Columbia' }, id: '3', language: 'en' },
      ]);
      const result = await loadReferenceActionFunction(KHPReferenceLocationList.Provinces)();
      expect(result).toStrictEqual({
        list: KHPReferenceLocationList.Provinces,
        options: [
          { value: 'AB', label: 'Alberta' },
          { value: 'BC', label: 'British Columbia' },
          { value: 'ON', label: 'Ontario' },
        ],
      });
    });

    test('uses value as label when info.name is not available', async () => {
      mockGetReferenceAttributeList.mockResolvedValue([
        { value: 'ON', info: null, id: '1', language: 'en' },
        { value: 'AB', info: null, id: '2', language: 'en' },
      ]);
      const result = await loadReferenceActionFunction(KHPReferenceLocationList.Provinces)();
      expect(result).toStrictEqual({
        list: KHPReferenceLocationList.Provinces,
        options: [
          { value: 'AB', label: 'AB' },
          { value: 'ON', label: 'ON' },
        ],
      });
    });

    test('deduplicates options with the same value, keeping the last', async () => {
      mockGetReferenceAttributeList.mockResolvedValue([
        { value: 'AB', info: { name: 'Alberta (first)' }, id: '1', language: 'en' },
        { value: 'AB', info: { name: 'Alberta (second)' }, id: '2', language: 'en' },
      ]);
      const result = await loadReferenceActionFunction(KHPReferenceLocationList.Provinces)();
      expect(result.options).toHaveLength(1);
      expect(result.options[0]).toStrictEqual({ value: 'AB', label: 'Alberta (second)' });
    });
  });

  describe('handleLoadReferenceLocationsAsyncActionFulfilled', () => {
    const emptyState: ReferrableResourceSearchState = {
      ...baseSearchState,
      referenceLocations: {
        provinceOptions: [],
        regionOptions: [],
        cityOptions: [],
      },
      parameters: { filterSelections: {}, generalSearchTerm: '', pageSize: 5 },
    };

    test('Provinces - updates provinceOptions in referenceLocations', () => {
      const options = [
        { value: 'ON', label: 'Ontario' },
        { value: 'AB', label: 'Alberta' },
      ];
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
        payload: { list: KHPReferenceLocationList.Provinces, options },
      });
      expect(newState.referenceLocations.provinceOptions).toStrictEqual(options);
    });

    test('Regions - updates regionOptions in referenceLocations', () => {
      const options = [
        { value: 'AB/Calgary', label: 'Calgary Region' },
        { value: 'AB/Edmonton', label: 'Edmonton Region' },
      ];
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
        payload: { list: KHPReferenceLocationList.Regions, options },
      });
      expect(newState.referenceLocations.regionOptions).toStrictEqual(options);
    });

    test('Cities - updates cityOptions in referenceLocations', () => {
      const options = [
        { value: 'AB/Calgary/Calgary City', label: 'Calgary City' },
        { value: 'AB/Edmonton/Edmonton City', label: 'Edmonton City' },
      ];
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
        payload: { list: KHPReferenceLocationList.Cities, options },
      });
      expect(newState.referenceLocations.cityOptions).toStrictEqual(options);
    });

    test('Provinces - updates filterOptions.province to include loaded provinces', () => {
      const options = [
        { value: 'AB', label: 'Alberta' },
        { value: 'ON', label: 'Ontario' },
      ];
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(emptyState, {
        payload: { list: KHPReferenceLocationList.Provinces, options },
      });
      expect(newState.filterOptions.province).toStrictEqual([
        { label: '', value: undefined },
        { value: 'AB', label: 'Alberta' },
        { value: 'ON', label: 'Ontario' },
      ]);
    });

    test('Provinces - does not affect other reference location state (regionOptions, cityOptions)', () => {
      const options = [{ value: 'AB', label: 'Alberta' }];
      const stateWithRegions: ReferrableResourceSearchState = {
        ...emptyState,
        referenceLocations: {
          ...emptyState.referenceLocations,
          regionOptions: [{ value: 'AB/Calgary', label: 'Calgary Region' }],
        },
      };
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithRegions, {
        payload: { list: KHPReferenceLocationList.Provinces, options },
      });
      expect(newState.referenceLocations.regionOptions).toStrictEqual([
        { value: 'AB/Calgary', label: 'Calgary Region' },
      ]);
    });

    test('Province selection that is valid in new reference data is retained', () => {
      const options = [
        { value: 'AB', label: 'Alberta' },
        { value: 'ON', label: 'Ontario' },
      ];
      const stateWithSelection: ReferrableResourceSearchState = {
        ...emptyState,
        parameters: { ...emptyState.parameters, filterSelections: { province: 'AB' } },
      };
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithSelection, {
        payload: { list: KHPReferenceLocationList.Provinces, options },
      });
      expect(newState.parameters.filterSelections.province).toBe('AB');
    });

    test('Province selection that is not in new reference data is cleared', () => {
      const options = [{ value: 'ON', label: 'Ontario' }];
      const stateWithSelection: ReferrableResourceSearchState = {
        ...emptyState,
        parameters: { ...emptyState.parameters, filterSelections: { province: 'AB' } },
      };
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithSelection, {
        payload: { list: KHPReferenceLocationList.Provinces, options },
      });
      expect(newState.parameters.filterSelections.province).toBeUndefined();
    });

    test('Unknown list type - does not update reference locations', () => {
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(baseSearchState, {
        payload: { list: 'unknown/list', options: [{ value: 'X', label: 'X' }] },
      });
      expect(newState.referenceLocations).toStrictEqual(baseSearchState.referenceLocations);
    });

    test('Regions - filters region options by selected province', () => {
      const stateWithProvince: ReferrableResourceSearchState = {
        ...emptyState,
        parameters: { ...emptyState.parameters, filterSelections: { province: 'AB' } },
      };
      const options = [
        { value: 'AB/Calgary', label: 'Calgary Region' },
        { value: 'AB/Edmonton', label: 'Edmonton Region' },
        { value: 'BC/Vancouver', label: 'Vancouver Region' },
      ];
      const newState = handleLoadReferenceLocationsAsyncActionFulfilled(stateWithProvince, {
        payload: { list: KHPReferenceLocationList.Regions, options },
      });
      expect(newState.filterOptions.region).toStrictEqual([
        { label: '', value: undefined },
        { value: 'AB/Calgary', label: 'Calgary Region' },
        { value: 'AB/Edmonton', label: 'Edmonton Region' },
      ]);
    });
  });

  describe('handlerUpdateSearchFormAction', () => {
    test('Updates generalSearchTerm in parameters', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { generalSearchTerm: 'new search term' },
      });
      expect(newState.parameters.generalSearchTerm).toBe('new search term');
    });

    test('Setting a province filters region options to those for the selected province', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { province: 'AB' } },
      });
      expect(newState.filterOptions.region).toStrictEqual([
        { label: '', value: undefined },
        { value: 'AB/Calgary', label: 'Calgary Region' },
        { value: 'AB/Edmonton', label: 'Edmonton Region' },
      ]);
    });

    test('Setting a province filters city options to those for the selected province (no region selected)', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { province: 'AB' } },
      });
      expect(newState.filterOptions.city).toStrictEqual([
        { label: '', value: undefined },
        { value: 'AB/Calgary/Calgary City', label: 'Calgary City' },
        { value: 'AB/Edmonton/Edmonton City', label: 'Edmonton City' },
      ]);
    });

    test('Setting a region with a province filters city options to those for the selected region', () => {
      const stateWithProvince: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: { ...baseSearchState.parameters, filterSelections: { province: 'AB' } },
      };
      const newState = handlerUpdateSearchFormAction(stateWithProvince, {
        payload: { filterSelections: { province: 'AB', region: 'AB/Calgary' } },
      });
      expect(newState.filterOptions.city).toStrictEqual([
        { label: '', value: undefined },
        { value: 'AB/Calgary/Calgary City', label: 'Calgary City' },
      ]);
    });

    test('Clearing province selection also clears region and city selections', () => {
      const stateWithSelections: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: {
          ...baseSearchState.parameters,
          filterSelections: { province: 'AB', region: 'AB/Calgary', city: 'AB/Calgary/Calgary City' },
        },
      };
      const newState = handlerUpdateSearchFormAction(stateWithSelections, {
        payload: { filterSelections: { province: undefined } },
      });
      expect(newState.parameters.filterSelections.region).toBeUndefined();
      expect(newState.parameters.filterSelections.city).toBeUndefined();
    });

    test('Changing province clears region selection that does not belong to new province', () => {
      const stateWithSelections: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: {
          ...baseSearchState.parameters,
          filterSelections: { province: 'AB', region: 'AB/Calgary' },
        },
      };
      const newState = handlerUpdateSearchFormAction(stateWithSelections, {
        payload: { filterSelections: { province: 'BC', region: 'AB/Calgary' } },
      });
      expect(newState.parameters.filterSelections.region).toBeUndefined();
    });

    test('Setting minEligibleAge filters maxEligibleAge options to values >= minEligibleAge', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { minEligibleAge: 10 } },
      });
      const maxOptions = newState.filterOptions.maxEligibleAge as Array<{ value: number | undefined }>;
      const values = maxOptions.map(o => o.value).filter(v => v !== undefined);
      expect(values.every(v => v >= 10)).toBe(true);
    });

    test('Setting maxEligibleAge filters minEligibleAge options to values <= maxEligibleAge', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { maxEligibleAge: 15 } },
      });
      const minOptions = newState.filterOptions.minEligibleAge as Array<{ value: number | undefined }>;
      const values = minOptions.map(o => o.value).filter(v => v !== undefined);
      expect(values.every(v => v <= 15)).toBe(true);
    });

    test('minEligibleAge above maxEligibleAge - clears minEligibleAge selection', () => {
      const stateWithMax: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: {
          ...baseSearchState.parameters,
          filterSelections: { maxEligibleAge: 5 },
        },
      };
      const newState = handlerUpdateSearchFormAction(stateWithMax, {
        payload: { filterSelections: { maxEligibleAge: 5, minEligibleAge: 10 } },
      });
      expect(newState.parameters.filterSelections.minEligibleAge).toBeUndefined();
    });

    test('Leaves unrelated state unchanged', () => {
      const newState = handlerUpdateSearchFormAction(baseSearchState, {
        payload: { filterSelections: { province: 'AB' } },
      });
      expect(newState.currentPage).toBe(baseSearchState.currentPage);
      expect(newState.status).toBe(baseSearchState.status);
      expect(newState.results).toBe(baseSearchState.results);
    });

    test('Non-location filters (feeStructure, howServiceIsOffered) are not affected by location selections', () => {
      const stateWithFilters: ReferrableResourceSearchState = {
        ...baseSearchState,
        parameters: {
          ...baseSearchState.parameters,
          filterSelections: { feeStructure: ['Free'], howServiceIsOffered: ['In-person Support'] },
        },
      };
      const newState = handlerUpdateSearchFormAction(stateWithFilters, {
        payload: {
          filterSelections: { feeStructure: ['Free'], howServiceIsOffered: ['In-person Support'], province: 'AB' },
        },
      });
      expect(newState.parameters.filterSelections.feeStructure).toStrictEqual(['Free']);
      expect(newState.parameters.filterSelections.howServiceIsOffered).toStrictEqual(['In-person Support']);
    });
  });
});
