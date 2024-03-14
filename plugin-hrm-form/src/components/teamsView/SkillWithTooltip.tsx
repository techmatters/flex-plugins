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

import { truncateLabel } from '../common/CategoryWithTooltip';
import { SkillPill, SmallCheckIcon, SmallDisabledIcon } from './styles';
import { PillText } from '../../styles';

const renderTag = (tag: string, skillType?: 'active' | 'disabled') => {
  let color;
  if (skillType === 'active') {
    color = '#17bd38';
  } else {
    color = '#d3d3da';
  }

  return (
    <SkillPill color={color}>
      {skillType === 'active' && <SmallCheckIcon htmlColor="#146C2E" />}
      {skillType === 'disabled' && <SmallDisabledIcon htmlColor={color} />}
      <PillText bold color={skillType === 'active' ? '#146C2E' : '#0d0c0c'}>
        {tag}
      </PillText>
    </SkillPill>
  );
};

type Props = {
  skill: string;
  fitTag?: boolean;
  skillType?: 'active' | 'disabled';
};

const SkillWithTooltip: React.FC<Props> = ({ skill, fitTag = true, skillType }) => {
  const tag = fitTag ? truncateLabel(skill) : skill;

  return <Tooltip title={skill}>{renderTag(tag, skillType)}</Tooltip>;
};

SkillWithTooltip.displayName = 'SkillWithTooltip';

export default SkillWithTooltip;
