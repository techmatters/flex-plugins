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

import { CategoryChip, ChipText } from '../../styles';

const renderTag = (tag: string, color: string) => (
  <CategoryChip color={color}>
    <ChipText>{tag}</ChipText>
  </CategoryChip>
);

type Props = {
  category: string;
  fullyQualifiedName: string;
  color?: string;
};

const CategoryWithTooltip: React.FC<Props> = ({ category, fullyQualifiedName, color = '#000000' }) => {
  return (
    <Tooltip data-testid="CaseDetails-CategoryTooltip" title={fullyQualifiedName}>
      {renderTag(category, color)}
    </Tooltip>
  );
};

CategoryWithTooltip.displayName = 'CategoryWithTooltip';

export default CategoryWithTooltip;
