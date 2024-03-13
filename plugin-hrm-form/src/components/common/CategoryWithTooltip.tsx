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
import { Tooltip, withStyles } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import DisabledIcon from '@material-ui/icons/Block';

import { CategoryPillContainer, TagMiddleDot, PillText } from '../search/styles';

const withSmallIcon = Icon => {
  return withStyles({
    root: {
      fontSize: '0.8rem',
    },
  })(Icon);
};

const SmallCheckIcon = withSmallIcon(CheckIcon);
const SmallDisabledIcon = withSmallIcon(DisabledIcon);

/**
 * Given a category, truncates it (if necessary) to make it fit (aprox) in the space of 'UNSPECIFIED/OTHER' string
 * @param {string} category
 */
export const getTag = category =>
  category.length > 17 && !category.toUpperCase().includes('UNSPECIFIED/OTHER')
    ? `${category.substring(0, 15).trim()}...`
    : category.substring(0, 17).trim();

// eslint-disable-next-line react/display-name
const renderTag = (tag: string, color: string, skillType?: 'active' | 'disabled' | null) => (
  <CategoryPillContainer color={color} border={skillType !== null && color}>
    {skillType === null && <TagMiddleDot color={color} />}
    {skillType === 'active' && <SmallCheckIcon htmlColor={color} fontSize="small" />}
    {skillType === 'disabled' && <SmallDisabledIcon htmlColor={color} fontSize="small" />}
    <PillText color={color}>{tag}</PillText>
  </CategoryPillContainer>
);

type Props = {
  category: string;
  color?: string;
  fitTag?: boolean;
  skillType?: 'active' | 'disabled' | null;
};

const CategoryWithTooltip: React.FC<Props> = ({ category, color = '#000000', fitTag = true, skillType = null }) => {
  const tag = fitTag ? getTag(category) : category;

  return <Tooltip title={category}>{renderTag(tag, color, skillType)}</Tooltip>;
};

CategoryWithTooltip.displayName = 'CategoryWithTooltip';

export default CategoryWithTooltip;
