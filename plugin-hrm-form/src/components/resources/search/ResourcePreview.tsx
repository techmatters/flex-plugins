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
import { PreviewHeaderText, PreviewRow, PreviewWrapper, StyledLink } from '../../../styles/search';
import { ReferrableResourceResult } from '../../../states/resources/search';
import {
  ResourceAttributeContent,
  ResourceAttributeDescription,
  ResourceAttributesColumn,
  ResourceCategoriesContainer,
} from '../../../styles/ReferrableResources';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';

type OwnProps = {
  resourceResult: ReferrableResourceResult;
  onClickViewResource: () => void;
};

type Props = OwnProps;

const ResourcePreview: React.FC<Props> = ({ resourceResult, onClickViewResource }) => {
  const {
    name,
    attributes: { Phone, Address, 'Ages Served': Ages, Hours, 'Service Categories': ServiceCategories },
  } = resourceResult;
  type Category = { id: string; value: string; color: string };
  return (
    <Flex>
      <PreviewWrapper>
        <div>
          <PreviewRow>
            <Flex justifyContent="space-between" width="100%">
              <Flex style={{ minWidth: 'fit-content' }}>
                <StyledLink
                  underline={true}
                  style={{ minWidth: 'inherit', marginInlineEnd: 10 }}
                  onClick={onClickViewResource}
                >
                  <PreviewHeaderText style={{ textDecoration: 'underline', fontSize: '18px' }}>
                    {name}
                  </PreviewHeaderText>
                </StyledLink>
              </Flex>
            </Flex>
          </PreviewRow>
          <PreviewRow>
            <ResourceAttributeDescription>
              {Phone && (
                <>
                  <PhoneIcon fontSize="inherit" style={{ color: '#616C864D', marginRight: 5, marginBottom: -2 }} />
                  {Phone}
                </>
              )}
              {Phone && Address && ' | '}
              {Address}
            </ResourceAttributeDescription>
          </PreviewRow>
        </div>
        <PreviewRow>
          <ResourceAttributesColumn style={{ alignSelf: 'baseline' }}>
            <Box marginTop="8px" marginBottom="8px">
              <Column>
                <Box marginBottom="6px">
                  {/* eslint-disable-next-line react/jsx-max-depth */}
                  <ResourceAttributeDescription>Hours</ResourceAttributeDescription>
                </Box>
                {(Hours as string[]).map((dayHours, ordinal) => (
                  <ResourceAttributeContent key={ordinal}>{dayHours}</ResourceAttributeContent>
                ))}
              </Column>
            </Box>
          </ResourceAttributesColumn>
          <ResourceAttributesColumn style={{ alignSelf: 'baseline' }}>
            <Box marginTop="8px" marginBottom="8px">
              <Column>
                <Box marginBottom="6px">
                  <ResourceAttributeDescription>Ages</ResourceAttributeDescription>
                </Box>
                <ResourceAttributeContent>{Ages}</ResourceAttributeContent>
              </Column>
            </Box>
          </ResourceAttributesColumn>
        </PreviewRow>
        <ResourceCategoriesContainer>
          {(ServiceCategories as Category[]).map(c => (
            <Box key={`category-tag-${c.value}`} marginRight="8px" marginBottom="8px">
              <CategoryWithTooltip category={c.value} color={c.color} fitTag={false} />
            </Box>
          ))}
        </ResourceCategoriesContainer>
      </PreviewWrapper>
    </Flex>
  );
};

ResourcePreview.displayName = 'ResourcePreview';

export default ResourcePreview;
