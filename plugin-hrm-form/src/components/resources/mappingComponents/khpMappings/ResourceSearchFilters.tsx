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
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';
import { Grid } from '@material-ui/core';

import { RootState } from '../../../../states';
import {
  Box,
  Column,
  FiltersCheckbox,
  FormLabel,
  FormOption,
  FormSelect,
  FormSelectWrapper,
  Row,
} from '../../../../styles';
import { ResourcesSearchFormFilterHeader, ResourcesSearchFormSettingBox } from '../../styles';
import { updateSearchFormAction } from '../../../../states/resources/search';
import { FilterOption } from '../../../../states/resources/types';
import { getAseloFeatureFlags } from '../../../../hrmConfig';
import { namespace, referrableResourcesBase } from '../../../../states/storeNamespaces';
import {
  loadReferenceLocationsAsyncAction,
  ReferenceLocationState,
} from '../../../../states/resources/referenceLocations';
import {
  KHPFilterOptions,
  KHPFilterSelections,
  KHPReferenceLocationList,
  loadReferenceActionFunction,
} from './filterSelectionState';
import asyncDispatch from '../../../../states/asyncDispatch';

const NO_AGE_SELECTED = -1;
const NO_LOCATION_SELECTED = '__NO_LOCATION_SELECTED__';

type FilterName = keyof KHPFilterSelections;
type LocationFilterName = Extract<keyof KHPFilterSelections, 'province' | 'region' | 'city'>;
// This type definition is a bit convoluted but it self checks if the option names change in the state;
type CheckboxFilterName = keyof Pick<KHPFilterSelections, 'howServiceIsOffered' | 'feeStructure'>;

