import React, { Dispatch, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';

import { namespace, referrableResourcesBase, RootState } from '../../states';
import { Box, Column } from '../../styles/HrmStyles';
import { ResourcesSearchSubmitButton } from '../../styles/ReferrableResources';
import { searchResourceAsyncAction, updateSearchFormAction } from '../../states/resources/search';
import { SearchTitle } from '../../styles/search';
import SearchInput from '../caseList/filters/SearchInput';
import { getResourceStrings } from '../../hrmConfig';
import asyncDispatch from '../../states/asyncDispatch';

type OwnProps = {};

const mapStateToProps = (state: RootState) => {
  const { omniSearchTerm, limit } = state[namespace][referrableResourcesBase].search.parameters;
  return {
    omniSearchTerm,
    limit,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    updateOmiSearchTerm: (omniSearchTerm: string) => dispatch(updateSearchFormAction({ omniSearchTerm })),
    submitSearch: (omniSearchTerm: string, limit: number) =>
      searchAsyncDispatch(searchResourceAsyncAction({ omniSearchTerm, limit }, 0)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const SearchResourcesForm: React.FC<Props> = ({ omniSearchTerm, limit, updateOmiSearchTerm, submitSearch }) => {
  const firstElement = useRef(null);
  const strings = getResourceStrings();
  return (
    <Column>
      <Box marginTop="10px" marginBottom="10px">
        <SearchTitle data-testid="Search-Title">
          <Template code="SearchResources-Title" />
        </SearchTitle>
      </Box>
      <SearchInput
        label={strings['Resources-SearchForm-OmniSearchLabel']}
        searchTerm={omniSearchTerm}
        innerRef={firstElement}
        onChangeSearch={event => updateOmiSearchTerm(event.target.value)}
        clearSearchTerm={() => {
          updateOmiSearchTerm('');
        }}
        onShiftTab={() => {
          /**/
        }}
      />

      <ResourcesSearchSubmitButton onClick={() => submitSearch(omniSearchTerm, limit)}>
        <Template code="Resources-SearchForm-SubmitButtonLabel" />
      </ResourcesSearchSubmitButton>
    </Column>
  );
};

SearchResourcesForm.displayName = 'ViewResource';

export default connector(SearchResourcesForm);
