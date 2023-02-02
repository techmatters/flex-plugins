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
import PhoneIcon from '@material-ui/icons/Phone';

import { namespace, referrableResourcesBase, RootState } from '../../states';
import { loadResource } from '../../states/resources/loadResource';
import { Box, Column } from '../../styles/HrmStyles';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceTitle,
  ViewResourceArea,
} from '../../styles/ReferrableResources';
import ResourceAttribute from './ResourceAttribute';

type OwnProps = {
  resourceId: string;
};

const mapStateToProps = (state: RootState, { resourceId }: OwnProps) => ({
  resource: state[namespace][referrableResourcesBase].resources[resourceId]?.resource,
  error: state[namespace][referrableResourcesBase].resources[resourceId]?.error,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>, { resourceId }: OwnProps) => ({
  loadViewedResource: () => loadResource(dispatch, resourceId),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ViewResource: React.FC<Props> = ({ resource, error, loadViewedResource }) => {
  if (!resource && !error) {
    loadViewedResource();
    return <div>Loading...</div>;
  }

  return (
    <Column>
      <Box marginTop="10px" marginBottom="10px">
        <SearchResultsBackButton
          text={<Template code="SearchResultsIndex-BackToResults" />}
          // eslint-disable-next-line no-empty-function
          handleBack={() => {}}
        />
      </Box>
      <ViewResourceArea>
        {error && ( // TODO: translation / friendlyisation layer
          <>
            <ResourceTitle>
              <Template code="Resources-LoadResourceError" />
            </ResourceTitle>
            <p>{error.message}</p>
          </>
        )}
        {resource && (
          <>
            <ResourceTitle>{resource.name}</ResourceTitle>
            {resource.attributes && (
              <ResourceAttributesContainer>
                <ResourceAttributesColumn>
                  <ResourceAttribute description="Details" content={resource.attributes.Details} />
                  <ResourceAttribute description="Fee" content={resource.attributes.Fee} />
                  <ResourceAttribute
                    description="Application Process"
                    content={resource.attributes['Application Process']}
                  />
                  <ResourceAttribute description="Accessibility" content={resource.attributes.Accessibility} />
                  <ResourceAttribute description="Special Needs" content={resource.attributes['Special Needs']} />
                </ResourceAttributesColumn>
                <ResourceAttributesColumn>
                  <ResourceAttribute
                    description="Contact Info"
                    content={
                      <>
                        <PhoneIcon
                          fontSize="inherit"
                          style={{ color: '#616C864D', marginRight: 5, marginBottom: -2 }}
                        />
                        {resource.attributes.Phone}
                        {' | '}
                        {resource.attributes.Address}
                      </>
                    }
                  />
                  <ResourceAttribute
                    description="Service Categories"
                    content={resource.attributes['Service Categories']}
                  />
                  <ResourceAttribute description="Hours" content={resource.attributes.Hours} />
                  <ResourceAttribute description="Ages Served" content={resource.attributes['Ages Served']} />
                </ResourceAttributesColumn>
              </ResourceAttributesContainer>
            )}
          </>
        )}
      </ViewResourceArea>
    </Column>
  );
};

ViewResource.displayName = 'ViewResource';

export default connector(ViewResource);
