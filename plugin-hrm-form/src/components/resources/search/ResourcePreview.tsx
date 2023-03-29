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
import PhoneIcon from '@material-ui/icons/Phone';

import { Box, Column, Flex } from '../../../styles/HrmStyles';
import {
  ResourceAttributeContent,
  ResourceAttributeDescription,
  ResourceAttributesColumn,
  ResourceCategoriesContainer,
  ResourcePreviewHeaderText,
  ResourcePreviewWrapper,
} from '../../../styles/ReferrableResources';
import { PreviewRow, StyledLink } from '../../../styles/search';
import { ReferrableResourceResult } from '../../../states/resources/search';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import ResourceIdCopyButton from '../ResourceIdCopyButton';
import { convertKHPResourceAttributes } from '../convertKHPResourceAttributes';
import OperatingHours from './resourceView/OperatingHours';

type OwnProps = {
  resourceResult: ReferrableResourceResult;
  onClickViewResource: () => void;
};

type Props = OwnProps;

const ResourcePreview: React.FC<Props> = ({ resourceResult, onClickViewResource }) => {
  const { id, name } = resourceResult;
  const resourceAttributes = convertKHPResourceAttributes(resourceResult.attributes, 'en');
  const { operations, ageRange, primaryLocation } = resourceAttributes;

  // type Category = { id: string; value: string; color: string };
  return (
    <Flex>
      <ResourcePreviewWrapper>
        <div>
          <PreviewRow>
            <Flex justifyContent="space-between" style={{ minWidth: 'fit-content' }}>
              <StyledLink underline={true} style={{ width: '70%', marginInlineEnd: 10 }} onClick={onClickViewResource}>
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
          <ResourceAttributesColumn style={{ alignSelf: 'baseline' }}>
            <Box marginTop="8px" marginBottom="8px">
              <Column>
                <Box marginBottom="6px">
                  <ResourceAttributeDescription>Hours</ResourceAttributeDescription>
                </Box>
                <OperatingHours operations={operations} showDescriptionOfHours={false} />
              </Column>
            </Box>
          </ResourceAttributesColumn>
          <ResourceAttributesColumn style={{ alignSelf: 'baseline' }}>
            <Box marginTop="8px" marginBottom="8px">
              <Column>
                <Box marginBottom="6px">
                  <ResourceAttributeDescription>Contact Info</ResourceAttributeDescription>
                  <ResourceAttributeContent>
                    {/* {`${mainContact.name}\n${mainContact.title}\n${mainContact.phoneNumber}\n${mainContact.email}`} */}
                    {primaryLocation}
                  </ResourceAttributeContent>

                  <ResourceAttributeDescription>Ages Served</ResourceAttributeDescription>
                  <ResourceAttributeContent>{ageRange}</ResourceAttributeContent>
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
