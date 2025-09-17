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

import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';

import { RootState } from '../../../states';
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
import {
  changeResultPageAction,
  getCurrentPageResults,
  getPageCount,
  returnToSearchFormAction,
  searchResourceAsyncAction,
  SearchSettings,
} from '../../../states/resources/search';
import { viewResourceAction } from '../../../states/resources';
import Pagination from '../../pagination';
import asyncDispatch from '../../../states/asyncDispatch';
import ResourcePreview from './ResourcePreview';
import { namespace, referrableResourcesBase } from '../../../states/storeNamespaces';
import { ResourcesSearchResultsDescriptionDetails } from '../mappingComponents';

type OwnProps = {};

const mapStateToProps = (state: RootState) => {
  const searchState = state[namespace][referrableResourcesBase].search;
  const { error, status, currentPage, parameters } = searchState;
  const currentPageResults = getCurrentPageResults(searchState);
  return {
    parameters,
    currentPageResults,
    currentPage,
    error,
    status,
    resultPageCount: getPageCount(searchState),
    resultCount: searchState.results.length,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    returnToForm: () => dispatch(returnToSearchFormAction()),
    viewResource: (id: string) => dispatch(viewResourceAction(id)),
    changePage: (page: number) => dispatch(changeResultPageAction(page)),
    retrievePageResults: (parameters: SearchSettings, page: number) =>
      searchAsyncDispatch(searchResourceAsyncAction(parameters, page, false)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const SearchResourcesResults: React.FC<Props> = ({
  parameters,
  currentPageResults,
  error,
  resultPageCount,
  resultCount,
  currentPage,
  changePage,
  retrievePageResults,
  returnToForm,
  viewResource,
}) => {
  // If any results for the current page are undefined (i.e. expected to exist given the total result count but not in  redux yet) query the back end
  if (!currentPageResults.every(res => res)) {
    retrievePageResults(parameters, currentPage);
    return null;
  }

  return (
    <ResourcesSearchArea>
      <Column>
        <Box margin="25px 0 0 25px" style={{ paddingBottom: '10px' }}>
          <SearchResultsBackButton
            text={<Template code="Return to Search Criteria" />}
            // eslint-disable-next-line no-empty-function
            handleBack={returnToForm}
          />
        </Box>
        <SearchFormTopRule />
        <ResourcesSearchResultsHeader>
          <ResourcesSearchTitle data-testid="SearchResources-Title">
            <Template code="Resources-Search-ResultsTitle" />
          </ResourcesSearchTitle>
          <ResourcesSearchResultsDescription>
            <Template code="Resources-Search-ResultsDescription" count={resultCount} />
            {parameters.generalSearchTerm && (
              <Template
                code="Resources-Search-ResultsDescription-GeneralSearchTerm"
                generalSearchTerm={parameters.generalSearchTerm}
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
              <ResourcePreview resourceResult={result} onClickViewResource={() => viewResource(result.id)} />
            </li>
          ))}
        </ResourcesSearchResultsList>
        {resultPageCount > 0 ? (
          <div style={{ minHeight: '100px' }}>
            <Pagination
              transparent
              page={currentPage}
              pagesCount={resultPageCount}
              handleChangePage={pageNumber => changePage(pageNumber)}
            />
          </div>
        ) : null}
      </Column>
    </ResourcesSearchArea>
  );
};

SearchResourcesResults.displayName = 'ViewResource';

export default connector(SearchResourcesResults);
