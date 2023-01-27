import React from 'react';

import { Box, Column } from '../../styles/HrmStyles';
import {
  ResourceAttributeContent,
  ResourceAttributeDescription,
  ResourceCategoriesContainer,
} from '../../styles/ReferrableResources';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import type { ReffarebleResourceAttributeValue } from '../../services/ResourceService';
import ExpandableAttributeContent from './ExpandableAttributeContent';

type Props = {
  description: string;
  content: ReffarebleResourceAttributeValue;
};

const isString = (s: any): s is string => typeof s === 'string';

type Category = { id: string; value: string; color: string };
const isCategory = (c: any): c is Category =>
  c && isString(c.id) && isString(c.value) && (isString(c.color) || !c.color);

const ResourceAttribute: React.FC<Props> = ({ description, content }) => {
  const renderContent = () => {
    if (typeof content === 'string') {
      return <ExpandableAttributeContent expandLinkText="ReadMore" collapseLinkText="ReadLess" content={content} />;
    }

    if (Array.isArray(content)) {
      // typecasting content as any because of https://github.com/microsoft/TypeScript/issues/36390 =)

      if ((content as any[]).every(isString)) {
        return (content as string[]).join('\n');
      }

      if ((content as any[]).every(isCategory)) {
        return (
          <ResourceCategoriesContainer>
            {(content as Category[]).map(c => (
              <Box key={`category-tag-${c.value}`} marginRight="8px" marginBottom="8px">
                <CategoryWithTooltip category={c.value} color={c.color} fitTag={false} />
              </Box>
            ))}
          </ResourceCategoriesContainer>
        );
      }
    }

    return null;
  };

  return (
    <Box marginTop="8px" marginBottom="8px">
      <Column>
        <Box marginBottom="6px">
          <ResourceAttributeDescription>{description}</ResourceAttributeDescription>
        </Box>
        <ResourceAttributeContent>{renderContent()}</ResourceAttributeContent>
      </Column>
    </Box>
  );
};

ResourceAttribute.displayName = 'ResourceAttribute';

export default ResourceAttribute;
