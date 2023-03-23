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
import React, { Dispatch, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnyAction } from 'redux';
import { Template } from '@twilio/flex-ui';
import PhoneIcon from '@material-ui/icons/Phone';

import FieldSelect from '../../FieldSelect';
import { namespace, referrableResourcesBase, RootState } from '../../../states';
import { Box, Column } from '../../../styles/HrmStyles';
import SearchResultsBackButton from '../../search/SearchResults/SearchResultsBackButton';
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceTitle,
  ViewResourceArea,
  ResourceViewContainer,
} from '../../../styles/ReferrableResources';
import ResourceAttribute from './ResourceAttribute';
import { loadResourceAsyncAction, navigateToSearchAction, ResourceLoadStatus } from '../../../states/resources';
import asyncDispatch from '../../../states/asyncDispatch';
import ResourceIdCopyButton from '../ResourceIdCopyButton';
import ResourceAttributeWithPrivacy from './ResourceAttributeWithPrivacy';
import ViewResourceMainContactDetails from './MainContactDetails';
import ViewResourceSiteDetails from './SiteDetails';
import OperatingHours from './OperatingHours';

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

  const languageOptions = [
    { label: 'English', value: 'english' },
    { label: 'French', value: 'french' },
  ];
  const defaultOption = languageOptions[0];
  const getField = value => ({
    value,
    error: null,
    validation: null,
    touched: false,
  });
  // const [language, setLanguage] = useState(defaultOption);

  const getSingleStringVal = (attributes: Object, keyName: string) => {
    if (keyName in attributes) {
      const propVal = attributes[keyName];
      if (propVal[0].hasOwnProperty('value') && typeof propVal[0].value === 'string') {
        const keysToKeep = ['primaryLocationIsPrivate', 'isLocationPrivate', 'isPrivate'];
        if (propVal[0].value === 'true' && !keysToKeep.includes(keyName)) {
          return 'Yes';
        } else if (propVal[0].value === 'false' && !keysToKeep.includes(keyName)) {
          return 'No';
        }
        return propVal[0].value;
      }
    }
    return null;
  };
  /*
   * const getDescriptionInfo = (descriptionObj, language: string) => {
   *   const languageIndex = descriptionObj.findIndex(obj => obj.language === language);
   *   if (descriptionObj[languageIndex].info.description) {
   *     return descriptionObj[languageIndex].info.description;
   *   }
   *   return null;
   * };
   */
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

  const handleDescriptionInfo = descriptionObj => {
    return descriptionObj[0].info.text;
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
              {resource.attributes && (
                <ResourceAttributesContainer>
                  {/* FIRST COLUMN */}
                  <ResourceAttributesColumn>
                    <ResourceAttribute description="Status">
                      {getSingleStringVal(resource.attributes, 'status')}
                    </ResourceAttribute>

                    <ResourceAttribute description="Taxonomy Code">
                      {getSingleStringVal(resource.attributes, 'taxonomyCode')}
                    </ResourceAttribute>

                    <ResourceAttribute description="Details" isExpandable={true}>
                      {handleDescriptionInfo(resource.attributes.description)}
                    </ResourceAttribute>
                  </ResourceAttributesColumn>

                  {/* SECOND COLUMN */}
                  <ResourceAttributesColumn>
                    <ResourceAttributeWithPrivacy
                      isPrivate={getSingleStringVal(resource.attributes.mainContact, 'isPrivate') === 'false'}
                      description="Contact Info"
                    >
                      <ViewResourceMainContactDetails attributes={resource.attributes} />
                    </ResourceAttributeWithPrivacy>

                    <ResourceAttribute description="Website">
                      {getSingleStringVal(resource.attributes, 'website')}
                    </ResourceAttribute>

                    <ResourceAttribute description="Hours of Operation">
                      <OperatingHours operations={resource.attributes.operations} />
                    </ResourceAttribute>

                    <ResourceAttribute description="Keywords">
                      {getSingleStringVal(resource.attributes, 'keywords')}
                    </ResourceAttribute>
                    <ResourceAttribute description="Is Open 24/7?">
                      {getSingleStringVal(resource.attributes, 'available247')}
                    </ResourceAttribute>

                    <ResourceAttribute description="Ages served">
                      {handleAgeRange(resource.attributes)}
                    </ResourceAttribute>

                    <ResourceAttribute description="Target Population">
                      {getSingleStringVal(resource.attributes, 'targetPopulation')}
                    </ResourceAttribute>
                    {[
                      {
                        subtitle: 'Interpretation/ Translation Services Available?',
                        attributeName: 'interpretationTranslationServicesAvailable',
                      },
                      { subtitle: 'Fee Structure', attributeName: 'feeStructureSource' },
                      { subtitle: 'How to Access Support', attributeName: 'howToAccessSupport' },
                      { subtitle: 'Application process', attributeName: 'applicationProcess' },
                      { subtitle: 'How is Service Offered', attributeName: 'howIsServiceOffered' },
                      { subtitle: 'Accessibility', attributeName: 'accessibility' },
                      { subtitle: 'Documents Required', attributeName: 'documentsRequired' },
                    ].map(({ subtitle, attributeName }) => (
                      <ResourceAttribute key={attributeName} description={subtitle}>
                        {getSingleStringVal(resource.attributes, attributeName)}
                      </ResourceAttribute>
                    ))}

                    {/* 
                  <ResourceAttribute
                    description="Service Categories"
                    children={resource.attributes['Service Categories']}
                  />
                   */}
                  </ResourceAttributesColumn>

                  {/* THIRD COLUMN */}
                  <ResourceAttributesColumn verticalLine={true}>
                    <ResourceIdCopyButton resourceId={resource.id} />
                    <FieldSelect
                      id="select_language"
                      label="Language"
                      name="language"
                      field={getField(defaultOption)}
                      options={languageOptions}
                      handleChange={e => e.target?.value}
                      handleBlur={() => {}}
                      handleFocus={() => {}}
                    />

                    <ResourceAttributeWithPrivacy
                      isPrivate={getSingleStringVal(resource.attributes, 'primaryLocationIsPrivate') === 'false'}
                      description="Primary Address"
                    >
                      {handlePrimaryLocation(resource.attributes)}
                    </ResourceAttributeWithPrivacy>

                    <ResourceAttribute description="Sites">
                      <ViewResourceSiteDetails attributes={resource.attributes} />
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
