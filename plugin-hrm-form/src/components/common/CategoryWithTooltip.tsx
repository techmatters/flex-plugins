import React from 'react';
import { Tooltip } from '@material-ui/core';

import { ContactTag, TagMiddleDot, TagText } from '../../styles/search';

/**
 * Given a category, truncates it (if necessary) to make it fit (aprox) in the space of 'UNSPECIFIED/OTHER' string
 * @param {string} category
 */
export const getTag = category =>
  category.length > 17 && !category.toUpperCase().includes('UNSPECIFIED/OTHER')
    ? `${category.substring(0, 15).trim()}...`
    : category.substring(0, 17).trim();

// eslint-disable-next-line react/display-name
const renderTag = (tag: string, color: string) => (
  <ContactTag color={color}>
    <TagMiddleDot color={color} />
    <TagText color={color}>{tag}</TagText>
  </ContactTag>
);

type Props = {
  category: string;
  color?: string;
  fitTag?: boolean;
};

const CategoryWithTooltip: React.FC<Props> = ({ category, color, fitTag = true }) => {
  const tag = fitTag ? getTag(category) : category;

  return <Tooltip title={category}>{renderTag(tag, color)}</Tooltip>;
};

CategoryWithTooltip.displayName = 'CategoryWithTooltip';

CategoryWithTooltip.defaultProps = {
  color: '#000000',
};

export default CategoryWithTooltip;
