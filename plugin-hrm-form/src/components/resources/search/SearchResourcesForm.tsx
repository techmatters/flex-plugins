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

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';
import debounce from 'lodash/debounce';

import type { RootState } from '../../../states';
import { BottomButtonBar, Box, Column, SearchFormTopRule, PrimaryButton } from '../../../styles';
import {
  ResourcesSearchFormArea,
  ResourcesSearchFormContainer,
  ResourcesSearchFormSectionHeader,
  ResourcesSearchFormSettingBox,
  ResourcesSearchTitle,
  SearchFormClearButton,
} from '../styles';
import {
  ReferrableResourceSearchState,
  resetSearchFormAction,
  searchResourceAsyncAction,
  suggestSearchAsyncAction,
  updateSearchFormAction,
} from '../../../states/resources/search';
import SearchInput from '../../caseList/filters/SearchInput';
import { getTemplateStrings } from '../../../hrmConfig';
import asyncDispatch from '../../../states/asyncDispatch';
import SearchAutoComplete from './SearchAutoComplete';
import { namespace, referrableResourcesBase } from '../../../states/storeNamespaces';
import { ResourceSearchFilters } from '../mappingComponents';

const SearchResourcesForm: React.FC = () => {
  const dispatch = useDispatch();
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);

  const { generalSearchTerm, pageSize, filterSelections, suggestSearch } = useSelector((state: RootState) => {
    const {
      parameters: { generalSearchTerm, pageSize, filterSelections },
    } = state[namespace][referrableResourcesBase].search;
    const { suggestSearch } = state[namespace][referrableResourcesBase];
    return {
      generalSearchTerm,
      pageSize,
      filterSelections,
      suggestSearch,
    };
  });

  const updateGeneralSearchTerm = (generalSearchTerm: string) =>
    dispatch(updateSearchFormAction({ generalSearchTerm }));

  const submitSearch = (
    generalSearchTerm: string,
    filterSelections: ReferrableResourceSearchState['parameters']['filterSelections'],
    pageSize: number,
  ) => searchAsyncDispatch(searchResourceAsyncAction({ generalSearchTerm, pageSize, filterSelections }, 0));

  const resetSearch = () => dispatch(resetSearchFormAction());

  const [generalSearchTermBoxText, setGeneralSearchTermBoxText] = React.useState(generalSearchTerm);

  const updateSuggestSearch = useCallback(
    debounce((prefix: string) => searchAsyncDispatch(suggestSearchAsyncAction(prefix)), 300, {
      leading: true,
      trailing: true,
    }),
    [],
  );

  const firstElement = useRef(null);
  const strings = getTemplateStrings();

  const hasValidSearchSettings = () =>
    generalSearchTermBoxText !== '' ||
    Object.values(filterSelections).some(value => value !== undefined && value !== '');

  const submitSearchIfValid = () => {
    updateGeneralSearchTerm(generalSearchTermBoxText);
    if (hasValidSearchSettings()) {
      submitSearch(generalSearchTermBoxText, filterSelections, pageSize);
    }
  };

  useEffect(() => {
    updateSuggestSearch(generalSearchTermBoxText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalSearchTermBoxText]);

  useEffect(() => {
    setGeneralSearchTermBoxText(generalSearchTerm);
  }, [generalSearchTerm, setGeneralSearchTermBoxText]);

  return (
    <ResourcesSearchFormContainer>
      <Box margin="0px 5px 0px 5px" style={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
        <Box margin="25px -5px 10px 20px">
          <ResourcesSearchTitle data-testid="Resources-Search-Title">
            <Template code="Resources-Search-FormTitle" />
          </ResourcesSearchTitle>
        </Box>
        <SearchFormTopRule />
        <ResourcesSearchFormArea>
          <ResourcesSearchFormSettingBox style={{ border: 'none' }}>
            <Column>
              <Box>
                <Template code="Resources-Search-SearchTermHeader" />
              </Box>
              <SearchInput
                label={strings['Resources-SearchForm-OmniSearchLabel']}
                searchTerm={generalSearchTermBoxText}
                innerRef={firstElement}
                onBlurSearch={text => updateGeneralSearchTerm(text)}
                onChangeSearch={event => setGeneralSearchTermBoxText(event.target.value)}
                onEnter={() => {
                  submitSearchIfValid();
                }}
                clearSearchTerm={() => {
                  updateGeneralSearchTerm('');
                }}
                onShiftTab={() => {
                  /**/
                }}
              />
            </Column>
          </ResourcesSearchFormSettingBox>
          <SearchAutoComplete
            generalSearchTermBoxText={generalSearchTermBoxText}
            suggestSearch={suggestSearch}
            setGeneralSearchTermBoxText={term => {
              updateGeneralSearchTerm(term);
            }}
          />
          <ResourcesSearchFormSectionHeader data-testid="Resources-Search-FilterHeader">
            <Template code="Resources-Search-FilterHeader" />
          </ResourcesSearchFormSectionHeader>
          <ResourceSearchFilters />
        </ResourcesSearchFormArea>
      </Box>
      <BottomButtonBar>
        <SearchFormClearButton
          type="button"
          roundCorners={true}
          onClick={() => {
            setGeneralSearchTermBoxText('');
            resetSearch();
          }}
          disabled={!hasValidSearchSettings()}
        >
          <Template code="Search-ClearFormButton" />
        </SearchFormClearButton>
        <PrimaryButton
          disabled={!hasValidSearchSettings()}
          type="button"
          roundCorners={true}
          onClick={() => submitSearchIfValid()}
          data-testid="search-button"
        >
          <Template code="SearchForm-Button" />
        </PrimaryButton>
      </BottomButtonBar>
    </ResourcesSearchFormContainer>
  );
};

SearchResourcesForm.displayName = 'ViewResource';

export default SearchResourcesForm;
