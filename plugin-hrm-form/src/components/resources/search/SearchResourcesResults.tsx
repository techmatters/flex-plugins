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

import { Box, Column, SearchFormTopRule } from '../../../styles';
import SearchResultsBackButton from '../../search/SearchResults/SearchResultsBackButton';
import {
  ResourcesSearchArea,
  ResourcesSearchResultsDescription,
  ResourcesSearchResultsHeader,
  ResourcesSearchResultsList,
  ResourcesSearchTitle,
  ResourceTitle,
} from '../styles';
import type { RootState } from '../../../states';
import {
  changeResultPageAction,
  selectResourceSearchCurrentPageResults,
  returnToSearchFormAction,
  searchResourceAsyncAction,
  selectResourceSearchCurrentPage,
  selectResourceSearchParameters,
  selectResourceSearchResultsTotal,
  selectResourceSearchPageCount,
  selectResourceSearchError,
  selectFilterSelections,
} from '../../../states/resources/search';
import { viewResourceAction } from '../../../states/resources';
import Pagination from '../../pagination';
import asyncDispatch from '../../../states/asyncDispatch';
import ResourcePreview from './ResourcePreview';
import { ResourcesSearchResultsDescriptionDetails } from '../mappingComponents';

const SearchResourcesResults: React.FC = () => {
  const dispatch = useDispatch();

  const error = useSelector(selectResourceSearchError);
  const currentPage = useSelector(selectResourceSearchCurrentPage);
  const filterSelections = useSelector(selectFilterSelections);
  const pageSize = useSelector((state: RootState) => selectResourceSearchParameters(state).pageSize);
  const generalSearchTerm = useSelector((state: RootState) => selectResourceSearchParameters(state).generalSearchTerm);
  const currentPageResults = useSelector(selectResourceSearchCurrentPageResults);
  const resultPageCount = useSelector(selectResourceSearchPageCount);
  const resultCount = useSelector(selectResourceSearchResultsTotal);
  // If any results for the current page are undefined (i.e. expected to exist given the total result count but not in  redux yet) query the back end
  useEffect(() => {
    if (!currentPageResults.every(res => res)) {
      asyncDispatch<AnyAction>(dispatch)(
        searchResourceAsyncAction({ pageSize, filterSelections, generalSearchTerm }, currentPage, false),
      );
    }
  }, [currentPage, currentPageResults, dispatch, filterSelections, generalSearchTerm, pageSize]);
  if (!currentPageResults.every(res => res)) {
    return null;
  }
  return (
    <ResourcesSearchArea>
      <Column>
        <Box margin="25px 0 0 25px" style={{ paddingBottom: '10px' }}>
          <SearchResultsBackButton
            text={<Template code="SearchResultsIndex-Back" />}
            // eslint-disable-next-line no-empty-function
            handleBack={() => dispatch(returnToSearchFormAction())}
          />
        </Box>
        <SearchFormTopRule />
        <ResourcesSearchResultsHeader>
          <ResourcesSearchTitle data-testid="SearchResources-Title">
            <Template code="Resources-Search-ResultsTitle" />
          </ResourcesSearchTitle>
          <ResourcesSearchResultsDescription>
            <Template code="Resources-Search-ResultsDescription" count={resultCount} />
            {generalSearchTerm && (
              <Template
                code="Resources-Search-ResultsDescription-GeneralSearchTerm"
                generalSearchTerm={generalSearchTerm}
              />
            )}
            <ResourcesSearchResultsDescriptionDetails />
          </ResourcesSearchResultsDescription>
        </ResourcesSearchResultsHeader>
        {error && ( // TODO: translation / friendlyisation layer
          <>
            <ResourceTitle>
              <Template code="Resources-ResourceSearchError" />
            </ResourceTitle>
            <p>{error.message}</p>
          </>
        )}
        <ResourcesSearchResultsList>
          {currentPageResults.map(result => (
            <li key={result.id}>
              <ResourcePreview
                resourceResult={result}
                onClickViewResource={() => dispatch(viewResourceAction(result.id))}
              />
            </li>
          ))}
        </ResourcesSearchResultsList>
        {resultPageCount > 0 ? (
          <div style={{ minHeight: '100px' }}>
            <Pagination
              transparent
              page={currentPage}
              pagesCount={resultPageCount}
              handleChangePage={pageNumber => dispatch(changeResultPageAction(pageNumber))}
            />
          </div>
        ) : null}
      </Column>
    </ResourcesSearchArea>
  );
};

SearchResourcesResults.displayName = 'ViewResource';

export default SearchResourcesResults;
