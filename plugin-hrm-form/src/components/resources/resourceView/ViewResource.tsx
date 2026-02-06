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
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

type Props = {
  resourceId: string;
};

const ViewResource: React.FC<Props> = ({ resourceId }) => {
  const dispatch = useDispatch();

  const resourceState = useSelector(
    (state: RootState) => state[namespace][referrableResourcesBase].resources[resourceId],
  );
  const resource = resourceState?.status === ResourceLoadStatus.Loading ? undefined : resourceState?.resource;
  const error = resourceState?.status === ResourceLoadStatus.Loading ? undefined : resourceState?.error;

  if (resource || error) {
    const { name } = resource || {};

    return (
      <ResourceViewContainer>
        <Column>
          <Box marginTop="10px" marginBottom="10px">
            <SearchResultsBackButton
              text={<Template code="SearchResultsIndex-BackToResults" />}
              // eslint-disable-next-line no-empty-function
              handleBack={() => dispatch(navigateToSearchAction())}
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
  }

  asyncDispatch<AnyAction>(dispatch)(loadResourceAsyncAction(resourceId));
  return <div>Loading...</div>;
};

ViewResource.displayName = 'ViewResource';

export default ViewResource;
