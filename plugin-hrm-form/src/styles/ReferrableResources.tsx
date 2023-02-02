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

import { styled } from '@twilio/flex-ui';

import { Column, Flex, FontOpenSans, Row } from './HrmStyles';

export const ReferrableResourcesContainer = styled(Flex)`
  margin: 5px;
  max-width: 800px;
  width: 100%;
`;
ReferrableResourcesContainer.displayName = 'ReferrableResourcesContainer';

export const ResourceTitle = styled('p')`
  color: #192b33;
  font-family: Inter, sans-serif;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
`;
ResourceTitle.displayName = 'ResourceTitle';

export const ViewResourceArea = styled('div')`
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  overflow-y: auto;
`;
ViewResourceArea.displayName = 'ViewResourceArea';

export const ResourceAttributesContainer = styled(Row)`
  align-items: start;
`;
ResourceAttributesContainer.displayName = 'ResourceAttributesContainer';

export const ResourceAttributesColumn = styled(Column)`
  flex: 1;
  margin: 5px;
`;

export const ResourceAttributeDescription = styled(FontOpenSans)`
  color: #8b8b8b;
  font-size: 14px;
  line-height: 20px;
`;
ResourceAttributeDescription.displayName = 'ResourceAttributeDescription';

export const ResourceAttributeContent = styled(FontOpenSans)`
  color: #192b33;
  font-size: 14px;
`;
ResourceAttributeContent.displayName = 'ResourceAttributeContent';

export const ResourceCategoriesContainer = styled(Row)`
  flex-wrap: wrap;
`;
ResourceCategoriesContainer.displayName = 'ResourceCategoriesContainer';
