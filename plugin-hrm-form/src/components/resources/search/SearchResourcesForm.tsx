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
import { BottomButtonBar, Box, Column, StyledNextStepButton } from '../../../styles/HrmStyles';
import {
  ResourcesSearchFormArea,
  ResourcesSearchFormContainer,
  ResourcesSearchTitle,
} from '../../../styles/ReferrableResources';
import {
  resetSearchFormAction,
  searchResourceAsyncAction,
  updateSearchFormAction,
} from '../../../states/resources/search';
import SearchInput from '../../caseList/filters/SearchInput';
import { getTemplateStrings } from '../../../hrmConfig';
import asyncDispatch from '../../../states/asyncDispatch';

type OwnProps = {};

const mapStateToProps = (state: RootState) => {
  const { omniSearchTerm, pageSize } = state[namespace][referrableResourcesBase].search.parameters;
  return {
    omniSearchTerm,
    pageSize,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  const searchAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    updateOmiSearchTerm: (omniSearchTerm: string) => dispatch(updateSearchFormAction({ omniSearchTerm })),
    submitSearch: (omniSearchTerm: string, pageSize: number) =>
      searchAsyncDispatch(searchResourceAsyncAction({ omniSearchTerm, pageSize }, 0)),
    resetSearch: () => dispatch(resetSearchFormAction()),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const SearchResourcesForm: React.FC<Props> = ({
  omniSearchTerm,
  pageSize,
  updateOmiSearchTerm,
  submitSearch,
  resetSearch,
}) => {
  const firstElement = useRef(null);
  const strings = getTemplateStrings();
  return (
    <ResourcesSearchFormContainer>
      <ResourcesSearchFormArea>
        <Column>
          <Box marginTop="10px" marginBottom="10px">
            <ResourcesSearchTitle data-testid="Resources-Search-Title">
              <Template code="Resources-Search-FormTitle" />
            </ResourcesSearchTitle>
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
        </Column>
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
        <StyledNextStepButton type="button" roundCorners={true} onClick={() => submitSearch(omniSearchTerm, pageSize)}>
          <Template code="SearchForm-Button" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </ResourcesSearchFormContainer>
  );
};

SearchResourcesForm.displayName = 'ViewResource';

export default connector(SearchResourcesForm);
