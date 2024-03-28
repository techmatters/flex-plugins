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
import { styled } from '@twilio/flex-ui';

import { Box, FontOpenSans } from '../../styles';
import HrmTheme from '../../styles/HrmTheme';

export const TabbedFormsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
TabbedFormsContainer.displayName = 'TabbedFormsContainer';

type TabbedFormTabContainerProps = {
  display: boolean;
};

export const TabbedFormTabContainer = styled(({ display, ...rest }: TabbedFormTabContainerProps) => <Box {...rest} />)<
  TabbedFormTabContainerProps
>`
  padding: 32px 20px 12px 20px;
  background-color: white;
  display: ${({ display }) => (display ? 'block' : 'none')};
  height: ${({ display }) => (display ? '100%' : '0px')};
`;
TabbedFormTabContainer.displayName = 'TabbedFormTabContainer';

export const AddedToCaseButton = styled('p')`
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: normal;
  color: ${HrmTheme.colors.secondaryButtonTextColor};
  border: none;
  padding: 4px 10px;
  min-width: auto;
`;
AddedToCaseButton.displayName = 'AddedToCaseButton';

export const CSAMReportButtonText = styled(FontOpenSans)`
  font-size: 12px;
  color: ${HrmTheme.colors.hyperlinkColor};
  font-weight: 600;
`;
CSAMReportButtonText.displayName = 'CSAMReportButtonText';

export const StyledCSAMReportDropdown = styled('ul')`
  position: absolute;
  right: 0;
  left: auto;
  box-shadow: 0 10px 15px -3px rgba(46, 41, 51, 0.08), 0 4px 6px -2px rgba(71, 63, 79, 0.16);
  font-size: 0.875rem;
  z-index: 9999;
  min-width: 10rem;
  padding: 10px 100px 10px 24px;
  list-style: none;
  background-color: #fff;
  border-radius: 0 0 5px 5px;
  margin-right: 20px;
`;

StyledCSAMReportDropdown.displayName = 'StyledCSAMReportDropdown';

export const StyledCSAMReportDropdownList = styled('button')`
  position: relative;
  font-size: 14px;
  display: block;
  color: inherit;
  min-width: 10rem;
  width: 215px;
  padding: 7px 0 7px 0;
  margin: 0 -100px 0 -25px;
  text-decoration: none;
  &:hover {
    background-color: #f2f2f2;
    cursor: pointer;
  }
  background: none;
  border: none;
`;
StyledCSAMReportDropdownList.displayName = 'StyledCSAMReportDropdownList';
