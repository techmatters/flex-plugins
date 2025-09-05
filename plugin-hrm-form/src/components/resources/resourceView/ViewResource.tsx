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

/* eslint-disable react/jsx-max-depth */
import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';

import { RootState } from '../../../states';
import { Box, Column } from '../../../styles';
import SearchResultsBackButton from '../../search/SearchResults/SearchResultsBackButton';
import { ResourceTitle, ViewResourceArea, ResourceViewContainer } from '../styles';
import { loadResourceAsyncAction, navigateToSearchAction, ResourceLoadStatus } from '../../../states/resources';
import asyncDispatch from '../../../states/asyncDispatch';
import { namespace, referrableResourcesBase } from '../../../states/storeNamespaces';
import { ResourceViewAttributes } from '../mappingComponents';

type OwnProps = {
  resourceId: string;
};

const mapStateToProps = (state: RootState, { resourceId }: OwnProps) => {
  const resourceState = state[namespace][referrableResourcesBase].resources[resourceId];
  if (!resourceState || resourceState.status === ResourceLoadStatus.Loading) {
    return {};
  }
  return {
    resource: resourceState.resource,
    error: resourceState.error,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>, { resourceId }: OwnProps) => ({
  loadViewedResource: () => asyncDispatch(dispatch)(loadResourceAsyncAction(resourceId)),
  navigateToSearch: () => dispatch(navigateToSearchAction()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ViewResource: React.FC<Props> = ({ resource, error, loadViewedResource, navigateToSearch }) => {
  if (!resource && !error) {
    loadViewedResource();
    return <div>Loading...</div>;
  }
  const { name } = resource;

  return (
    <ResourceViewContainer>
      <Column>
        <Box marginTop="10px" marginBottom="10px">
          <SearchResultsBackButton
            text={<Template code="SearchResultsIndex-BackToResults" />}
            // eslint-disable-next-line no-empty-function
            handleBack={() => navigateToSearch()}
          />
        </Box>
        <ViewResourceArea>
          {error && (
            <>
              <ResourceTitle>
                <Template code="Resources-LoadResourceError" />
              </ResourceTitle>
              <p>{error.message}</p>
            </>
          )}
          {resource && (
            <>
              <ResourceTitle data-testid="resource-title">{name}</ResourceTitle>
              <ResourceViewAttributes resource={resource} />
            </>
          )}
        </ViewResourceArea>
      </Column>
    </ResourceViewContainer>
  );
};

ViewResource.displayName = 'ViewResource';

export default connector(ViewResource);
