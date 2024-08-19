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

import { ChipBase, FontOpenSans } from '../../styles';

/**
 * Agent Column
 */

export const AgentFullName = styled(FontOpenSans)`
  font-size: 14px;
  font-weight: 700;
`;
AgentFullName.displayName = 'AgentFullName';

/**
 * Status Column
 */
export const StatusActivityName = styled(FontOpenSans)`
  font-size: 12px;
  width: 85px;
`;
StatusActivityName.displayName = 'StatusActivityName';

export const SkillsList = styled('div')`
  padding: 8px 8px 0px 0;
  margin-bottom: 6px;
`;
SkillsList.displayName = 'SkillsList';

/**
 * Teams View Styled Chip for Skills(enabled/active and disabled skills) and Labels
 */
const statusStyles = {
  active: {
    bgColor: '#E8F8EB',
    fontColor: '#146C2E',
    borderColor: '#17BD38',
    borderStyle: 'solid',
  },
  disabled: {
    bgColor: '#F5F5F7',
    fontColor: '#606B85',
    borderColor: '#606B85',
    borderStyle: 'dashed',
  },
  label: {
    bgColor: '#FAF7FD',
    fontColor: '#4A10A7',
    borderColor: '#E7DCFA',
    borderStyle: 'solid',
  },
};

type StyledChipProps = {
  chipType: 'active' | 'disabled' | 'label';
};

export const StyledChip = styled(ChipBase)<StyledChipProps>`
  border-radius: 4px;
  margin: 4px 6px 1px 0px;
  line-height: normal;
  padding: 2px 10px;
  border-width: 1px;
  font-size: 12px;
  background-color: ${props => statusStyles[props.chipType].bgColor};
  color: ${props => statusStyles[props.chipType].fontColor};
  border-style: ${props => statusStyles[props.chipType].borderStyle};
  border-color: ${props => statusStyles[props.chipType].borderColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
StyledChip.displayName = 'StyledChip';
