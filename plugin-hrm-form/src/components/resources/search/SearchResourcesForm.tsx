/* eslint-disable react/jsx-max-depth */
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

import React, { Dispatch, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';

import { namespace, referrableResourcesBase, RootState } from '../../../states';
import {
  BottomButtonBar,
  Box,
  Column,
  FormLabel,
  FormOption,
  FormSelect,
  FormSelectWrapper,
  Row,
  StyledNextStepButton,
} from '../../../styles/HrmStyles';
import {
  ResourcesSearchFormArea,
  ResourcesSearchFormContainer,
  ResourcesSearchFormFilterHeader,
  ResourcesSearchFormSectionHeader,
  ResourcesSearchTitle,
} from '../../../styles/ReferrableResources';
import {
  resetSearchFormAction,
  searchResourceAsyncAction,
  updateSearchFormAction,
  FilterOption,
  ReferrableResourceSearchState,
} from '../../../states/resources/search';
import SearchInput from '../../caseList/filters/SearchInput';
import { getTemplateStrings } from '../../../hrmConfig';
import asyncDispatch from '../../../states/asyncDispatch';
import { FiltersCheckbox, MultiSelectCheckboxLabel } from '../../../styles/caseList/filters';

type OwnProps = {};
type FilterName = keyof ReferrableResourceSearchState['parameters']['filterSelections'];
// This type definition is a bit convoluted but it self checks if the option names change in the state;
type CheckboxFilterName = keyof Pick<
  ReferrableResourceSearchState['parameters']['filterSelections'],
  'howServiceIsOffered' | 'feeStructure' | 'targetPopulations'
>;

const mapStateToProps = (state: RootState) => {
  const {
    parameters: { generalSearchTerm, pageSize, filterSelections },
    filterOptions,
  } = state[namespace][referrableResourcesBase].search;
  return {
    generalSearchTerm,
    pageSize,
    filterSelections,
    filterOptions,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    updateGeneralSearchTerm: (generalSearchTerm: string) => dispatch(updateSearchFormAction({ generalSearchTerm })),
    updateFilterSelection: (filterName: FilterName, filterValue: string | number | boolean | string[]) =>
      dispatch(updateSearchFormAction({ filterSelections: { [filterName]: filterValue } })),
    submitSearch: (
      generalSearchTerm: string,
      filterSelections: ReferrableResourceSearchState['parameters']['filterSelections'],
      pageSize: number,
    ) => searchAsyncDispatch(searchResourceAsyncAction({ generalSearchTerm, pageSize, filterSelections }, 0)),
    resetSearch: () => dispatch(resetSearchFormAction()),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const SearchResourcesForm: React.FC<Props> = ({
  generalSearchTerm,
  pageSize,
  updateGeneralSearchTerm,
  updateFilterSelection,
  submitSearch,
  resetSearch,
  filterOptions,
  filterSelections,
}) => {
  const firstElement = useRef(null);
  const strings = getTemplateStrings();
  const { province, city, maxEligibleAge, minEligibleAge, ...checkboxOptions } = filterOptions;

  const ageRangeDropDown = (dropdown: 'Min' | 'Max', optionList: FilterOption<number>[]) => (
    <Column>
      <FormSelectWrapper>
        <FormSelect
          id={`age-range-${dropdown.toLowerCase()}`}
          data-testid={`Resources-Search-Age-Range-${dropdown}`}
          name={dropdown === 'Min' ? 'minEligibleAge' : 'maxEligibleAge'}
          onChange={({ target: { value } }) =>
            updateFilterSelection(
              dropdown === 'Min' ? 'minEligibleAge' : 'maxEligibleAge',
              value ? parseInt(value, 10) : undefined,
            )
          }
          value={dropdown === 'Min' ? filterSelections.minEligibleAge : filterSelections.maxEligibleAge}
        >
          {optionList.map(({ value, label }) => (
            <FormOption key={value} value={value}>
              {label ?? value}
            </FormOption>
          ))}
        </FormSelect>
      </FormSelectWrapper>
      <FormLabel htmlFor={`age-range-${dropdown.toLowerCase()}`} style={{ flexDirection: 'row' }}>
        <Template code={`Resources-Search-Age-Range-${dropdown}`} />
      </FormLabel>
    </Column>
  );

  const checboxSet = (optionSet: CheckboxFilterName, options: FilterOption[]) => {
    const selectedOptions = filterSelections[optionSet] ?? [];
    return (
      <Box key={optionSet} marginTop="10px" marginBottom="10px">
        <ResourcesSearchFormFilterHeader>
          <Template code={`Resources-Search-${optionSet}`} />
        </ResourcesSearchFormFilterHeader>
        {options.map(({ value, label }) => (
          <FormLabel key={value} htmlFor={value} style={{ flexDirection: 'row' }}>
            <FiltersCheckbox
              id={value}
              name={value}
              type="checkbox"
              defaultChecked={selectedOptions.includes(value)}
              onChange={({ target: { checked } }) => {
                const newSelections = checked
                  ? [...selectedOptions, value]
                  : selectedOptions.filter(option => option !== value);
                updateFilterSelection(optionSet as CheckboxFilterName, newSelections);
              }}
            />
            <MultiSelectCheckboxLabel>{label ?? value}</MultiSelectCheckboxLabel>
          </FormLabel>
        ))}
      </Box>
    );
  };

  return (
    <ResourcesSearchFormContainer>
      <ResourcesSearchFormArea>
        <Row>
          <Column>
            <Box marginTop="10px" marginBottom="10px">
              <ResourcesSearchTitle data-testid="Resources-Search-Title">
                <Template code="Resources-Search-FormTitle" />
              </ResourcesSearchTitle>
            </Box>
            <SearchInput
              label={strings['Resources-SearchForm-OmniSearchLabel']}
              searchTerm={generalSearchTerm}
              innerRef={firstElement}
              onChangeSearch={event => updateGeneralSearchTerm(event.target.value)}
              clearSearchTerm={() => {
                updateGeneralSearchTerm('');
              }}
              onShiftTab={() => {
                /**/
              }}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ResourcesSearchFormSectionHeader data-testid="Resources-Search-FilterHeader">
              <Template code="Resources-Search-FilterHeader" />
            </ResourcesSearchFormSectionHeader>
            <Box key="location" marginTop="10px" marginBottom="10px">
              <ResourcesSearchFormFilterHeader>
                <Template code="Resources-Search-Location" />
              </ResourcesSearchFormFilterHeader>
              <Column>
                <FormLabel htmlFor="location-province" />
                <FormSelectWrapper>
                  <FormSelect
                    id="location-province"
                    data-testid="Resources-Search-Location-Province"
                    name="location-province"
                    onChange={({ target: { value } }) => updateFilterSelection('province', value)}
                    value={filterSelections.province}
                  >
                    {province.map(({ value, label }) => (
                      <FormOption key={value} value={value}>
                        {label ?? value}
                      </FormOption>
                    ))}
                  </FormSelect>
                </FormSelectWrapper>
              </Column>
              <Column>
                <FormLabel htmlFor="location-city" />
                <FormSelectWrapper>
                  <FormSelect
                    id="location-city"
                    data-testid="Resources-Search-Location-Province"
                    name="location-city"
                    onChange={({ target: { value } }) => updateFilterSelection('city', value)}
                    disabled={city.length === 0}
                    value={filterSelections.city}
                  >
                    {/* eslint-disable-next-line sonarjs/no-identical-functions */}
                    {city.map(({ value, label }) => (
                      <FormOption key={value} value={value}>
                        {label ?? value}
                      </FormOption>
                    ))}
                  </FormSelect>
                </FormSelectWrapper>
              </Column>
            </Box>
            <Box key="age-range" marginTop="10px" marginBottom="10px">
              <ResourcesSearchFormFilterHeader>
                <Template code="Resources-Search-Age-Range" />
              </ResourcesSearchFormFilterHeader>
              <Box>
                {ageRangeDropDown('Min', minEligibleAge)} - {ageRangeDropDown('Max', maxEligibleAge)}
                <Column>
                  <FormLabel htmlFor="interpretationTranslationServicesAvailable" style={{ flexDirection: 'row' }}>
                    <ResourcesSearchFormFilterHeader>
                      <Template code="Resources-Search-InterpretationTranslationServicesAvailable" />
                    </ResourcesSearchFormFilterHeader>
                    <FiltersCheckbox
                      id="interpretationTranslationServicesAvailable"
                      name="interpretationTranslationServicesAvailable"
                      type="checkbox"
                      defaultChecked={Boolean(filterSelections.interpretationTranslationServicesAvailable)}
                      onChange={({ target: { checked } }) => {
                        updateFilterSelection('interpretationTranslationServicesAvailable', checked || undefined);
                      }}
                    />
                  </FormLabel>
                </Column>
              </Box>
            </Box>

            {Object.entries(checkboxOptions).map(([optionSet, options]) =>
              checboxSet(optionSet as CheckboxFilterName, options),
            )}
          </Column>
        </Row>
      </ResourcesSearchFormArea>
      <BottomButtonBar>
        <StyledNextStepButton
          type="button"
          secondary={true}
          roundCorners={true}
          onClick={resetSearch}
          style={{ marginRight: '15px ' }}
        >
          <Template code="Resources-Search-ClearFormButton" />
        </StyledNextStepButton>
        <StyledNextStepButton
          type="button"
          roundCorners={true}
          onClick={() => submitSearch(generalSearchTerm, filterSelections, pageSize)}
        >
          <Template code="SearchForm-Button" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </ResourcesSearchFormContainer>
  );
};

SearchResourcesForm.displayName = 'ViewResource';

export default connector(SearchResourcesForm);
