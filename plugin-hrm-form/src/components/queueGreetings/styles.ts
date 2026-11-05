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

import { selectedTaskListItemBorder, selectedTaskListItemBorderWidth } from '../../styles/HrmTheme';
import { PillButton } from '../../design-system/pills/Pill';

const taskListItemHoverStyle = `
  background-color: rgb(225, 227, 234);
  background-blend-mode: color;
`;

type GuidancePillContainerProps = {
  isSelected: boolean;
};

/**
 * When the task is selected, this container continues the task list item's outline around the pill:
 * it draws the side and bottom borders, and overlaps the item's bottom border to hide it.
 */
export const GuidancePillContainer = styled('div')<GuidancePillContainerProps>`
  box-sizing: border-box;
  width: 100%;
  background-color: ${({ isSelected }) => (isSelected ? 'rgb(255, 255, 255)' : 'inherit')};
  ${({ isSelected }) =>
    isSelected &&
    `
    position: relative;
    margin-top: -${selectedTaskListItemBorderWidth};
    border: ${selectedTaskListItemBorder};
    border-top: none;
  `}

  /*
   * The pill row and its task list item (the previous sibling, rendered by Flex) share the hover state:
   * hovering either of them highlights both.
   */
  &:hover,
  .Twilio-TaskListBaseItem:hover + & {
    ${taskListItemHoverStyle}
  }

  .Twilio-TaskListBaseItem:has(+ &:hover) {
    ${taskListItemHoverStyle}
  }
`;
GuidancePillContainer.displayName = 'GuidancePillContainer';

// Places the design system's pill within the pill row
export const GreetingPill = styled(PillButton)`
  display: inline-block;
  margin: 0 0 12px 16px;
`;
GreetingPill.displayName = 'GreetingPill';

export const GreetingPopoverAnchor = styled('div')`
  width: 100%;
  height: 0;
`;
GreetingPopoverAnchor.displayName = 'GreetingPopoverAnchor';
