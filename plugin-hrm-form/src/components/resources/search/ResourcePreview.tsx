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
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { Box, Column, Flex } from '../../../styles/HrmStyles';
import {
  ResourceAttributesColumn,
  ResourcePreviewAttributeContent,
  ResourcePreviewAttributeDescription,
  ResourcePreviewHeaderText,
  ResourcePreviewWrapper,
} from '../styles';
import { PreviewRow, StyledLink } from '../../../styles/search';
import { isMissingResource, ReferrableResourceResult } from '../../../states/resources/search';
import ResourceIdCopyButton from '../ResourceIdCopyButton';
import { convertKHPResourceAttributes } from '../convertKHPResourceAttributes';
import OperatingHours from '../resourceView/OperatingHours';

type OwnProps = {
  resourceResult: ReferrableResourceResult;
  onClickViewResource: () => void;
};

type Props = OwnProps;

const ResourcePreview: React.FC<Props> = ({ resourceResult, onClickViewResource }) => {
  if (isMissingResource(resourceResult)) {
    // We could put a placeholder here, but it's probably better to just not show anything
    return <hr style={{ width: '100%', height: '3px', opacity: 0.3 }} />;
  }
  const { id, name, attributes } = resourceResult;

  const resourceAttributes = convertKHPResourceAttributes(attributes, 'en');

  const { operations, ageRange, primaryLocation } = resourceAttributes;

  // type Category = { id: string; value: string; color: string };
  return (
    <Flex>
      <ResourcePreviewWrapper>
        <div>
          <PreviewRow>
            <Flex justifyContent="space-between" style={{ width: '100%' }}>
              <StyledLink
                underline={true}
                style={{ width: '70%', marginInlineEnd: 10, justifyContent: 'left' }}
                onClick={onClickViewResource}
                data-testid="resource-name"
              >
                <ResourcePreviewHeaderText>{name}</ResourcePreviewHeaderText>
              </StyledLink>
              {/* </Flex>*/}
              <Flex style={{ justifyContent: 'flex-end' }}>
                <ResourceIdCopyButton resourceId={id} />
              </Flex>
            </Flex>
          </PreviewRow>
        </div>
        <PreviewRow>
          <ResourceAttributesColumn style={{ paddingLeft: 0, marginLeft: 0, alignSelf: 'baseline' }}>
            <Box marginTop="8px" marginBottom="8px">
              <Column>
                <Box marginBottom="6px">
                  <ResourcePreviewAttributeDescription>
                    <Template code="Resources-Search-Preview-OperatingHours" />
                  </ResourcePreviewAttributeDescription>
                </Box>
                <OperatingHours operations={operations} showDescriptionOfHours={false} />
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
                  <ResourcePreviewAttributeContent>{primaryLocation}</ResourcePreviewAttributeContent>
                  <br />
                  <ResourcePreviewAttributeDescription>
                    <Template code="Resources-Search-Preview-AgesServed" />
                  </ResourcePreviewAttributeDescription>
                  <ResourcePreviewAttributeContent>{ageRange}</ResourcePreviewAttributeContent>
                </Box>
              </Column>
            </Box>
          </ResourceAttributesColumn>
        </PreviewRow>
        {/* <ResourceCategoriesContainer>
          {(ServiceCategories as Category[]).map(c => (
            <Box key={`category-tag-${c.value}`} marginRight="8px" marginBottom="8px">
              <CategoryWithTooltip category={c.value} color={c.color} fitTag={false} />
            </Box>
          ))}
        </ResourceCategoriesContainer> */}
      </ResourcePreviewWrapper>
    </Flex>
  );
};

ResourcePreview.displayName = 'ResourcePreview';

export default ResourcePreview;
