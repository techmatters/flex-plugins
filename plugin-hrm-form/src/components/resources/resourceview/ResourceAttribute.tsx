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

import { Box, Column } from '../../../styles/HrmStyles';
import {
  ResourceAttributeContent,
  ResourceAttributeDescription,
  ResourceCategoriesContainer,
} from '../../../styles/ReferrableResources';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import type { ReferrableResourceAttributeValue } from '../../../services/ResourceService';
import ExpandableAttributeContent from './ExpandableAttributeContent';

type Props = {
  description: string;
  content?: ReferrableResourceAttributeValue | JSX.Element;
  isExpandable?: boolean;
};

const isString = (s: any): s is string => typeof s === 'string';

type Category = { id: string; value: string; color: string };
const isCategory = (c: any): c is Category =>
  c && isString(c.id) && isString(c.value) && (isString(c.color) || !c.color);

const ResourceAttribute: React.FC<Props> = ({ description, children, isExpandable }) => {
  const renderContent = () => {
    if (typeof children === 'string' && isExpandable === true) {
      return <ExpandableAttributeContent expandLinkText="ReadMore" collapseLinkText="ReadLess" content={children} />;
    }

    /*
     *   if ((content as any[]).every(isCategory)) {
     *     return (
     *       <ResourceCategoriesContainer>
     *         {(content as Category[]).map(c => (
     *           <Box key={`category-tag-${c.value}`} marginRight="8px" marginBottom="8px">
     *             <CategoryWithTooltip category={c.value} color={c.color} fitTag={false} />
     *           </Box>
     *         ))}
     *       </ResourceCategoriesContainer>
     *     );
     *   }
     * }
     */

    return children;
  };

  return (
    <Box marginTop="8px" marginBottom="10px">
      <Column>
        <Box marginBottom="4px">
          <ResourceAttributeDescription>{description}</ResourceAttributeDescription>
        </Box>
        <ResourceAttributeContent>{renderContent()}</ResourceAttributeContent>
      </Column>
    </Box>
  );
};

ResourceAttribute.displayName = 'ResourceAttribute';

export default ResourceAttribute;
