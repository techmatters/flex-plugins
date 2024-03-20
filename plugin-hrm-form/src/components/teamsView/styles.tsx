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
import { withStyles } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import DisabledIcon from '@material-ui/icons/Block';

import { ChipBase } from '../../styles';
import { StyledLink } from '../search/styles';

type SkillChipProps = {
  color: string;
  disabledSkill?: boolean;
};
export const SkillChipStyled = styled(ChipBase)<SkillChipProps>`
  border-radius: 4px;
  margin: 4px 0 4px 7px;
  padding: 4px 8px;
  background-color: ${props => (props.color ? `${props.color}1a` : '#d8d8d8')};
  border-width: 1px;
  border-style: ${props => (props.disabledSkill ? 'dashed' : 'solid')};
  border-color: ${props => (props.disabledSkill ? '#606B85' : '#17bd38')};
`;
SkillChipStyled.displayName = 'SkillChipStyled';

const withSmallIcon = Icon => {
  return withStyles({
    root: {
      fontSize: '1.1rem',
      paddingRight: '4px',
    },
  })(Icon);
};

export const SmallCheckIcon = withSmallIcon(CheckIcon);
export const SmallDisabledIcon = withSmallIcon(DisabledIcon);

export const SkillsCell = styled('div')`
  padding: 8px 0;
`;
SkillsCell.displayName = 'SkillsCell';
