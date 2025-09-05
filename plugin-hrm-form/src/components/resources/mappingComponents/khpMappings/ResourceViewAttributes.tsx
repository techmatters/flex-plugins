/* eslint-disable react/jsx-max-depth */
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
import React from 'react';
import { Template } from '@twilio/flex-ui';

import type { ReferrableResource } from '../../../../services/ResourceService';
import { convertKHPResourceAttributes } from './convertKHPResourceAttributes';
import { Row } from '../../../../styles';
import {
  ResourceAttributesColumn,
  ResourceAttributesContainer,
  ResourceSubheading,
  ResourceSubheadingBold,
} from '../../styles';
import ResourceAttribute from '../ResourceAttribute';
import ResourceIdCopyButton from '../../ResourceIdCopyButton';
import ResourceAttributeWithPrivacy from '../ResourceAttributeWithPrivacy';
import SiteDetails from './SiteDetails';
import OperatingHours from './OperatingHours';
import useFeatureFlags from '../../../../hooks/useFeatureFlags';

const ResourceAttributes: React.FC<{ resource: ReferrableResource }> = ({ resource }) => {
  const { enable_resouorces_updates: enableResourcesUpdates } = useFeatureFlags();
  const resourceAttributes = convertKHPResourceAttributes(resource.attributes, 'en');

  return (
    <>
      {enableResourcesUpdates && resourceAttributes.nameDetails && (
        <Row style={{ marginTop: 5, marginBottom: 5 }}>
          <ResourceSubheading data-testid="resource-subtitle">
            <Template code="Alternate Name(s)" />
            {': '}
            <ResourceSubheadingBold data-testid="resource-subtitle">
              {resourceAttributes.nameDetails}
            </ResourceSubheadingBold>
          </ResourceSubheading>
        </Row>
      )}
      {resource.attributes && (
        <ResourceAttributesContainer>
          {/* FIRST COLUMN */}
          <ResourceAttributesColumn style={{ flexGrow: 3, paddingLeft: 0, marginLeft: '1px' }}>
            {[
              {
                subtitle: 'Resources-View-Details',
                attributeToDisplay: resourceAttributes.description,
              },
              ...(enableResourcesUpdates
                ? [
                    {
                      subtitle: 'Resources-View-Notes',
                      attributeToDisplay: resourceAttributes.notes.join('\n'),
                    },
                    {
                      subtitle: 'Resources-View-RecordType',
                      attributeToDisplay: resourceAttributes.recordType,
                    },
                    {
                      subtitle: 'Resources-View-Taxonomies',
                      attributeToDisplay: resourceAttributes.taxonomies.join('\n'),
                    },
                  ]
                : []),
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
              <ResourceIdCopyButton resourceId={resource.id} height="44px" />
            </span>
            <ResourceAttributeWithPrivacy
              isPrivate={resourceAttributes.primaryLocationIsPrivate}
              description="Resources-View-PrimaryAddress"
            >
              {resourceAttributes.primaryLocation}
            </ResourceAttributeWithPrivacy>

            {enableResourcesUpdates &&
              resourceAttributes.phoneNumbers.map(p => {
                // const description = 'Phone';
                const description =
                  'Phone' +
                  `${
                    p.type && p.type.toLocaleLowerCase() !== 'phone'
                      ? ` (${p.type.charAt(0).toUpperCase()}${p.type.slice(1)})`
                      : ''
                  }`;

                return (
                  <ResourceAttributeWithPrivacy key={p.number} isPrivate={p.isPrivate} description={description}>
                    {[p.number, p.name, p.description].filter(Boolean).join('\n')}
                  </ResourceAttributeWithPrivacy>
                );
              })}

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
  );
};

export default ResourceAttributes;
