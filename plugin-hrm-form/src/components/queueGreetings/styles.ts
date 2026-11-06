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

const guidanceBackground = '#fffeef';
const textColor = '#192b33';

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

export const GuidancePill = styled('button')`
  display: inline-block;
  cursor: pointer;
  margin: 0 0 12px 16px;
  padding: 4px 8px;
  background-color: ${guidanceBackground};
  border: 1px solid #fff1b3;
  border-radius: 4px;
  font-family: 'Open Sans';
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: 0.2px;
  color: ${textColor};
  white-space: nowrap;
`;
GuidancePill.displayName = 'GuidancePill';

export const GuidancePopoverAnchor = styled('div')`
  width: 100%;
  height: 0;
`;
GuidancePopoverAnchor.displayName = 'GuidancePopoverAnchor';

export const GuidancePopoverContainer = styled('section')`
  box-sizing: border-box;
  width: 315px;
  padding: 24px 24px 24px 28px;
  background-color: ${guidanceBackground};
  border: 1px solid #e0e3ea;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  font-family: 'Open Sans';
`;
GuidancePopoverContainer.displayName = 'GuidancePopoverContainer';

export const GuidancePopoverHeader = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
`;
GuidancePopoverHeader.displayName = 'GuidancePopoverHeader';

export const GuidancePopoverTitle = styled('h2')`
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${textColor};
`;
GuidancePopoverTitle.displayName = 'GuidancePopoverTitle';

export const GuidancePopoverContent = styled('p')`
  margin: 0;
  font-size: 14px;
  font-style: italic;
  color: #000;
  overflow-wrap: break-word;
`;
GuidancePopoverContent.displayName = 'GuidancePopoverContent';
