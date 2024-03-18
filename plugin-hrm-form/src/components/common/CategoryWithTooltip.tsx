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
import { Tooltip } from '@material-ui/core';

import { CategoryChip, TagMiddleDot, ChipText } from '../../styles';

/**
 * Given a category, truncates it (if necessary) to make it fit (aprox) in the space of 'UNSPECIFIED/OTHER' string
 * @param {string} category
 */
export const truncateLabel = category =>
  category.length > 17 && !category.toUpperCase().includes('UNSPECIFIED/OTHER')
    ? `${category.substring(0, 15).trim()}...`
    : category.substring(0, 17).trim();

const renderTag = (tag: string, color: string) => (
  <CategoryChip color={color}>
    <TagMiddleDot color={color} />
    <ChipText>{tag}</ChipText>
  </CategoryChip>
);

type Props = {
  category: string;
  color?: string;
  fitTag?: boolean;
};

const CategoryWithTooltip: React.FC<Props> = ({ category, color = '#000000', fitTag = true }) => {
  const tag = fitTag ? truncateLabel(category) : category;

  return <Tooltip title={category}>{renderTag(tag, color)}</Tooltip>;
};

CategoryWithTooltip.displayName = 'CategoryWithTooltip';

export default CategoryWithTooltip;
