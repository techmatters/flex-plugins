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
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';

import { RootState } from '../../../../states';
import { Column, FormLabel, FormOption, FormSelect, FormSelectWrapper, Row } from '../../../../styles';
import { ResourcesSearchFormFilterHeader, ResourcesSearchFormSettingBox } from '../../styles';
import { selectFilterSelections, updateSearchFormAction } from '../../../../states/resources/search';
import { FilterOption } from '../../../../states/resources/types';
import { namespace, referrableResourcesBase } from '../../../../states/storeNamespaces';
import {
  loadReferenceLocationsAsyncAction,
  ReferenceLocationState,
} from '../../../../states/resources/referenceLocations';
import {
  USCHFilterOptions,
  USCHFilterSelections,
  USCHReferenceLocationList,
} from '../../../../states/resources/filterSelectionState/usch';
import asyncDispatch from '../../../../states/asyncDispatch';
import { getAseloFeatureFlags } from '../../../../hrmConfig';
import { getFilterSelectionState } from '..';
import CategoriesFilter from './CategoriesFilter';

const NO_LOCATION_SELECTED = '__NO_LOCATION_SELECTED__';

type FilterName = keyof USCHFilterSelections;
type LocationFilterName = Extract<keyof USCHFilterSelections, 'country' | 'province' | 'city'>;

const ResourceSearchFilters: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  const { loadReferenceActionFunction } = getFilterSelectionState();
  const { enable_category_filters: enableCategoryFilters } = getAseloFeatureFlags();

  const { referenceLocations, filterOptions, parameters } = useSelector(
    (state: RootState) => state[namespace][referrableResourcesBase].search,
  );
  const { country, province, city, categories } = (filterOptions || {}) as USCHFilterOptions;
  const filterSelections: USCHFilterSelections = useSelector(selectFilterSelections);
  const [categoriesLoading, setCategoriesLoading] = useState(() => !referenceLocations.categoryOptions?.length);

  const updateFilterSelection = (filterName: FilterName, filterValue: string | string[] | undefined) => {
    let reduxFilterValue = filterValue;
    if (filterName === 'country' || filterName === 'province' || filterName === 'city') {
      reduxFilterValue = filterValue === NO_LOCATION_SELECTED ? undefined : filterValue;
    }
    dispatch(updateSearchFormAction({ filterSelections: { [filterName]: reduxFilterValue } }));
  };

  useEffect(() => {
    const loadReferenceLocations = (referenceLocations: ReferenceLocationState) => {
      const loadedOptionsByList: [USCHReferenceLocationList, FilterOption[] | undefined][] = [
        [USCHReferenceLocationList.Country, referenceLocations.countryOptions],
        [USCHReferenceLocationList.Provinces, referenceLocations.provinceOptions],
        [USCHReferenceLocationList.Cities, referenceLocations.cityOptions],
      ];
      if (enableCategoryFilters) {
        loadedOptionsByList.push([USCHReferenceLocationList.Categories, referenceLocations.categoryOptions]);
      }
      loadedOptionsByList
        .filter(([, loadedOptions]) => !loadedOptions?.length)
        .forEach(async ([list]) => {
          // asyncDispatch settles once the list is loaded or has failed, it never throws
          await searchAsyncDispatch(
            loadReferenceLocationsAsyncAction({ loadReferenceActionFunction: loadReferenceActionFunction(list) }),
          );
          if (list === USCHReferenceLocationList.Categories) {
            setCategoriesLoading(false);
          }
        });
    };

    loadReferenceLocations(referenceLocations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locationDropdown = ({
    locationFilterName,
    optionList,
  }: {
    locationFilterName: LocationFilterName;
    optionList: FilterOption[];
  }) => {
    const capitalizedLocationFilterName = locationFilterName.charAt(0).toUpperCase() + locationFilterName.slice(1);
    return (
      <FormSelectWrapper style={{ width: '100%', opacity: (optionList?.length || 0) > 1 ? 1 : 0.2 }}>
        <FormSelect
          id={`location-${locationFilterName}`}
          data-testid={`Resources-Search-Location-${capitalizedLocationFilterName}`}
          name={`location-${locationFilterName}`}
          onChange={({ target: { value } }) => updateFilterSelection(locationFilterName, value)}
          value={filterSelections[locationFilterName] ?? NO_LOCATION_SELECTED}
          style={{ width: '100%' }}
        >
          {(optionList || []).map(({ value, label }) => (
            <FormOption key={value ?? NO_LOCATION_SELECTED} value={value ?? NO_LOCATION_SELECTED}>
              {label ?? value}
            </FormOption>
          ))}
        </FormSelect>
      </FormSelectWrapper>
    );
  };

  return (
    <Column>
      <ResourcesSearchFormSettingBox>
        <ResourcesSearchFormFilterHeader>
          <Template code="Resources-Search-Location" />
        </ResourcesSearchFormFilterHeader>
        <Row key="location" style={{ marginTop: '10px', marginBottom: '10px', gap: '60px' }}>
          <Column
            style={{
              width: '33%',
              maxWidth: '166px',
              gap: '4px',
            }}
          >
            <FormLabel htmlFor="location-region">
              <Template code="Country" />
            </FormLabel>
            {locationDropdown({
              locationFilterName: 'country',
              optionList: country,
            })}
          </Column>
          <Column
            style={{
              width: '33%',
              maxWidth: '166px',
              gap: '4px',
            }}
          >
            <FormLabel htmlFor="location-province">
              <Template code="State" />
            </FormLabel>
            {locationDropdown({ locationFilterName: 'province', optionList: province })}
          </Column>
          <Column
            style={{
              width: '33%',
              maxWidth: '166px',
              gap: '4px',
            }}
          >
            <FormLabel htmlFor="location-city">
              <Template code="City" />
            </FormLabel>
            {locationDropdown({ locationFilterName: 'city', optionList: city })}
          </Column>
        </Row>
      </ResourcesSearchFormSettingBox>
      {enableCategoryFilters && (
        <CategoriesFilter
          loading={categoriesLoading}
          options={categories || []}
          selectedValues={filterSelections.categories ?? []}
          onChange={selectedValues => updateFilterSelection('categories', selectedValues)}
        />
      )}
    </Column>
  );
};

export default ResourceSearchFilters;
