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
// import { convertKHPResourceAttributes } from './convertKHPResourceAttributes';
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
import useFeatureFlags from '../../../../hooks/useFeatureFlags';
import { convertUSCHResourceAttributes } from './convertUSCHResourceAttributes';

const ResourceAttributes: React.FC<{ resource: ReferrableResource }> = ({ resource }) => {
  const resourceAttributes = convertUSCHResourceAttributes(resource.attributes, 'en');
  console.log('>>>>>>>', resourceAttributes);

  return (
    <>
      {resourceAttributes.alternateName && (
        <Row style={{ marginTop: 5, marginBottom: 5 }}>
          <ResourceSubheading data-testid="resource-subtitle">
            <Template code="Alternate Name(s)" />
            {': '}
            <ResourceSubheadingBold data-testid="resource-subtitle">
              {resourceAttributes.alternateName}
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
                subtitle: 'Short Description',
                attributeToDisplay: resourceAttributes.shortDescription,
              },
              {
                subtitle: 'Details',
                attributeToDisplay: resourceAttributes.description,
              },
              {
                subtitle: 'Comment',
                attributeToDisplay: resourceAttributes.comment,
              },
              {
                subtitle: 'Categories',
                attributeToDisplay: resourceAttributes.categories.join('\n'),
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
                subtitle: 'Website',
                attributeToDisplay: resourceAttributes.websiteAddress,
              },
              {
                subtitle: 'Fee Structure',
                attributeToDisplay: resourceAttributes.feeStructure,
              },
              {
                subtitle: 'Coverage',
                attributeToDisplay: resourceAttributes.coverage,
              },
              // eslint-disable-next-line sonarjs/no-identical-functions
            ].map(({ subtitle, attributeToDisplay }) => (
              <ResourceAttribute key={subtitle} description={subtitle}>
                {attributeToDisplay}
              </ResourceAttribute>
            ))}
          </ResourceAttributesColumn>

          {/* THIRD COLUMN */}
          <ResourceAttributesColumn style={{ flexGrow: 4 }}>
            <span style={{ padding: '2px', width: '75%' }}>
              <ResourceIdCopyButton resourceId={resource.id} height="44px" />
            </span>
            <ResourceAttribute description="Address">{resourceAttributes.address}</ResourceAttribute>

            {resourceAttributes.phoneNumbers.map(p => {
              const description = `Phone (${p.name})`;

              return (
                <ResourceAttribute key={p.number} description={description}>
                  {[p.number, p.description].filter(Boolean).join('\n')}
                </ResourceAttribute>
              );
            })}
            <ResourceAttribute description="Phone (Fax)">{resourceAttributes.phoneFax}</ResourceAttribute>
            <ResourceAttribute description="Email">{resourceAttributes.emailAddress}</ResourceAttribute>
            <ResourceAttribute description="Operating Hours">
              {resourceAttributes.hoursFormatted || resourceAttributes.hoursOfOperation || '-'}
            </ResourceAttribute>
          </ResourceAttributesColumn>
        </ResourceAttributesContainer>
      )}
    </>
  );
};

export default ResourceAttributes;
