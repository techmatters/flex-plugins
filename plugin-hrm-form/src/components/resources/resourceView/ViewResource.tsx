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
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceTitle,
  ViewResourceArea,
  ResourceViewContainer,
} from '../styles';
import ResourceAttribute from './ResourceAttribute';
import { loadResourceAsyncAction, navigateToSearchAction, ResourceLoadStatus } from '../../../states/resources';
import asyncDispatch from '../../../states/asyncDispatch';
import ResourceIdCopyButton from '../ResourceIdCopyButton';
import ResourceAttributeWithPrivacy from './ResourceAttributeWithPrivacy';
import SiteDetails from './SiteDetails';
import OperatingHours from './OperatingHours';
import { convertKHPResourceAttributes } from '../convertKHPResourceAttributes';
import { namespace, referrableResourcesBase } from '../../../states/storeNamespaces';

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
  const { id, name, attributes } = resource;
  const resourceAttributes = convertKHPResourceAttributes(attributes, 'en');

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
              {attributes && (
                <ResourceAttributesContainer>
                  {/* FIRST COLUMN */}
                  <ResourceAttributesColumn style={{ flexGrow: 3, paddingLeft: 0, marginLeft: '1px' }}>
                    {[
                      {
                        subtitle: 'Resources-View-Details',
                        attributeToDisplay: resourceAttributes.description,
                      },
                      {
                        subtitle: 'Resources-View-TargetPopulation',
                        attributeToDisplay: resourceAttributes.targetPopulation,
                      },
                      {
                        subtitle: 'Resources-View-Accessibility',
                        attributeToDisplay: resourceAttributes.accessibility,
                      },
                      {
                        subtitle: 'Resources-View-HowToAccessSupport',
                        attributeToDisplay: resourceAttributes.howToAccessSupport,
                      },
                      {
                        subtitle: 'Resources-View-DocumentsRequired',
                        attributeToDisplay: resourceAttributes.documentsRequired,
                      },
                      { subtitle: 'Resources-View-AgesServed', attributeToDisplay: resourceAttributes.ageRange },
                      {
                        subtitle: 'Resources-View-Eligibility',
                        attributeToDisplay: resourceAttributes.eligibilityPhrase,
                      },
                      {
                        subtitle: 'Resources-View-LanguagesServiced',
                        attributeToDisplay: resourceAttributes.languagesServiced,
                      },
                    ].map(({ subtitle, attributeToDisplay }) => (
                      <ResourceAttribute key={subtitle} description={subtitle}>
                        {attributeToDisplay}
                      </ResourceAttribute>
                    ))}
                  </ResourceAttributesColumn>

                  {/* SECOND COLUMN */}
                  <ResourceAttributesColumn style={{ flexGrow: 3 }} addDivider={true}>
                    {[
                      {
                        subtitle: 'Resources-View-Website',
                        attributeToDisplay: resourceAttributes.website,
                        dataTestId: 'resource-website',
                      },
                      {
                        subtitle: 'Resources-View-ApplicationProcess',
                        attributeToDisplay: resourceAttributes.applicationProcess,
                      },
                      { subtitle: 'Resources-View-247', attributeToDisplay: resourceAttributes.available247 },
                      {
                        subtitle: 'Resources-View-HowIsServiceOffered',
                        attributeToDisplay: resourceAttributes.howIsServiceOffered,
                      },
                      {
                        subtitle: 'Resources-View-FeeStructure',
                        attributeToDisplay: resourceAttributes.feeStructureSource,
                      },
                      {
                        subtitle: 'Resources-View-TranslationServicesAvailable',
                        attributeToDisplay: resourceAttributes.interpretationTranslationServicesAvailable,
                      },
                      {
                        subtitle: 'Resources-View-Coverage',
                        attributeToDisplay: resourceAttributes.coverage,
                      },
                      // eslint-disable-next-line sonarjs/no-identical-functions
                    ].map(({ subtitle, attributeToDisplay, dataTestId }) => (
                      <ResourceAttribute key={subtitle} description={subtitle} data-testid={dataTestId}>
                        {attributeToDisplay}
                      </ResourceAttribute>
                    ))}
                  </ResourceAttributesColumn>

                  {/* THIRD COLUMN */}
                  <ResourceAttributesColumn style={{ flexGrow: 4 }}>
                    <span style={{ padding: '2px', width: '75%' }}>
                      <ResourceIdCopyButton resourceId={id} height="44px" />
                    </span>
                    <ResourceAttributeWithPrivacy
                      isPrivate={resourceAttributes.primaryLocationIsPrivate}
                      description="Resources-View-PrimaryAddress"
                    >
                      {resourceAttributes.primaryLocation}
                    </ResourceAttributeWithPrivacy>

                    <ResourceAttributeWithPrivacy
                      isPrivate={resourceAttributes.mainContact.isPrivate}
                      description="Resources-View-ContactInfo"
                    >
                      {resourceAttributes.mainContact.mainContactText}
                    </ResourceAttributeWithPrivacy>
                    <ResourceAttribute description="Resources-View-OperatingHours">
                      <OperatingHours operations={resourceAttributes.operations} showDescriptionOfHours={true} />
                    </ResourceAttribute>
                    <ResourceAttribute description="Resources-View-Sites">
                      <SiteDetails sites={resourceAttributes.site} />
                    </ResourceAttribute>
                  </ResourceAttributesColumn>
                </ResourceAttributesContainer>
              )}
            </>
          )}
        </ViewResourceArea>
      </Column>
    </ResourceViewContainer>
  );
};

ViewResource.displayName = 'ViewResource';

export default connector(ViewResource);
