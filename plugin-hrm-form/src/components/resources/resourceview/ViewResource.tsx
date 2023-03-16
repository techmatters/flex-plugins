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

import { ResourceViewContainer } from '../../../styles/resources';
import { namespace, referrableResourcesBase, RootState } from '../../../states';
import { Box, Column } from '../../../styles/HrmStyles';
import SearchResultsBackButton from '../../search/SearchResults/SearchResultsBackButton';
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceTitle,
  ViewResourceArea,
} from '../../../styles/ReferrableResources';
import ResourceAttribute from './ResourceAttribute';
import { loadResourceAsyncAction, navigateToSearchAction, ResourceLoadStatus } from '../../../states/resources';
import asyncDispatch from '../../../states/asyncDispatch';
import ResourceIdCopyButton from '../ResourceIdCopyButton';
import ResourceAttributeWithPrivacy from './ResourceAttributeWithPrivacy';
import ViewResourceSiteDetails from './ViewResourceSiteDetails';

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

  const getSingleStringVal = (attributes: Object, keyName: string) => {
    if (keyName in attributes) {
      const propVal = attributes[keyName];
      if (propVal[0].hasOwnProperty('value') && typeof propVal[0].value === 'string') {
        if (propVal[0].value === 'true' && keyName !== 'primaryLocationIsPrivate') {
          return 'Yes';
        } else if (propVal[0].value === 'false' && keyName !== 'primaryLocationIsPrivate') {
          return 'No';
        }
        return propVal[0].value;
      }
    }
    return null;
  };

  /*
   * const handleTargetPopulation = (propVal) => {
   * Check if keyName is targetPopulation and format the value accordingly
   * const targetPopulation = propVal[0].value;
   * if (targetPopulation && targetPopulation[0]?.value) {
   *   const { value } = targetPopulation[0];
   *   console.log('>>targetPopulation', keyName, value);
   *   return `${value}`;
   *   const targetPopulation = propVal[0].value;
   *   if (targetPopulation && targetPopulation[0]?.value) {
   *     const { value } = targetPopulation[0];
   *     return `${value}`;
   *   }
   * };
   */

  const handleAgeRange = (attributes: Object) => {
    const eligibilityMinAge = getSingleStringVal(attributes, 'eligibilityMinAge');
    const eligibilityMaxAge = getSingleStringVal(attributes, 'eligibilityMaxAge');
    if (eligibilityMinAge && eligibilityMaxAge) {
      return `${eligibilityMinAge} - ${eligibilityMaxAge} years`;
    }
    return 'N/A';
  };

  const handlePrimaryLocation = (attributes: Object) => {
    const county = getSingleStringVal(attributes, 'primaryLocationCounty');
    const city = getSingleStringVal(attributes, 'primaryLocationCity');
    const province = getSingleStringVal(attributes, 'primaryLocationProvince');
    const postalCode = getSingleStringVal(attributes, 'primaryLocationPostalCode');
    const phone = getSingleStringVal(attributes, 'primaryLocationPhone');
    // eslint-disable-next-line prefer-named-capture-group
    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

    return `${county}, ${city}\r\n${province}, ${postalCode}\r\n${formattedPhone}`;
  };

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
                  {/* FIRST COLUMN */}
                  <ResourceAttributesColumn>
                    <ResourceAttribute
                      description="Status"
                      content={getSingleStringVal(resource.attributes, 'status')}
                    />
                    <ResourceAttribute
                      description="Taxonomy Code"
                      content={getSingleStringVal(resource.attributes, 'taxonomyCode')}
                    />
                    <ResourceAttribute description="Details" content="Details" />
                  </ResourceAttributesColumn>

                  {/* SECOND COLUMN */}
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
                    <ResourceAttribute description="Main contact is private" content="IsPrivate" />
                    <ResourceAttribute description="Main Contact" content="name email title phoneNumber isPrivate" />
                    <ResourceAttribute
                      description="Website"
                      content={getSingleStringVal(resource.attributes, 'website')}
                    />
                    <ResourceAttribute
                      description="Hours of Operations"
                      content={
                        <>
                          {Object.keys(resource.attributes.operations).map(key => {
                            const dayData = resource.attributes.operations[key][0];
                            const { day, hoursOfOperation, descriptionOfHours } = dayData.info;
                            if (hoursOfOperation) {
                              return (
                                <li key={key}>
                                  {day}: {hoursOfOperation}; {descriptionOfHours}
                                </li>
                              );
                            }
                            return null;
                          })}
                        </>
                      }
                    />

                    <ResourceAttribute
                      description="Keywords"
                      content={getSingleStringVal(resource.attributes, 'keywords')}
                    />
                    <ResourceAttribute
                      description="Is Open 24/7?"
                      content={getSingleStringVal(resource.attributes, 'available247')}
                    />
                    <ResourceAttribute description="Ages served" content={handleAgeRange(resource.attributes)} />
                    {/* <ResourceAttribute
                    description="Target Population"
                    content={getTargetPopulation(resource.attributes.targetPopulation)}
                  /> */}

                    <ResourceAttribute
                      description="Target Population"
                      content={getSingleStringVal(resource.attributes, 'targetPopulation')}
                    />
                    {[
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
                    ].map(({ subtitle, attributeName }) => (
                      <ResourceAttribute
                        key={attributeName}
                        description={subtitle}
                        content={getSingleStringVal(resource.attributes, attributeName)}
                      />
                    ))}

                    {/* 
                  <ResourceAttribute
                    description="Service Categories"
                    content={resource.attributes['Service Categories']}
                  />
                   */}
                  </ResourceAttributesColumn>

                  {/* THIRD COLUMN */}
                  <ResourceAttributesColumn>
                    <ResourceAttributeWithPrivacy
                      isPrivate={getSingleStringVal(resource.attributes, 'primaryLocationIsPrivate') === 'false'}
                      description="Primary Address"
                      content={handlePrimaryLocation(resource.attributes)}
                    />

                    <ResourceAttributeWithPrivacy
                      isPrivate={getSingleStringVal(resource.attributes.agency, 'isLocationPrivate') === 'false'}
                      description="Sites"
                      content={<ViewResourceSiteDetails attributes={resource.attributes} />}
                    />
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
