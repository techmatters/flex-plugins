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

import FieldSelect from '../../../FieldSelect';
import { namespace, referrableResourcesBase, RootState } from '../../../../states';
import { Box, Column } from '../../../../styles/HrmStyles';
import SearchResultsBackButton from '../../../search/SearchResults/SearchResultsBackButton';
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceTitle,
  ViewResourceArea,
  ResourceViewContainer,
} from '../../../../styles/ReferrableResources';
import ResourceAttribute from './ResourceAttribute';
import { loadResourceAsyncAction, navigateToSearchAction, ResourceLoadStatus } from '../../../../states/resources';
import asyncDispatch from '../../../../states/asyncDispatch';
import ResourceIdCopyButton from '../../ResourceIdCopyButton';
import ResourceAttributeWithPrivacy from './ResourceAttributeWithPrivacy';
import MainContactDetails from './MainContactDetails';
import SiteDetails from './SiteDetails';
import OperatingHours from './OperatingHours';
import { convertKHPResourceData } from '../../convertResourceData';

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
  const resourceAttributes = convertKHPResourceData(resource.attributes, 'en');

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
                    <ResourceAttribute description="Details" isExpandable={true}>
                      {resourceAttributes.description}
                    </ResourceAttribute>
                  </ResourceAttributesColumn>

                  {/* SECOND COLUMN */}
                  <ResourceAttributesColumn addDivider={true}>
                    <ResourceAttributeWithPrivacy
                      isPrivate={resourceAttributes.mainContact.isPrivate}
                      description="Contact Info"
                    >
                      <MainContactDetails mainContact={resourceAttributes.mainContact} />
                    </ResourceAttributeWithPrivacy>
                    <ResourceAttribute description="Website">{resourceAttributes.website}</ResourceAttribute>
                    <ResourceAttribute description="Hours of Operation">
                      <OperatingHours operations={resourceAttributes.operations} showDescriptionOfHours={true} />
                    </ResourceAttribute>

                    {[
                      { subtitle: 'Is Open 24/7?', attributeName: resourceAttributes.available247 },
                      { subtitle: 'Ages served', attributeName: resourceAttributes.ageRange },
                      {
                        subtitle: 'Target Population',
                        attributeName: resourceAttributes.targetPopulation,
                      },
                      {
                        subtitle: 'Interpretation/ Translation Services Available?',
                        attributeName: resourceAttributes.interpretationTranslationServicesAvailable,
                      },
                      { subtitle: 'Fee Structure', attributeName: resourceAttributes.feeStructureSource },
                      { subtitle: 'How to Access Support', attributeName: resourceAttributes.howToAccessSupport },
                      { subtitle: 'Application process', attributeName: resourceAttributes.applicationProcess },
                      { subtitle: 'How is Service Offered', attributeName: resourceAttributes.howIsServiceOffered },
                      { subtitle: 'Accessibility', attributeName: resourceAttributes.accessibility },
                      { subtitle: 'Documents Required', attributeName: resourceAttributes.documentsRequired },
                    ].map(({ subtitle, attributeName }) => (
                      <ResourceAttribute key={attributeName} description={subtitle}>
                        {attributeName}
                      </ResourceAttribute>
                    ))}
                  </ResourceAttributesColumn>

                  {/* THIRD COLUMN */}
                  <ResourceAttributesColumn>
                    <span style={{ padding: '2px', width: '75%' }}>
                      <ResourceIdCopyButton resourceId={resource.id} />
                    </span>
                    <FieldSelect
                      id="select_language"
                      label="Language Preference"
                      name="language"
                      field={getField(defaultOption)}
                      options={languageOptions}
                      handleChange={e => e.target?.value}
                      /*
                       * handleBlur={() => {}}
                       * handleFocus={() => {}}
                       */
                    />
                    <ResourceAttributeWithPrivacy
                      isPrivate={resourceAttributes.primaryLocationIsPrivate === true}
                      description="Primary Address"
                    >
                      {resourceAttributes.primaryLocation}
                    </ResourceAttributeWithPrivacy>
                    <ResourceAttribute description="">
                      <SiteDetails site={resourceAttributes.site} />
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
