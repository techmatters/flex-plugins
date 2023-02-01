import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';

import { namespace, referrableResourcesBase, RootState } from '../../states';
import { Box, Column } from '../../styles/HrmStyles';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import { ResourceTitle } from '../../styles/ReferrableResources';
import {
  changeResultPageAction,
  getCurrentPageResults,
  getPageCount,
  returnToSearchFormAction,
  searchResourceAsyncAction,
  SearchSettings,
} from '../../states/resources/search';
import { SearchTitle, StyledLink } from '../../styles/search';
import { viewResourceAction } from '../../states/resources';
import Pagination from '../Pagination';
import asyncDispatch from '../../states/asyncDispatch';

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

const SearchResourcesForm: React.FC<Props> = ({
  parameters,
  currentPageResults,
  error,
  resultPageCount,
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
    <Column>
      <Box marginTop="10px" marginBottom="10px">
        <SearchResultsBackButton
          text={<Template code="Back to search criteria" />}
          // eslint-disable-next-line no-empty-function
          handleBack={returnToForm}
        />
      </Box>
      <Box marginTop="10px" marginBottom="10px">
        <SearchTitle data-testid="SearchResources-Title">
          <Template code="SearchResources-Title" />
        </SearchTitle>
      </Box>
      {error && ( // TODO: translation / friendlyisation layer
        <>
          <ResourceTitle>
            <Template code="Resources-ResourceSearchError" />
          </ResourceTitle>
          <p>{error.message}</p>
        </>
      )}
      {currentPageResults.map(result => (
        <div key={result.id}>
          <StyledLink onClick={() => viewResource(result.id)}>{result.name}</StyledLink>
        </div>
      ))}

      {resultPageCount > 1 ? (
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
  );
};

SearchResourcesForm.displayName = 'ViewResource';

export default connector(SearchResourcesForm);
