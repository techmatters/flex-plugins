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

import { getTag } from '../common/CategoryWithTooltip';
import { SkillPill, SmallCheckIcon, SmallDisabledIcon } from './styles';
import { PillText } from '../../styles';

const renderTag = (tag: string, color: string, skillType?: 'active' | 'disabled') => (
  <SkillPill color={color}>
    {skillType === 'active' && <SmallCheckIcon htmlColor={color} />}
    {skillType === 'disabled' && <SmallDisabledIcon htmlColor={color} />}
    <PillText color={color}>{tag}</PillText>
  </SkillPill>
);

type Props = {
  skill: string;
  color?: string;
  fitTag?: boolean;
  skillType?: 'active' | 'disabled' | null;
};

const SkillWithTooltip: React.FC<Props> = ({ skill, color, fitTag = true, skillType = null }) => {
  const tag = fitTag ? getTag(skill) : skill;

  return <Tooltip title={skill}>{renderTag(tag, color, skillType)}</Tooltip>;
};

SkillWithTooltip.displayName = 'SkillWithTooltip';

export default SkillWithTooltip;
