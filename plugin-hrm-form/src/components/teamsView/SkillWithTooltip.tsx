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
  let bgColor;
  let fontColor;
  if (skillType === 'active') {
    bgColor = '#17bd38';
    fontColor = '#146C2E';
  } else {
    bgColor = '#d3d3da';
    fontColor = '#606B85';
  }

  return (
    <SkillPill color={bgColor}>
      {skillType === 'active' && <SmallCheckIcon htmlColor={fontColor} />}
      {skillType === 'disabled' && <SmallDisabledIcon htmlColor={fontColor} />}
      <PillText bold color={fontColor}>
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