const ResourceSearchFilters: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);

  const { enable_region_resource_search: enableRegionResourceSearch } = getAseloFeatureFlags();
  const { referenceLocations, filterOptions, parameters } = useSelector(
    (state: RootState) => state[namespace][referrableResourcesBase].search,
  );
  const { province, city, region, maxEligibleAge, minEligibleAge, ...checkboxOptions } = (filterOptions ||
    {}) as KHPFilterOptions;
  const filterSelections = (parameters.filterSelections || {}) as KHPFilterSelections;

  useEffect(() => {
    const loadReferenceLocations = (referenceLocations: ReferenceLocationState) => {
      if (!referenceLocations.provinceOptions?.length) {
        searchAsyncDispatch(
          loadReferenceLocationsAsyncAction({
            loadReferenceActionFunction: loadReferenceActionFunction(KHPReferenceLocationList.Provinces),
          }),
        );
      }
      if (!referenceLocations.regionOptions?.length) {
        searchAsyncDispatch(
          loadReferenceLocationsAsyncAction({
            loadReferenceActionFunction: loadReferenceActionFunction(KHPReferenceLocationList.Regions),
          }),
        );
      }
      if (!referenceLocations.cityOptions?.length) {
        searchAsyncDispatch(
          loadReferenceLocationsAsyncAction({
            loadReferenceActionFunction: loadReferenceActionFunction(KHPReferenceLocationList.Cities),
          }),
        );
      }
    };

    loadReferenceLocations(referenceLocations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilterSelection = (filterName: FilterName, filterValue: string | number | boolean | string[]) => {
    let reduxFilterValue = filterValue;
    if (filterName === 'maxEligibleAge' || filterName === 'minEligibleAge') {
      reduxFilterValue = filterValue === NO_AGE_SELECTED ? undefined : filterValue;
    } else if (filterName === 'province' || filterName === 'region' || filterName === 'city') {
      reduxFilterValue = filterValue === NO_LOCATION_SELECTED ? undefined : filterValue;
    }
    dispatch(updateSearchFormAction({ filterSelections: { [filterName]: reduxFilterValue } }));
  };

  const locationDropdown = (locationFilterName: LocationFilterName, optionList: FilterOption[]) => {
    const capitalizedLocationFilterName = locationFilterName.charAt(0).toUpperCase() + locationFilterName.slice(1);
    return (
      <FormSelectWrapper style={{ width: '100%' }}>
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

  const ageRangeDropDown = (dropdown: 'Min' | 'Max', optionList: FilterOption<number>[]) => {
    const currentSelection =
      (dropdown === 'Min' ? filterSelections.minEligibleAge : filterSelections.maxEligibleAge) ?? NO_AGE_SELECTED;
    return (
      <Row>
        <FormSelectWrapper style={{ width: '80px' }}>
          <FormSelect
            style={{ width: '80px' }}
            id={`age-range-${dropdown.toLowerCase()}`}
            data-testid={`Resources-Search-Age-Range-${dropdown}`}
            name={dropdown === 'Min' ? 'minEligibleAge' : 'maxEligibleAge'}
            onChange={({ target: { value } }) =>
              updateFilterSelection(
                dropdown === 'Min' ? 'minEligibleAge' : 'maxEligibleAge',
                value ? parseInt(value, 10) : undefined,
              )
            }
            value={currentSelection}
          >
            {(optionList || []).map(({ value, label }) => (
              <FormOption key={value ?? NO_AGE_SELECTED} value={value ?? NO_AGE_SELECTED}>
                {label ?? value}
              </FormOption>
            ))}
          </FormSelect>
        </FormSelectWrapper>
        &nbsp;
        <FormLabel htmlFor={`age-range-${dropdown.toLowerCase()}`} style={{ marginLeft: '4px', flexDirection: 'row' }}>
          <Template code={`Resources-Search-Age-Range-${dropdown}`} />
        </FormLabel>
      </Row>
    );
  };

  const checkboxSet = (optionSet: CheckboxFilterName, options: FilterOption[]) => {
    const selectedOptions = filterSelections[optionSet] ?? [];
    return (
      <ResourcesSearchFormSettingBox>
        <ResourcesSearchFormFilterHeader>
          <Template code={`Resources-Search-${optionSet}`} />
        </ResourcesSearchFormFilterHeader>
        <Grid container>
          {options.map(({ value, label }) => (
            <Grid key={value} xs={4} item>
              <FormLabel htmlFor={value} style={{ flexDirection: 'row' }}>
                <FiltersCheckbox
                  id={value}
                  name={value}
                  type="checkbox"
                  checked={selectedOptions.includes(value)}
                  onChange={({ target: { checked } }) => {
                    const newSelections = checked
                      ? [...selectedOptions, value]
                      : selectedOptions.filter(option => option !== value);
                    updateFilterSelection(
                      optionSet as CheckboxFilterName,
                      newSelections.length ? newSelections : undefined,
                    );
                  }}
                />
                &nbsp;&nbsp;{label ?? value}
              </FormLabel>
            </Grid>
          ))}
        </Grid>
      </ResourcesSearchFormSettingBox>
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
              width: enableRegionResourceSearch ? '33%' : '50%',
              maxWidth: enableRegionResourceSearch ? '166px' : '250px',
              gap: '4px',
            }}
          >
            <FormLabel htmlFor="location-province">
              <Template code="Resources-Search-Location-Province" />
            </FormLabel>
            {locationDropdown('province', province)}
          </Column>
          {enableRegionResourceSearch && (
            <Column
              style={{
                width: '33%',
                maxWidth: '166px',
                // opacity: filterSelections?.province ? 1 : 0.2,
                gap: '4px',
              }}
            >
              <FormLabel htmlFor="location-region">
                <Template code="Resources-Search-Location-Region" />
              </FormLabel>
              {locationDropdown('region', region)}
            </Column>
          )}
          <Column
            style={{
              width: enableRegionResourceSearch ? '33%' : '50%',
              maxWidth: enableRegionResourceSearch ? '166px' : '250px',
              // opacity: filterSelections?.province ? 1 : 0.2,
              gap: '4px',
            }}
          >
            <FormLabel htmlFor="location-city">
              <Template code="Resources-Search-Location-City" />
            </FormLabel>
            {locationDropdown('city', city)}
          </Column>
        </Row>
      </ResourcesSearchFormSettingBox>
      <Row key="age-range" style={{ alignItems: 'stretch', justifyContent: 'stretch', gap: '4px' }}>
        <ResourcesSearchFormSettingBox key="age-range" style={{ flexShrink: 1 }}>
          <ResourcesSearchFormFilterHeader>
            <Template code="Resources-Search-Age-Range" />
          </ResourcesSearchFormFilterHeader>
          <Row style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
            {ageRangeDropDown('Min', minEligibleAge)}
            <Box>&mdash;</Box>
            {ageRangeDropDown('Max', maxEligibleAge)}
          </Row>
        </ResourcesSearchFormSettingBox>
        <ResourcesSearchFormSettingBox style={{ flexShrink: 1, marginLeft: '4px' }}>
          <Column>
            <ResourcesSearchFormFilterHeader>
              <Template code="Resources-Search-InterpretationTranslationServicesAvailable" />
            </ResourcesSearchFormFilterHeader>
            <FormLabel htmlFor="interpretationTranslationServicesAvailable" style={{ flexDirection: 'row' }}>
              <FiltersCheckbox
                id="interpretationTranslationServicesAvailable"
                name="interpretationTranslationServicesAvailable"
                type="checkbox"
                checked={Boolean(filterSelections.interpretationTranslationServicesAvailable)}
                onChange={({ target: { checked } }) => {
                  updateFilterSelection('interpretationTranslationServicesAvailable', checked || undefined);
                }}
              />
              &nbsp;&nbsp;
              <Template code="Resources-Search-InterpretationTranslationServicesAvailable-Checkbox" />
            </FormLabel>
          </Column>
        </ResourcesSearchFormSettingBox>
      </Row>
      <Grid container>
        {Object.entries(checkboxOptions).map(([optionSet, options]) =>
          checkboxSet(optionSet as CheckboxFilterName, options),
        )}
      </Grid>
    </Column>
  );
};

export default ResourceSearchFilters;
