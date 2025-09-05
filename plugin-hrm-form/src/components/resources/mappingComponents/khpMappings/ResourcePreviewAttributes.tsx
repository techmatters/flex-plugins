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
import { Box, Column } from '../../../../styles';
import {
  ResourceAttributesColumn,
  ResourcePreviewAttributeContent,
  ResourcePreviewAttributeDescription,
} from '../../styles';
import { PreviewRow } from '../../../search/styles';
import OperatingHours from './OperatingHours';
import { convertKHPResourceAttributes } from './convertKHPResourceAttributes';

const ResourcePreview: React.FC<{ resource: ReferrableResource }> = ({ resource }) => {
  const resourceAttributes = convertKHPResourceAttributes(resource.attributes, 'en');

  return (
    <PreviewRow>
      <ResourceAttributesColumn style={{ paddingLeft: 0, marginLeft: 0, alignSelf: 'baseline' }}>
        <Box marginTop="8px" marginBottom="8px">
          <Column>
            <Box marginBottom="6px">
              <ResourcePreviewAttributeDescription>
                <Template code="Resources-Search-Preview-OperatingHours" />
              </ResourcePreviewAttributeDescription>
            </Box>
            <OperatingHours operations={resourceAttributes.operations} showDescriptionOfHours={false} />
          </Column>
        </Box>
      </ResourceAttributesColumn>
      <ResourceAttributesColumn style={{ alignSelf: 'baseline' }}>
        <Box marginTop="8px" marginBottom="8px">
          <Column>
            <Box marginBottom="6px">
              <ResourcePreviewAttributeDescription>
                <Template code="Resources-Search-Preview-PrimaryAddress" />
              </ResourcePreviewAttributeDescription>
              <ResourcePreviewAttributeContent>{resourceAttributes.primaryLocation}</ResourcePreviewAttributeContent>
              <br />
              <ResourcePreviewAttributeDescription>
                <Template code="Resources-Search-Preview-AgesServed" />
              </ResourcePreviewAttributeDescription>
              <ResourcePreviewAttributeContent>{resourceAttributes.ageRange}</ResourcePreviewAttributeContent>
            </Box>
          </Column>
        </Box>
      </ResourceAttributesColumn>
    </PreviewRow>
  );
};

export default ResourcePreview;
