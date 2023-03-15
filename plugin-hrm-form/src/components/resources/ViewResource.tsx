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
import { Box, Column } from '../../styles/HrmStyles';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceTitle,
  ViewResourceArea,
} from '../../styles/ReferrableResources';
import ResourceAttribute from './ResourceAttribute';
import { loadResourceAsyncAction, navigateToSearchAction, ResourceLoadStatus } from '../../states/resources';
import asyncDispatch from '../../states/asyncDispatch';
import ResourceIdCopyButton from './ResourceIdCopyButton';

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

  //
  const getSingleStringVal = (attributes: Object, keyName: string) => {
    // Check if the specified property name exists in the object
    if (keyName in attributes) {
      const propVal = attributes[keyName];
      // Check if the property value has a "value" property and is a string
      if (propVal[0].hasOwnProperty('value') && typeof propVal[0].value === 'string') {
        if (propVal[0].value === 'true') {
          return 'Yes';
        } else if (propVal[0].value === 'false') {
          return 'No';
        } else if (keyName === 'targetPopulation') {
          // Check if keyName is targetPopulation and format the value accordingly
          const targetPopulation = propVal[0].value;
          if (targetPopulation && targetPopulation[0]?.value) {
            const { value } = targetPopulation[0];
            console.log('>>targetPopulation', keyName, value);
            return `${value}`;
          }
        }
        return propVal[0].value;
      }
    }
    // Return null if the property name or its value is not found
    return null;
  };

  const getAgeRange = (attributes: Object) => {
    const eligibilityMinAge = getSingleStringVal(attributes, 'eligibilityMinAge');
    const eligibilityMaxAge = getSingleStringVal(attributes, 'eligibilityMaxAge');
    if (eligibilityMinAge && eligibilityMaxAge) {
      return `${eligibilityMinAge} - ${eligibilityMaxAge} years`;
    }
    return 'N/A';
  };

  const colTwoAttributesToRender = [
    {
      subtitle: 'Interpretation/Translation Services Available?',
      attributeName: 'interpretationTranslationServicesAvailable',
    },
    { subtitle: 'Fee Structure', attributeName: 'feeStructureSource' },
    { subtitle: 'How to Access Support', attributeName: 'howToAccessSupport' },
    { subtitle: 'Application process', attributeName: 'applicationProcess' },
    { subtitle: 'How is Service Offered', attributeName: 'howIsServiceOffered' },
    { subtitle: 'Accessibility', attributeName: 'accessibility' },
    { subtitle: 'Documents Required', attributeName: 'documentsRequired' },
  ];

  return (
    <Column>
      <Box marginTop="10px" marginBottom="10px">
        <SearchResultsBackButton
          text={<Template code="SearchResultsIndex-BackToResults" />}
          // eslint-disable-next-line no-empty-function
          handleBack={() => navigateToSearch()}
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
            <ResourceIdCopyButton resourceId={resource.id} />
            {resource.attributes && (
              <ResourceAttributesContainer>
                <ResourceAttributesColumn>
                  <ResourceAttribute description="Status" content={getSingleStringVal(resource.attributes, 'status')} />
                  <ResourceAttribute
                    description="Taxonomy Code"
                    content={getSingleStringVal(resource.attributes, 'taxonomyCode')}
                  />
                  <ResourceAttribute description="Details" content="Details" />
                  {/* <ResourceAttribute description="Fee" content={resource.attributes.Fee} />
                  <ResourceAttribute
                    description="Application Process"
                    content={resource.attributes['Application Process']}
                  />
                  <ResourceAttribute description="Accessibility" content={resource.attributes.Accessibility} />
                  <ResourceAttribute description="Special Needs" content={resource.attributes['Special Needs']} /> */}
                </ResourceAttributesColumn>
                <ResourceAttributesColumn>
                  <ResourceAttribute description="Main contact is private" content="IsPrivate" />
                  <ResourceAttribute description="Main Contact" content="name email title phoneNumber isPrivate" />
                  <ResourceAttribute
                    description="Website"
                    content={getSingleStringVal(resource.attributes, 'website')}
                  />
                  <ResourceAttribute
                    description="Keywords"
                    content={getSingleStringVal(resource.attributes, 'keywords')}
                  />
                  <ResourceAttribute
                    description="Is Open 24/7?"
                    content={getSingleStringVal(resource.attributes, 'available247')}
                  />
                  <ResourceAttribute description="Ages served" content={getAgeRange(resource.attributes)} />
                  {/* <ResourceAttribute
                    description="Target Population"
                    content={getTargetPopulation(resource.attributes.targetPopulation)}
                  /> */}

                  <ResourceAttribute
                    description="Target Population"
                    content={getSingleStringVal(resource.attributes, 'targetPopulation')}
                  />
                  {colTwoAttributesToRender.map(({ subtitle, attributeName }) => (
                    <ResourceAttribute
                      key={attributeName}
                      description={subtitle}
                      content={getSingleStringVal(resource.attributes, attributeName)}
                    />
                  ))}

                  {/* <ResourceAttribute
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
                  <ResourceAttribute description="Ages Served" content={resource.attributes['Ages Served']} /> */}
                </ResourceAttributesColumn>
                <ResourceAttributesColumn>
                  <ResourceAttribute description="is Primary Address Private" content="primaryLocationIsPrivate" />
                  <ResourceAttribute
                    description="Primary Address"
                    content="primaryLocationCity primaryLocationProvince primaryLocationPostalCode primaryLocationPhone"
                  />
                  <ResourceAttribute description="Sites" content="Sites" />
                  <ResourceAttribute description="Operations" content="operations days of the week" />
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
